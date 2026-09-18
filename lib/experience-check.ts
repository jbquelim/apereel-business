// Buyer Experience Check — a curated set of interface-quality checks that can
// be verified from a page's raw HTML alone (no browser needed). Each failed
// check carries a plain-language business consequence, not developer jargon:
// the audience is the owner reading their own audit, not their developer.
//
// Derived from the Web Interface Guidelines (vercel-labs/web-interface-guidelines),
// reduced to the rules that are (a) detectable in static HTML and (b) worth a
// sentence in a sales conversation. Curated + baked in on purpose: no runtime
// dependency on a third-party rule list.

export type ExperienceFinding = {
  id: string;
  label: string;
  status: "pass" | "fail" | "warn";
  /** Specifics found on the page, e.g. "14 of 32 images". */
  detail: string | null;
  /** Business consequence, shown for fail/warn only. */
  impact: string | null;
};

export type ExperienceCheckResult = {
  findings: ExperienceFinding[];
  passed: number;
  failed: number;
  warned: number;
};

function attr(tag: string, name: string): string | null {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"));
  return m ? (m[1] ?? m[2] ?? "") : null;
}

export function runExperienceChecks(html: string, isHttps: boolean): ExperienceCheckResult {
  const findings: ExperienceFinding[] = [];
  const add = (
    id: string,
    label: string,
    status: ExperienceFinding["status"],
    detail: string | null = null,
    impact: string | null = null,
  ) => findings.push({ id, label, status, detail, impact: status === "pass" ? null : impact });

  const imgTags = html.match(/<img[^>]*>/gi) ?? [];
  const inputTags = (html.match(/<input[^>]*>/gi) ?? []).filter((t) => {
    const type = (attr(t, "type") ?? "text").toLowerCase();
    return !["hidden", "submit", "button", "checkbox", "radio", "image", "reset"].includes(type);
  });

  // 1. Mobile zoom disabled
  const viewportTag = html.match(/<meta[^>]*name=["']viewport["'][^>]*>/i)?.[0] ?? null;
  const viewportContent = viewportTag ? (attr(viewportTag, "content") ?? "") : "";
  const zoomDisabled =
    /user-scalable\s*=\s*(no|0)/i.test(viewportContent) ||
    /maximum-scale\s*=\s*1(\.0*)?\b/.test(viewportContent);
  add(
    "zoom",
    "Mobile visitors can zoom",
    zoomDisabled ? "fail" : "pass",
    zoomDisabled ? "Pinch-to-zoom is switched off" : null,
    "Shoppers zoom into product photos and small text before they buy. Blocking it frustrates mobile buyers and fails accessibility standards.",
  );

  // 2. Mobile-ready viewport
  add(
    "viewport",
    "Page is mobile-ready",
    viewportTag ? "pass" : "fail",
    viewportTag ? null : "No mobile viewport configured",
    "Without it, phones render the desktop layout shrunken down — most visitors are on phones, and they leave.",
  );

  // 3. Secure connection
  add(
    "https",
    "Connection is secure (HTTPS)",
    isHttps ? "pass" : "fail",
    isHttps ? null : "Site served over plain HTTP",
    "Browsers mark the site “Not Secure” next to your name. Buyers won’t enter payment or contact details behind that warning.",
  );

  // 4. Product images described (alt text)
  const missingAlt = imgTags.filter((t) => {
    const a = attr(t, "alt");
    return a === null; // alt="" is a deliberate decorative marker — allowed
  }).length;
  if (imgTags.length > 0) {
    const ratio = missingAlt / imgTags.length;
    add(
      "alt",
      "Images are described for Google & screen readers",
      missingAlt === 0 ? "pass" : ratio > 0.3 ? "fail" : "warn",
      missingAlt === 0 ? null : `${missingAlt} of ${imgTags.length} images have no description`,
      "Google can’t “see” images — undescribed product photos are invisible to image search, and blind customers can’t shop them.",
    );
  }

  // 5. Images sized to prevent layout jumps
  const unsized = imgTags.filter(
    (t) => !(attr(t, "width") && attr(t, "height")) && !/aspect-ratio/i.test(attr(t, "style") ?? ""),
  ).length;
  if (imgTags.length > 0) {
    const ratio = unsized / imgTags.length;
    add(
      "dimensions",
      "Page doesn’t jump around while loading",
      ratio === 0 ? "pass" : ratio > 0.5 ? "fail" : "warn",
      unsized === 0 ? null : `${unsized} of ${imgTags.length} images load without reserved space`,
      "Content that shifts as images load makes buyers mis-tap and feels broken — Google measures this (CLS) and ranks accordingly.",
    );
  }

  // 6. Images load lazily
  const lazyCount = imgTags.filter((t) => /loading\s*=\s*["']lazy["']/i.test(t)).length;
  if (imgTags.length >= 8) {
    add(
      "lazy",
      "Below-the-fold images load lazily",
      lazyCount > 0 ? "pass" : "warn",
      lazyCount > 0 ? `${lazyCount} of ${imgTags.length} images` : "No lazy loading detected",
      "Loading every image up front slows the first paint — on mobile connections, slow first seconds cost real visitors.",
    );
  }

  // 7. Forms work with browser autofill
  if (inputTags.length > 0) {
    const withAutocomplete = inputTags.filter((t) => attr(t, "autocomplete") !== null).length;
    add(
      "autofill",
      "Forms work with browser autofill",
      withAutocomplete > 0 ? "pass" : "warn",
      withAutocomplete > 0
        ? `${withAutocomplete} of ${inputTags.length} fields`
        : `None of ${inputTags.length} form fields enable autofill`,
      "Every field a customer must type by hand is a chance to abandon the form. Autofill turns a 60-second form into a 5-second one.",
    );

    // 8. Form fields are labelled
    const labelled = inputTags.filter(
      (t) => attr(t, "aria-label") !== null || attr(t, "id") !== null,
    ).length;
    const hasLabels = /<label[\s>]/i.test(html);
    add(
      "labels",
      "Form fields are properly labelled",
      hasLabels || labelled === inputTags.length ? "pass" : "warn",
      hasLabels || labelled === inputTags.length
        ? null
        : `${inputTags.length - labelled} field(s) rely on placeholder text alone`,
      "Placeholder-only fields confuse autofill and screen readers, and the hint vanishes the moment someone starts typing.",
    );
  }

  // 9. Paste isn't blocked
  const pasteBlocked = /onpaste\s*=\s*["'][^"']*(return\s+false|preventDefault)/i.test(html);
  add(
    "paste",
    "Customers can paste into forms",
    pasteBlocked ? "fail" : "pass",
    pasteBlocked ? "Paste is intercepted on this page" : null,
    "People paste emails, addresses, and passwords from their password manager. Blocking paste loses exactly the careful buyers you want.",
  );

  // 10. Animated GIFs where video belongs
  const gifCount = imgTags.filter((t) => /\.gif(\?|["']|$)/i.test(attr(t, "src") ?? "")).length;
  add(
    "gif",
    "Motion uses efficient video, not heavy GIFs",
    gifCount === 0 ? "pass" : "warn",
    gifCount === 0 ? null : `${gifCount} animated GIF(s) on the page`,
    "A GIF is often 10× the file size of the same clip as video — that’s seconds of extra load time on mobile.",
  );

  // 11. Page language declared
  const hasLang = /<html[^>]*\slang\s*=/i.test(html);
  add(
    "lang",
    "Page language is declared",
    hasLang ? "pass" : "warn",
    hasLang ? null : "No language set on the page",
    "Browsers use this for translation offers and screen readers use it for pronunciation — without it both guess, sometimes badly.",
  );

  // 12. Browser chrome matches the brand
  const hasThemeColor = /<meta[^>]*name=["']theme-color["']/i.test(html);
  add(
    "theme",
    "Mobile browser bar matches the site design",
    hasThemeColor ? "pass" : "warn",
    hasThemeColor ? null : "No theme color set",
    "A small polish signal: the phone’s browser bar blends with your brand color instead of defaulting to white.",
  );

  const passed = findings.filter((f) => f.status === "pass").length;
  const failed = findings.filter((f) => f.status === "fail").length;
  const warned = findings.filter((f) => f.status === "warn").length;

  return { findings, passed, failed, warned };
}
