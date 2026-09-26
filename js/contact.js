(function initializeContactForm() {
  "use strict";

  const contactForm = document.getElementById("contact-form");

  if (!contactForm) {
    return;
  }

  const submitButton = document.getElementById("submit-button");
  const buttonLabel = submitButton.querySelector(".button-label");
  const buttonIcon = submitButton.querySelector("i");
  const formStatus = document.getElementById("form-status");
  const toastElement = document.getElementById("form-toast");
  const toastMessage = document.getElementById("toast-message");
  const toastIcon = document.getElementById("toast-icon");
  const fields = {
    name: contactForm.elements.namedItem("name"),
    email: contactForm.elements.namedItem("email"),
    subject: contactForm.elements.namedItem("subject"),
    message: contactForm.elements.namedItem("message")
  };
  let isSubmitting = false;

  function setFieldValidity(field, isValid, errorMessage) {
    field.setCustomValidity(isValid ? "" : errorMessage);
  }

  function validateForm() {
    Object.values(fields).forEach(function trimField(field) {
      field.value = field.value.trim();
    });

    setFieldValidity(fields.name, fields.name.value.length >= 2, "Please enter your full name.");
    setFieldValidity(
      fields.email,
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value),
      "Please enter a valid email address."
    );
    setFieldValidity(fields.subject, fields.subject.value.length >= 3, "Please enter a subject.");
    setFieldValidity(fields.message, fields.message.value.length >= 10, "Please enter at least 10 characters.");

    contactForm.classList.add("was-validated");
    const isValid = contactForm.checkValidity();

    if (!isValid) {
      const firstInvalidField = contactForm.querySelector(":invalid");
      if (firstInvalidField) {
        firstInvalidField.focus();
      }
    }

    return isValid;
  }

  function setSubmittingState(submitting) {
    isSubmitting = submitting;
    submitButton.disabled = submitting;
    submitButton.setAttribute("aria-busy", String(submitting));
    buttonLabel.textContent = submitting ? "Sending..." : "Send Message";
    buttonIcon.className = submitting ? "bi bi-hourglass-split" : "bi bi-send";
  }

  function showFallbackStatus(message, type) {
    formStatus.textContent = message;
    formStatus.className = "form-status is-" + type;
    formStatus.hidden = false;
  }

  function showFeedback(message, type) {
    if (!toastElement || !window.bootstrap) {
      showFallbackStatus(message, type);
      return;
    }

    toastElement.classList.remove("toast-success", "toast-error");
    toastElement.classList.add(type === "success" ? "toast-success" : "toast-error");
    toastMessage.textContent = message;
    toastIcon.className = type === "success"
      ? "toast-icon bi bi-check-circle"
      : "toast-icon bi bi-exclamation-circle";

    const toast = window.bootstrap.Toast.getOrCreateInstance(toastElement, { delay: 5500 });
    toast.show();
  }

  Object.values(fields).forEach(function bindFieldReset(field) {
    field.addEventListener("input", function clearFieldError() {
      field.setCustomValidity("");
      formStatus.hidden = true;
    });
  });

  contactForm.addEventListener("submit", async function submitContactMessage(event) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!validateForm()) {
      showFeedback("Please review the highlighted fields and try again.", "error");
      return;
    }

    if (!window.portfolioSupabase) {
      showFeedback("The contact service is currently unavailable. Please email me directly instead.", "error");
      return;
    }

    const messageData = {
      name: fields.name.value,
      email: fields.email.value,
      subject: fields.subject.value,
      message: fields.message.value
    };

    setSubmittingState(true);

    try {
      const result = await window.portfolioSupabase
        .from("contact_messages")
        .insert(messageData);

      if (result.error) {
        throw result.error;
      }

      contactForm.reset();
      contactForm.classList.remove("was-validated");
      formStatus.hidden = true;
      showFeedback("Thanks, your message has been sent successfully.", "success");
    } catch (error) {
      showFeedback("Your message could not be sent. Please try again, or contact me directly by email.", "error");
    } finally {
      setSubmittingState(false);
    }
  });
})();
