import type { MediaBrief, MediaKind } from "./media";

// Motion and scene templates for rendered media: a fixed, tested set of
// camera moves (video) and settings (stills), chosen for a product by a score
// over facts we can check for free (its photo, material, shape, the job, the
// brand's mood, what the client already got, and each template's track
// record). The AI only describes the product and its surface in a sentence;
// it no longer invents camera work. Mirrors the ad designs (lib/ad-designs)
// and website templates: nothing unproven reaches a client.

export type Material = "reflective" | "matte" | "glass" | "fabric" | "wood" | "unknown";
export type Shape = "tall" | "flat" | "long" | "compact" | "unknown";
export type Mood = "heritage" | "industrial" | "premium" | "playful" | "calm";

export type Features = {
  /** A product shot on plain white (true) or a scene with surroundings (false); null when the photo couldn't be read. */
  cutout: boolean | null;
  /** The photo's shorter side is at least 800px: close moves won't go soft. */
  sharp: boolean;
  material: Material;
  shape: Shape;
  /** Title words that name a feature a camera can start on (hole, slot, thread). */
  detail: boolean;
  /** Tiny hardware (bushings, washers, terminals): never a hero. */
  tiny: boolean;
  /** Wires or cords trail off the product: no turntable. */
  wired: boolean;
  kind: MediaKind;
  aspect: MediaBrief["aspect"];
  moods: Mood[];
};

/** What the AI fills in, one line each; everything else is the template's. */
export type Slots = {
  /** "a brushed nickel ceiling canopy with a centre hole" */
  product: string;
  /** "a dark matte surface" */
  surface?: string;
};

export type MotionTemplate = {
  id: string;
  name: string;
  /** The one camera move, in plain words (for John and the studio). */
  move: string;
  /** Suits vertical social video (8s 9:16 feed clips), not only wide hero films. */
  social: boolean;
  /** Score for these facts, or null when the template must not be used for them. */
  suits: (f: Features) => number | null;
  prompt: (s: Slots, f: Features) => string;
  shots: (s: Slots, seconds: number) => MediaBrief["shots"];
};

export type SceneTemplate = {
  id: string;
  name: string;
  setting: string;
  suits: (f: Features) => number | null;
  prompt: (s: Slots) => string;
};

/**
 * Templates proven on a real render that John reviewed (2026-10-09: push-in and
 * half orbit on Etlin's animated ads, pull-back on the CFL socket; marble and
 * velvet, workshop bench on Grand Brass bases). Until a template is here it
 * isn't used for clients. The rest validate through the MCP at launch.
 */
export const VALIDATED_MOTION = new Set<string>(["push-in", "half-orbit", "pull-back"]);
export const VALIDATED_SCENES = new Set<string>(["marble-velvet", "workshop-bench"]);

/** How many templates a tier draws from, best track record first. */
export const POOL_BY_TIER: Record<string, number> = { fix: 3, build: 6, grow: 12 };

const NO_TEXT = "No text, captions, logos or watermarks anywhere in the frame.";
const light = (f: Features) => (f.material === "reflective" ? "soft directional studio light with one clean highlight travelling across the metal" : f.material === "glass" ? "soft backlight with a gentle bloom through the glass" : f.material === "matte" ? "soft, even studio light with a subtle shadow" : "soft directional studio light");
const surface = (s: Slots, f: Features) => s.surface ?? (f.cutout === false ? "its own setting" : "a dark matte surface");

const pushIn: MotionTemplate = {
  id: "push-in",
  name: "Push-in",
  move: "One slow dolly in with a slight rotation",
  social: true,
  suits: (f) => (f.sharp ? 3 + (f.cutout ? 1 : 0) + (f.shape === "compact" || f.shape === "tall" ? 1 : 0) : null),
  prompt: (s, f) => `${s.product} on ${surface(s, f)} comes alive with one slow cinematic push-in, the camera rotating a few degrees as it closes in, ${light(f)}, shallow depth of field, calm and precise. ${NO_TEXT}`,
  shots: (s, n) => [
    { seconds: Math.ceil(n * 0.6), visual: `Slow push-in on ${s.product}, light catching its edges` },
    { seconds: Math.floor(n * 0.4), visual: "The camera settles close, a few degrees around, sharp on the detail" },
  ],
};

