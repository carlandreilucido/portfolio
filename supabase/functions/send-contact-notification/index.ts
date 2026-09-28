type EnvironmentReader = (name: string) => string | undefined;
type FetchClient = typeof fetch;

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
};

type WebhookPayload = {
  type: string;
  table: string;
  schema: string;
  record: unknown;
};

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_SENDER = "Portfolio Contact <onboarding@resend.dev>";
const EMAIL_PATTERN =
  /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)+$/i;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBoundedString(
  value: unknown,
  minimum: number,
  maximum: number,
): value is string {
  return typeof value === "string" && value.trim().length >= minimum &&
    value.length <= maximum;
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[character];
  });
}

export function getContactMessage(payload: unknown): ContactMessage | null {
  if (!isObject(payload)) {
    return null;
  }

  const webhook = payload as WebhookPayload;
  if (
    webhook.type !== "INSERT" || webhook.schema !== "public" ||
    webhook.table !== "contact_messages"
  ) {
    return null;
  }

  if (!isObject(webhook.record)) {
    return null;
  }

  const record = webhook.record;
  if (
    !isBoundedString(record.id, 36, 36) ||
    !UUID_PATTERN.test(record.id) ||
    !isBoundedString(record.name, 2, 100) ||
    !isBoundedString(record.email, 3, 254) ||
    !EMAIL_PATTERN.test(record.email) ||
    !isBoundedString(record.subject, 3, 150) ||
    !isBoundedString(record.message, 10, 3000) ||
    !isBoundedString(record.created_at, 1, 64) ||
    Number.isNaN(Date.parse(record.created_at))
  ) {
    return null;
  }

  return {
    id: record.id,
    name: record.name.trim(),
    email: record.email.trim(),
    subject: record.subject.trim(),
    message: record.message.trim(),
    created_at: record.created_at,
  };
}

async function secretsMatch(
  received: string,
  expected: string,
): Promise<boolean> {
  const encoder = new TextEncoder();
  const [receivedHash, expectedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(received)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  const receivedBytes = new Uint8Array(receivedHash);
  const expectedBytes = new Uint8Array(expectedHash);
  let difference = 0;

  for (let index = 0; index < receivedBytes.length; index += 1) {
    difference |= receivedBytes[index] ^ expectedBytes[index];
  }

  return difference === 0;
}

function cleanSubject(subject: string): string {
  return subject.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
}

export function buildEmail(message: ContactMessage) {
  const safeName = escapeHtml(message.name);
  const safeEmail = escapeHtml(message.email);
  const safeSubject = escapeHtml(cleanSubject(message.subject));
  const safeMessage = escapeHtml(message.message).replace(/\r?\n/g, "<br>");
  const receivedAt = new Date(message.created_at).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  });

  return {
    subject: `New portfolio message: ${cleanSubject(message.subject)}`,
    text: [
      "New portfolio contact message",
      "",
      `Name: ${message.name}`,
      `Email: ${message.email}`,
      `Subject: ${cleanSubject(message.subject)}`,
      `Received: ${receivedAt} (Philippine time)`,
      "",
      message.message,
    ].join("\n"),
    html: `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#eef3fa;color:#10233f;font-family:Arial,sans-serif;padding:24px;">
    <main style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #cbd7e8;border-top:4px solid #1759c7;border-radius:10px;padding:28px;">
      <p style="margin:0 0 10px;color:#1759c7;font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;">New portfolio message</p>
      <h1 style="margin:0 0 24px;font-size:24px;line-height:1.3;">${safeSubject}</h1>
      <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:14px;">
        <tr><td style="width:90px;padding:7px 0;color:#65758c;vertical-align:top;">Name</td><td style="padding:7px 0;font-weight:700;">${safeName}</td></tr>
        <tr><td style="padding:7px 0;color:#65758c;vertical-align:top;">Email</td><td style="padding:7px 0;"><a href="mailto:${safeEmail}" style="color:#1759c7;">${safeEmail}</a></td></tr>
        <tr><td style="padding:7px 0;color:#65758c;vertical-align:top;">Received</td><td style="padding:7px 0;">${
      escapeHtml(receivedAt)
    } (Philippine time)</td></tr>
      </table>
      <div style="border-top:1px solid #d8e1ee;padding-top:20px;font-size:15px;line-height:1.7;overflow-wrap:anywhere;">${safeMessage}</div>
      <p style="margin:24px 0 0;color:#65758c;font-size:12px;">Reply to this email to respond directly to ${safeName}.</p>
    </main>
  </body>
</html>`,
  };
}

export function createHandler(
  readEnvironment: EnvironmentReader,
  fetchClient: FetchClient = fetch,
) {
  return async function handleContactWebhook(
    request: Request,
  ): Promise<Response> {
    if (request.method !== "POST") {
      return jsonResponse(405, { error: "Method not allowed" });
    }

    const resendApiKey = readEnvironment("RESEND_API_KEY");
    const contactEmail = readEnvironment("CONTACT_EMAIL");
    const webhookSecret = readEnvironment("WEBHOOK_SECRET");
    const sender = readEnvironment("RESEND_FROM") || DEFAULT_SENDER;

    if (
      !resendApiKey || !contactEmail || !EMAIL_PATTERN.test(contactEmail) ||
      !webhookSecret || webhookSecret.length < 24
    ) {
      console.error(
        "Contact email function is missing valid server-side configuration.",
      );
      return jsonResponse(500, { error: "Server configuration error" });
    }

    const receivedSecret = request.headers.get("x-webhook-secret") || "";
    if (
      !receivedSecret || !(await secretsMatch(receivedSecret, webhookSecret))
    ) {
      return jsonResponse(401, { error: "Unauthorized" });
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch (_error) {
      return jsonResponse(400, { error: "Invalid JSON payload" });
    }

    const contactMessage = getContactMessage(payload);
    if (!contactMessage) {
      return jsonResponse(422, { error: "Invalid contact message payload" });
    }

    const email = buildEmail(contactMessage);

    try {
      const resendResponse = await fetchClient(RESEND_ENDPOINT, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `portfolio-contact-${contactMessage.id}`,
        },
        body: JSON.stringify({
          from: sender,
          to: [contactEmail],
          reply_to: contactMessage.email,
          subject: email.subject,
          text: email.text,
          html: email.html,
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (!resendResponse.ok) {
        console.error(
          `Resend rejected a contact notification with status ${resendResponse.status}.`,
        );
        return jsonResponse(502, {
          error: "Email provider rejected the notification",
        });
      }

      const resendResult = await resendResponse.json() as { id?: string };
      return jsonResponse(200, { ok: true, emailId: resendResult.id || null });
    } catch (_error) {
      console.error("The contact notification request to Resend failed.");
      return jsonResponse(502, { error: "Email notification failed" });
    }
  };
}

if (typeof Deno !== "undefined") {
  const handler = createHandler((name) => Deno.env.get(name));
  Deno.serve(handler);
}
