import { permanentRedirect } from "next/navigation";

// /plans briefly held bundled plans; pricing now lives at /pricing.
export default function PlansRedirect() {
  permanentRedirect("/pricing");
}