const halfOrbit: MotionTemplate = {
  id: "half-orbit",
  name: "Half orbit",
  move: "The camera arcs part-way around while a highlight sweeps across",
  social: true,
  suits: (f) => (f.cutout === false || f.shape === "flat" ? null : 3 + (f.shape === "compact" || f.shape === "tall" ? 2 : 0) + (f.material === "reflective" ? 1 : 0)),
  prompt: (s, f) => `${s.product} on ${surface(s, f)}: one smooth orbiting camera move, about a quarter turn around the piece, ${light(f)}, clean background, sharp focus throughout, precise engineering mood. ${NO_TEXT}`,
  shots: (s, n) => [
    { seconds: Math.ceil(n * 0.7), visual: `The camera orbits around ${s.product}, light sweeping across it` },
    { seconds: Math.floor(n * 0.3), visual: "The orbit eases to a stop on the best angle" },
  ],
};

const pullBack: MotionTemplate = {
  id: "pull-back",
  name: "Pull-back reveal",
  move: "Opens tight on a detail, pulls back to show the whole",
  social: true,
  suits: (f) => (!f.sharp ? null : 2 + (f.detail ? 3 : 0) + (f.cutout ? 1 : 0)),
  prompt: (s, f) => `Starting tight on a detail of ${s.product}, the camera pulls back in one smooth motion to reveal the whole piece on ${surface(s, f)}, ${light(f)}, shallow depth of field opening up as it settles, confident and calm. ${NO_TEXT}`,
  shots: (s, n) => [
    { seconds: Math.ceil(n * 0.35), visual: `Tight on a detail of ${s.product}` },
    { seconds: Math.floor(n * 0.65), visual: "One smooth pull-back reveals the full piece, then holds" },
  ],
};

const turntable: MotionTemplate = {
  id: "turntable",
  name: "Turntable",
  move: "The product turns on its own axis, camera still",
  social: true,
  suits: (f) => (!f.cutout || f.wired ? null : 2 + (f.shape === "flat" || f.shape === "compact" ? 2 : 0) + (f.material === "reflective" ? 1 : 0)),
  prompt: (s, f) => `${s.product} rests on ${surface(s, f)} and turns slowly on its own axis through about a third of a turn, the camera fixed at a slight three-quarter angle, ${light(f)}, clean product-page feel. ${NO_TEXT}`,
  shots: (s, n) => [{ seconds: n, visual: `${s.product} turns slowly on the spot under studio light` }],
};

const lightSweep: MotionTemplate = {
  id: "light-sweep",
  name: "Light sweep",
  move: "Camera still, a highlight travels across the surface",
  social: true,
  suits: (f) => (f.material === "matte" ? null : (f.material === "reflective" ? 4 : f.material === "glass" ? 3 : 1) + (f.sharp ? 0 : 1)),
  prompt: (s, f) => `${s.product} on ${surface(s, f)}, the camera perfectly still while a single soft highlight travels slowly across the surface from one side to the other, ${f.material === "glass" ? "the light blooming gently through it" : "the finish catching and releasing the light"}, luxurious and quiet. ${NO_TEXT}`,
  shots: (s, n) => [{ seconds: n, visual: `A highlight sweeps slowly across ${s.product}, camera still` }],
};

