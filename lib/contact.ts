export type ContactInput = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  website?: string;
  message: string;
  acceptTerms?: boolean;
  marketingOptIn?: boolean;
  honeypot?: string;
};

export type ContactErrors = Partial<
  Record<"name" | "email" | "phone" | "company" | "website" | "message" | "acceptTerms" | "form", string>
>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[\d\s()+\-\.]{7,20}$/;

export function validateContact(input: ContactInput): {
  ok: boolean;
  errors: ContactErrors;
  data: {
    name: string;
    email: string;
    phone: string;
    company: string;
    website: string;
    message: string;
    acceptTerms: boolean;
    marketingOptIn: boolean;
    honeypot: string;
  };
} {
  const name = input.name.trim();
  const email = input.email.trim();
  const phone = (input.phone ?? "").trim();
  const company = (input.company ?? "").trim();
  const website = (input.website ?? "").trim();
  const message = input.message.trim();
  const acceptTerms = input.acceptTerms ?? false;
  const marketingOptIn = input.marketingOptIn ?? false;
  const honeypot = (input.honeypot ?? "").trim();
  const errors: ContactErrors = {};

  if (name.length < 2) errors.name = "Please enter your name.";
  if (name.length > 120) errors.name = "Name is too long.";
  if (!emailPattern.test(email)) errors.email = "Please enter a valid email.";
  if (phone && !phonePattern.test(phone)) errors.phone = "Please enter a valid phone number.";
  if (company.length > 160) errors.company = "Company name is too long.";
  if (website.length > 300) errors.website = "URL is too long.";
  if (message.length < 12) errors.message = "Please share a little more context.";
  if (message.length > 4000) errors.message = "Message is too long.";
  if (!acceptTerms) errors.acceptTerms = "Please accept the terms to continue.";

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    data: { name, email, phone, company, website, message, acceptTerms, marketingOptIn, honeypot },
  };
}
