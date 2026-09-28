# Carl Andrei Lucido - Developer Portfolio

A responsive personal portfolio for Carl Andrei Lucido, a third-year BS Computer Science student and web developer. The site presents Carl's background, technical skills, selected systems, and a Supabase-backed contact form in a focused single-page experience.

## Screenshots

The portfolio includes complete light and dark navy themes and responsive layouts for desktop, tablet, and mobile. The Food Ordering System uses a current capture of its live interface, while projects without public demos use custom HTML and CSS previews instead of stock imagery.

After deployment, current page captures can be added here for release documentation.

## Technology Stack

- HTML5
- CSS3
- JavaScript
- Bootstrap 5
- Bootstrap Icons
- Devicon
- Supabase JavaScript client and PostgreSQL
- Resend

No package manager, build process, PHP runtime, or JavaScript framework is required.

## Features

- Responsive space-inspired layout built with the Bootstrap grid
- Subtle fine-pointer glow with reduced-motion and touch-device safeguards
- Persistent light and dark themes with system preference detection
- Sticky navigation with an active-section indicator
- Automatically closing mobile navigation
- Accessible labels, focus states, landmarks, and reduced-motion support
- Four project cards with a real linked-project capture and honest placeholder states
- Working external demo link for the Food Ordering System
- Validated contact form with loading, success, and error states
- Anonymous contact message inserts through Supabase Row Level Security
- Resend email notifications through a protected Supabase Database Webhook and Edge Function
- Canonical, Open Graph, ProfilePage structured data, sitemap, robots, theme-color, and favicon metadata
- Static-hosting-compatible relative paths

## Project Structure

```text
portfolio/
|-- .gitignore
|-- index.html
|-- README.md
|-- robots.txt
|-- sitemap.xml
|-- assets/
|   |-- icons/
|   |   `-- favicon.svg
|   `-- images/
|       `-- projects/
|           `-- food-ordering-system.png
|-- css/
|   `-- style.css
|-- js/
|   |-- contact.js
|   |-- main.js
|   |-- supabase.js
|   `-- theme.js
|-- profile-pic/
|   `-- me.jpg (social and search profile image)
`-- supabase/
    |-- config.toml
    |-- functions/
    |   |-- .env.example
    |   `-- send-contact-notification/
    |       `-- index.ts
    `-- setup.sql
```

## Local Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/carlandreilucido/portfolio.git
   cd portfolio
   ```

2. Serve the folder with any static web server. For example:

   ```bash
   python -m http.server 8000
   ```

3. Open `http://localhost:8000` in a browser.

Opening `index.html` directly is sufficient for most visual checks, but a local server more closely matches production behavior.

## Supabase Setup

The frontend is configured for the supplied Supabase project in `js/supabase.js`. The public publishable key is intentionally safe for browser use when Row Level Security is configured correctly.