const topDownTilt: MotionTemplate = {
  id: "top-down-tilt",
  name: "Top-down tilt",
  move: "Starts overhead, tilts down to a three-quarter view",
  social: true,
  suits: (f) => (f.shape === "tall" ? null : (f.shape === "flat" ? 4 : 1) + (f.cutout ? 1 : 0) + (f.material === "reflective" ? 1 : 0)),
  prompt: (s, f) => `${s.product} seen from directly above on ${surface(s, f)}; the camera tilts down smoothly in one move to a low three-quarter view, ${light(f)}, the shape and finish revealed as the angle changes, calm and exact. ${NO_TEXT}`,
  shots: (s, n) => [
    { seconds: Math.ceil(n * 0.3), visual: `Straight down onto ${s.product}` },
    { seconds: Math.floor(n * 0.7), visual: "One smooth tilt down to a three-quarter view, then a hold" },
  ],
};

const slideAlong: MotionTemplate = {
  id: "slide-along",
  name: "Slide along",
  move: "The camera tracks along the product's length",
  social: true,
  suits: (f) => (f.shape === "long" ? 5 + (f.sharp ? 1 : 0) : null),
  prompt: (s, f) => `${s.product} lying on ${surface(s, f)}: the camera slides slowly along its full length in one continuous tracking move, close and level, ${light(f)}, shallow depth of field, precise technical mood. ${NO_TEXT}`,
  shots: (s, n) => [{ seconds: n, visual: `The camera tracks along the length of ${s.product}` }],
};

const rackFocus: MotionTemplate = {
  id: "rack-focus",
  name: "Rack focus",
  move: "Focus drifts from the surroundings onto the product",
  social: false,
  suits: (f) => (f.cutout !== false ? null : 3 + (f.moods.includes("heritage") || f.moods.includes("premium") ? 1 : 0)),
  prompt: (s, f) => `${s.product} in its own setting: the frame opens softly out of focus on the surroundings and the focus drifts slowly onto the product until it is pin sharp, the camera nearly still, ${light(f)}, cinematic and unhurried. ${NO_TEXT}`,
  shots: (s, n) => [
    { seconds: Math.ceil(n * 0.4), visual: "Soft focus on the setting" },
    { seconds: Math.floor(n * 0.6), visual: `Focus settles onto ${s.product}` },
  ],
};

const riseAndSettle: MotionTemplate = {
  id: "rise-and-settle",
  name: "Rise and settle",
  move: "A slow crane up over the product, then a hold",
  social: false,
  suits: (f) => (f.tiny ? null : (f.kind === "hero-film" || f.kind === "video-ad" ? 3 : 0) + (f.aspect === "16:9" ? 2 : 0) + (f.shape === "tall" ? 1 : 0)),
  prompt: (s, f) => `${s.product} on ${surface(s, f)}: the camera rises slowly from a low angle in one smooth crane move and settles level with the product, ${light(f)}, generous negative space, premium launch-film feel. ${NO_TEXT}`,
  shots: (s, n) => [
    { seconds: Math.ceil(n * 0.7), visual: `Slow crane up over ${s.product}` },
    { seconds: Math.floor(n * 0.3), visual: "Settles level and holds" },
  ],
};

const backlightGlow: MotionTemplate = {
  id: "backlight-glow",
  name: "Backlight glow",
  move: "Light comes on behind or inside the product",
  social: true,
  suits: (f) => (f.material === "glass" ? 5 : null),
  prompt: (s, f) => `${s.product} on ${surface(s, f)} in near darkness; a warm light comes on slowly from behind and within it, the glow blooming through the glass and brightening the scene, the camera still with the gentlest drift, atmospheric and warm. ${NO_TEXT}`,
  shots: (s, n) => [
    { seconds: Math.ceil(n * 0.5), visual: `${s.product} in near darkness, a glow beginning` },
    { seconds: Math.floor(n * 0.5), visual: "The light reaches full warmth and holds" },
  ],
};

