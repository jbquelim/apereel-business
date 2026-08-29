export type ContactInput = {
  name: string;
  email: string;
  company?: string;
  message: string;
  website?: string;
};

export type ContactErrors = Partial<
  Record<"name" | "email" | "company" | "message" | "form", string>
>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(input: ContactInput): {
  ok: boolean;
  errors: ContactErrors;
  data: {
    name: string;
    email: string;
    company: string;
    message: string;
    honeypot: string;
  };
} {
  const name = input.name.trim();
  const email = input.email.trim();
  const company = (input.company ?? "").trim();
  const message = input.message.trim();
  const honeypot = (input.website ?? "").trim();
  const errors: ContactErrors = {};

  if (name.length < 2) errors.name = "Please enter your name.";
  if (name.length > 120) errors.name = "Name is too long.";
  if (!emailPattern.test(email)) errors.email = "Please enter a valid email.";
  if (company.length > 160) errors.company = "Company name is too long.";
  if (message.length < 12) errors.message = "Please share a little more context.";
  if (message.length > 4000) errors.message = "Message is too long.";

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    data: { name, email, company, message, honeypot },
  };
}
