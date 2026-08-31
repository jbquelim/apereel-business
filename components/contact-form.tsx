"use client";

import { useState } from "react";
import { validateContact, type ContactErrors } from "@/lib/contact";
import { cn } from "@/lib/cn";

const fieldClass =
  "mt-2 w-full rounded-lg border border-white/12 bg-navy px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-electric";

export function ContactForm() {
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      company: String(formData.get("company") ?? ""),
      website: String(formData.get("website") ?? ""),
      message: String(formData.get("message") ?? ""),
      honeypot: String(formData.get("fax_number") ?? ""),
    };

    const result = validateContact(payload);
    if (!result.ok) {
      setErrors(result.errors);
      setStatus("idle");
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const body = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !body.ok) {
        throw new Error(body.error || "Unable to send your message.");
      }
      setStatus("success");
      form.reset();
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to send your message. Please email directly.",
      );
    }
  }

  if (status === "success") {
    return (
      <div
        className="rounded-2xl border border-white/10 bg-navy-mid p-8 sm:p-10"
        role="status"
      >
        <p className="text-[11px] font-semibold tracking-[0.2em] text-electric uppercase">
          Received
        </p>
        <p className="font-display mt-4 text-2xl text-ink">
          Thank you. We will be in touch.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink/60">
          Your note is with Apereel. If anything is time-sensitive, email
          directly and we will prioritize it.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative rounded-2xl border border-white/10 bg-navy-mid p-8 sm:p-10"
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-[12px] font-medium text-ink">
          Name
          <input
            name="name"
            autoComplete="name"
            required
            className={fieldClass}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name ? (
            <span id="name-error" className="mt-1 block text-[12px] text-signal">
              {errors.name}
            </span>
          ) : null}
        </label>
        <label className="block text-[12px] font-medium text-ink">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className={fieldClass}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email ? (
            <span id="email-error" className="mt-1 block text-[12px] text-signal">
              {errors.email}
            </span>
          ) : null}
        </label>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <label className="block text-[12px] font-medium text-ink">
          Company
          <input
            name="company"
            autoComplete="organization"
            className={fieldClass}
            aria-invalid={Boolean(errors.company)}
          />
        </label>
        <label className="block text-[12px] font-medium text-ink">
          Website
          <input
            name="website"
            type="url"
            autoComplete="url"
            placeholder="https://"
            className={fieldClass}
            aria-invalid={Boolean(errors.website)}
          />
        </label>
      </div>
      <label className="mt-5 block text-[12px] font-medium text-ink">
        What are you trying to improve?
        <textarea
          name="message"
          required
          rows={5}
          className={cn(fieldClass, "resize-y")}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {errors.message ? (
          <span id="message-error" className="mt-1 block text-[12px] text-signal">
            {errors.message}
          </span>
        ) : null}
      </label>
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>
          Fax
          <input name="fax_number" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {status === "error" ? (
        <p className="mt-4 text-sm text-signal" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-electric px-6 text-[13px] font-semibold tracking-[0.08em] text-ink uppercase transition-colors hover:bg-electric-deep disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {status === "submitting" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