const shadowDrift: MotionTemplate = {
  id: "shadow-drift",
  name: "Shadow drift",
  move: "Still product, light moves across like passing sun",
  social: false,
  suits: (f) => (f.kind === "hero-film" || f.kind === "video-ad" ? (f.kind === "hero-film" ? 3 : 1) + (f.cutout === false ? 1 : 0) + (f.moods.includes("calm") ? 1 : 0) : null),
  prompt: (s, f) => `${s.product} on ${surface(s, f)}, the camera still: sunlight moves slowly across the scene as if a cloud is passing, shadows lengthening and softening, ${f.material === "reflective" ? "a highlight drifting across the metal" : "the texture of the surface changing with the light"}, serene. ${NO_TEXT}`,
  shots: (s, n) => [{ seconds: n, visual: `Light drifts slowly across ${s.product}` }],
};

const microDrift: MotionTemplate = {
  id: "micro-drift",
  name: "Micro drift",
  move: "Near-still with a gentle parallax drift (the safe fallback)",
  social: true,
  suits: (f) => 1 + (f.sharp ? 0 : 3) + (f.cutout === false ? 1 : 0) + (f.cutout === null ? 2 : 0),
  prompt: (s, f) => `${s.product} on ${surface(s, f)}, almost still: the camera drifts very slightly sideways with a touch of parallax, ${light(f)}, nothing else moves, calm and photographic. ${NO_TEXT}`,
  shots: (s, n) => [{ seconds: n, visual: `${s.product} with the gentlest camera drift` }],
};

export const MOTION_TEMPLATES: MotionTemplate[] = [pushIn, halfOrbit, pullBack, turntable, lightSweep, topDownTilt, slideAlong, rackFocus, riseAndSettle, backlightGlow, shadowDrift, microDrift];

const scene = (id: string, name: string, setting: string, suits: SceneTemplate["suits"], prompt: (s: Slots) => string): SceneTemplate => ({ id, name, setting, suits, prompt });
const HERO = "The product is the hero, centred, sharp and exactly as in the reference photo; editorial premium product photography.";

export const SCENE_TEMPLATES: SceneTemplate[] = [
  scene("marble-velvet", "Marble and velvet", "Polished white marble, deep navy velvet drape behind", (f) => (f.material === "reflective" ? 4 : f.material === "glass" ? 3 : 1) + (f.moods.includes("premium") ? 1 : 0), (s) => `${s.product} stands centred on polished white marble, crisp studio light from above and one side catching its finish; behind it a softly blurred deep navy velvet drape. ${HERO}`),
  scene("workshop-bench", "Workshop bench", "Walnut bench, warm raking light, tools out of focus", (f) => (f.moods.includes("heritage") ? 3 : 1) + (f.material === "reflective" || f.material === "wood" ? 2 : 0), (s) => `${s.product} sits centred on a worn walnut workbench lit by warm raking light from one side; out of focus behind it, a coil of cloth-covered wire and a brass hand tool suggest a restoration workshop. ${HERO}`),
  scene("studio-sweep", "Studio sweep", "Seamless grey, one soft key light", () => 2, (s) => `${s.product} centred on a seamless mid-grey studio sweep with one large soft key light and a gentle falloff to the background, a faint soft shadow beneath it. ${HERO}`),
  scene("linen-daylight", "Linen and daylight", "Natural linen, window light", (f) => (f.material === "fabric" || f.material === "glass" ? 4 : f.material === "matte" ? 2 : 0) + (f.moods.includes("calm") ? 1 : 0), (s) => `${s.product} resting on natural undyed linen in soft window daylight from the left, a shallow depth of field and a pale, airy background. ${HERO}`),
  scene("blueprint-desk", "Blueprint desk", "Drafting paper, brass rule, pencil", (f) => (f.moods.includes("industrial") ? 4 : 1) + (f.tiny ? 2 : 0), (s) => `${s.product} centred on a sheet of pale drafting paper with faint technical lines, a brass rule and a pencil lying out of focus at the edge of frame, crisp even light. ${HERO}`),
  scene("dark-slate", "Dark slate", "Charcoal slate, low light, long shadow", (f) => (f.material === "reflective" ? 4 : 1) + (f.moods.includes("premium") || f.moods.includes("industrial") ? 1 : 0), (s) => `${s.product} on a slab of charcoal slate, lit low from one side so a long soft shadow falls away from it and the finish catches a single highlight, a dark gradient background. ${HERO}`),
  scene("in-situ", "In situ", "On the fixture it belongs to", (f) => (f.cutout === false ? 3 : 2) + (f.shape === "flat" ? 1 : 0), (s) => `${s.product} shown fitted where it belongs, on a lamp or fixture in a tasteful room, the rest of the fixture softly out of focus, warm interior light. ${HERO}`),
  scene("flat-lay", "Collection flat lay", "Related parts arranged overhead", (f) => (f.tiny || f.shape === "compact" ? 3 : 1), (s) => `${s.product} at the centre of an overhead flat lay on pale stone, three or four related small parts arranged neatly around it with even spacing, soft even light. ${HERO}`),
];