1. Sign in to [Supabase](https://supabase.com/) and open the relevant project.
2. Open **SQL Editor** and create a new query.
3. Copy the contents of `supabase/setup.sql` into the editor.
4. Select **Run**.
5. Confirm that `public.contact_messages` appears in **Table Editor**.
6. In **Authentication > Policies** or the table policy view, confirm that only the anonymous `INSERT` policy exists for this table.
7. Submit a test message from the portfolio and verify it in the Supabase dashboard.

The SQL creates a UUID primary key, a UTC-compatible timestamp, field length constraints, Row Level Security, and an anonymous insert-only policy. It does not grant anonymous read access.

## Resend Email Notifications

The form first saves each valid message in Supabase. An `INSERT` Database Webhook then calls `send-contact-notification`, which sends a notification through Resend. Keeping these steps separate means a message remains available in the Supabase dashboard even if the email provider is temporarily unavailable.

The Edge Function:

- accepts only `POST` requests from a caller with the configured webhook secret
- accepts only `INSERT` payloads for `public.contact_messages`
- validates field types, lengths, email format, UUID, and timestamp
- escapes all visitor-provided HTML
- sets the visitor's address as `Reply-To`
- uses the message UUID as a Resend idempotency key to prevent duplicate notifications
- keeps the Resend API key entirely on Supabase

### 1. Configure Edge Function Secrets

In the Supabase Dashboard, open **Edge Functions > Secrets** and add:

| Secret | Value |
| --- | --- |
| `RESEND_API_KEY` | The private API key created in Resend |
| `CONTACT_EMAIL` | `carlandreirubialucido@gmail.com` |
| `WEBHOOK_SECRET` | A random value at least 24 characters long |

Do not paste real secret values into `.env.example`, frontend JavaScript, Git, or GitHub. `RESEND_FROM` is optional. Without it, the function uses `Portfolio Contact <onboarding@resend.dev>`.

The Resend testing sender can send only to the email address associated with the Resend account. This works for `carlandreirubialucido@gmail.com` when that is the account email. After verifying a custom domain, add a `RESEND_FROM` secret such as `Portfolio Contact <contact@example.com>`.

### 2. Deploy the Edge Function

The easiest option without local tooling is the Supabase Dashboard:

1. Open **Edge Functions** and select **Deploy a new function > Via Editor**.
2. Name the function `send-contact-notification`.
3. Replace the editor contents with `supabase/functions/send-contact-notification/index.ts`.
4. Disable JWT verification for this function.
5. Select **Deploy function**.

Alternatively, install the [Supabase CLI](https://supabase.com/docs/guides/cli), then run:

```bash
supabase login
supabase link --project-ref wocbyyqcsqeronmpmqct
supabase functions deploy send-contact-notification --no-verify-jwt
```

JWT verification is disabled because the database webhook is a server-to-server request. The function still rejects requests unless `x-webhook-secret` matches the private `WEBHOOK_SECRET` stored in Supabase.

### 3. Create the Database Webhook

In the Supabase Dashboard, open **Database > Webhooks** and create a webhook with these settings:

| Setting | Value |
| --- | --- |
| Name | `email-contact-message` |
| Table | `public.contact_messages` |
| Event | `INSERT` only |
| Method | `POST` |
| URL | `https://wocbyyqcsqeronmpmqct.supabase.co/functions/v1/send-contact-notification` |
| Header | `Content-Type: application/json` |
| Header | `x-webhook-secret: the exact WEBHOOK_SECRET value` |

The value in the webhook header and the Supabase Edge Function secret must match exactly.

### 4. Test the Complete Flow

1. Submit a valid message through the portfolio contact form.
2. Confirm the row appears in `public.contact_messages`.
3. Confirm the notification arrives at `carlandreirubialucido@gmail.com` and check the spam folder if necessary.
4. Select **Reply** in the received email and confirm the visitor's address is used.
5. Review **Edge Functions > send-contact-notification > Logs** if the message is saved but no email arrives.

## Deployment

### GitHub Pages

1. Push the project to the `main` branch.
2. In the GitHub repository, open **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select `main` and `/ (root)`, then save.
5. GitHub Pages will publish the site at `https://carlandreilucido.github.io/portfolio/`.

All site paths are relative, so the project works correctly from the `/portfolio/` repository path.

After deployment, add `https://carlandreilucido.github.io/portfolio/` as a URL-prefix property in [Google Search Console](https://search.google.com/search-console/), submit `https://carlandreilucido.github.io/portfolio/sitemap.xml`, and request indexing for the canonical page URL. Search engines control when a page is crawled, indexed, and ranked.

### Vercel

1. Import `https://github.com/carlandreilucido/portfolio` into Vercel.
2. Select **Other** as the framework preset if prompted.
3. Leave the build command empty.
4. Use `.` as the output/root directory.
5. Deploy.

No environment variables are required by the static frontend. Resend credentials are configured only as Supabase Edge Function secrets.

## Security Notes

- Supabase Row Level Security must remain enabled on `contact_messages`.
- The browser client performs `INSERT` operations only.
- The publishable key in `js/supabase.js` is a public frontend credential; database policies are the security boundary.
- Resend and webhook secrets belong only in Supabase Edge Function secrets.
- The notification function validates a shared webhook secret even though JWT verification is disabled.
- A Supabase `service_role` key bypasses Row Level Security and must **NEVER** be committed to the repository or exposed in frontend JavaScript.
- For a high-traffic public deployment, consider adding CAPTCHA and server-side rate limiting to reduce automated form spam.
- Review contact messages only from the authenticated Supabase dashboard or another trusted administrative environment.

## Contact

- Email: [carlandreirubialucido@gmail.com](mailto:carlandreirubialucido@gmail.com)
- GitHub: [github.com/carlandreilucido](https://github.com/carlandreilucido)
