import { permanentRedirect } from "next/navigation";

// The about content now lives on the contact page.
export default function AboutPage() {
  permanentRedirect("/contact");
}