// --- Features from what we know for free ---

const REFLECTIVE = /\b(brass|nickel|copper|chrome|bronze|steel|silver|gold|polished|plated|metal|aluminum|aluminium|pewter|iron)\b/i;
const GLASS = /\b(glass|opal|clear|frosted|bulb|lamp shade|shade|globe|crystal|candle cover|filament)\b/i;
const MATTE = /\b(nylon|plastic|rubber|bakelite|phenolic|porcelain|ceramic|bushing|grommet|vinyl)\b/i;
const FABRIC = /\b(fabric|cloth|linen|silk|cotton|felt|velvet)\b/i;
const WOOD = /\b(wood|oak|walnut|maple)\b/i;
const LONG = /\b(pipe|arm|cord|rod|tube|tubing|terminal|strip|bar|chain|nipple|threaded rod|stem|extension)\b/i;
const FLAT = /\b(canopy|canopies|base|plate|ring|disc|washer|flange|backplate|cover plate|check ring|escutcheon|pan)\b/i;
const TALL = /\b(bulb|finial|socket|holder|column|vase|bottle|candle|lamp)\b/i;
const DETAIL = /\b(hole|slot|thread|threaded|drilled|tapped|ips|socket|contact|pin|lug|notch|key)\b/i;
const TINY = /\b(bushing|washer|terminal|nut|screw|grommet|clip|connector|splice|lug|tiny|mini|miniature)\b/i;
const WIRED = /\b(wire|wired|lead|leads|cord|cable|pigtail)\b/i;

/** `photo.cutout` here means a product alone on one plain backdrop (white or a studio grey), not only on white. */
export function productFeatures(title: string, photo: { width: number; height: number; cutout: boolean | null } | null, kind: MediaKind, aspect: MediaBrief["aspect"], moods: Mood[] = []): Features {
  const material: Material = GLASS.test(title) ? "glass" : REFLECTIVE.test(title) ? "reflective" : FABRIC.test(title) ? "fabric" : WOOD.test(title) ? "wood" : MATTE.test(title) ? "matte" : "unknown";
  const ratio = photo ? photo.height / Math.max(1, photo.width) : 1;
  // Title words first (a bulb is tall even when its title says "E26 Base"), then the photo's proportions.
  const shape: Shape = LONG.test(title) ? "long" : TALL.test(title) ? "tall" : FLAT.test(title) ? "flat" : photo ? (ratio > 1.3 ? "tall" : ratio < 0.6 ? "long" : "compact") : "unknown";
  return {
    cutout: photo ? photo.cutout : null,
    sharp: !!photo && Math.min(photo.width, photo.height) >= 800,
    material,
    shape,
    detail: DETAIL.test(title),
    tiny: TINY.test(title),
    wired: WIRED.test(title),
    kind,
    aspect,
    moods,
  };
}

// --- Scoring ---

export type Scored<T> = { template: T; score: number; reasons: string[] };

/**
 * Every eligible template scored for these facts: its own fit, plus its track
 * record (approvals minus rejections and failures), minus 2 for each earlier
 * use for this client this month. Hard mismatches are left out.
 */
export function scoreMotion(f: Features, opts: { record?: Record<string, number>; used?: string[]; durationSeconds?: number } = {}): Scored<MotionTemplate>[] {
  const social = f.kind === "short-video" || f.kind === "animated-ad";
  const out: Scored<MotionTemplate>[] = [];
  for (const t of MOTION_TEMPLATES) {
    const fit = t.suits(f);
    if (fit == null) continue;
    if (social && !t.social) continue;
    const reasons = [`fit ${fit}`];
    let score = fit;
    const rec = opts.record?.[t.id] ?? 0;
    if (rec) {
      score += rec;
      reasons.push(`record ${rec > 0 ? "+" : ""}${rec}`);
    }
    const uses = (opts.used ?? []).filter((u) => u === t.id).length;
    if (uses) {
      score -= 2 * uses;
      reasons.push(`used ${uses}× this month`);
    }
    out.push({ template: t, score, reasons });
  }
  return out.sort((a, b) => b.score - a.score || a.template.id.localeCompare(b.template.id));
}

export function scoreScenes(f: Features, opts: { record?: Record<string, number>; used?: string[] } = {}): Scored<SceneTemplate>[] {
  const out: Scored<SceneTemplate>[] = [];
  for (const t of SCENE_TEMPLATES) {
    const fit = t.suits(f);
    if (fit == null) continue;
    const rec = opts.record?.[t.id] ?? 0;
    const uses = (opts.used ?? []).filter((u) => u === t.id).length;
    out.push({ template: t, score: fit + rec - 2 * uses, reasons: [`fit ${fit}`, ...(rec ? [`record ${rec}`] : []), ...(uses ? [`used ${uses}×`] : [])] });
  }
  return out.sort((a, b) => b.score - a.score || a.template.id.localeCompare(b.template.id));
}

/**
 * The template for a client's job: the best score among validated templates
 * in the tier's pool (best track record first). With nothing validated yet
 * (build phase) every template is eligible. Micro drift is the last resort.
 */
export function pickMotion(f: Features, tier: string, opts: { record?: Record<string, number>; used?: string[] } = {}): Scored<MotionTemplate> {
  const ranked = scoreMotion(f, opts);
  const pool = VALIDATED_MOTION.size ? MOTION_TEMPLATES.filter((t) => VALIDATED_MOTION.has(t.id)) : MOTION_TEMPLATES;
  const byRecord = [...pool].sort((a, b) => (opts.record?.[b.id] ?? 0) - (opts.record?.[a.id] ?? 0)).slice(0, POOL_BY_TIER[tier] ?? 3).map((t) => t.id);
  return ranked.find((r) => byRecord.includes(r.template.id)) ?? ranked.find((r) => r.template.id === "micro-drift") ?? { template: microDrift, score: 0, reasons: ["fallback"] };
}

export function pickScene(f: Features, opts: { record?: Record<string, number>; used?: string[] } = {}): Scored<SceneTemplate> {
  const ranked = scoreScenes(f, opts);
  const pool = VALIDATED_SCENES.size ? ranked.filter((r) => VALIDATED_SCENES.has(r.template.id)) : ranked;
  return pool[0] ?? ranked[0];
}

/** A finished brief from a template: prompt and shots are the template's; the AI's sentence fills the slots. */
export function motionBrief(t: MotionTemplate, s: Slots, f: Features, base: Omit<MediaBrief, "prompt" | "shots">): MediaBrief & { template: string } {
  return { ...base, template: t.id, prompt: t.prompt(s, f), shots: t.shots(s, Math.round(base.duration)) };
}

export const motionById = (id: string) => MOTION_TEMPLATES.find((t) => t.id === id);
export const sceneById = (id: string) => SCENE_TEMPLATES.find((t) => t.id === id);
