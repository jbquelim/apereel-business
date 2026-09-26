"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";

// Creative production — an immersive, full-bleed concept film scrubbed by
// native scroll, with editorial copy choreographed over the footage.
//
// One timeline: scroll position → target media time. Everything on screen
// (copy entrances/holds/exits, progress, chapter state) is rendered from the
// media time the video has actually presented, so text stays with the image
// even when a seek lags. Seeks are coalesced (one in flight; the newest
// target is serviced on completion).
//
// Text positions were chosen per shot to sit in negative space — never over
// the tool, hands or cutting action. Each overlay element carries a window in
// film seconds: data-t="inStart,inEnd,outStart,outEnd".
//
// Enhancement is additive: the server-rendered layout is the static version
// (full-width player + readable narrative), which small screens, short or
// reduced-motion setups and media failures keep.

const CFG = {
  travel: 5200, // px of scroll for the whole film
  holdIn: 0.05, // opening hold (headline over the first frame)
  span: 0.8, // leaves a 15% closing hold on the finished hero frame
  stageMinWidth: 1024,
  minStageHeight: 420,
  maxCrop: 0.2, // never crop more than 20% of the frame's height (the Action shot loses the operator's head beyond that)
  enterPx: 32,
  exitPx: 16,
};

const FPS = 24;
const FILM_DURATION = 30.041667;

// Cut times from the supplied chapters.json; `read` is the point a chapter
// jump lands on: that chapter's copy fully in and holding.
const CHAPTERS = [
  { id: "capture", start: 0, label: "Starting point", read: 0.6 },
  { id: "direct", start: 4.791667, label: "Direction", read: 8.3 },
  { id: "transform", start: 9.708333, label: "Product", read: 13.0 },
  { id: "demonstrate", start: 14.958333, label: "Action", read: 16.6 },
  { id: "refine", start: 19.5, label: "Detail", read: 22.9 },
  { id: "deliver", start: 24.333333, label: "Payoff", read: 29.4 },
];
const ENDS = [...CHAPTERS.slice(1).map((c) => c.start), FILM_DURATION];

// Narrative for the static layout and assistive tech (same words as the overlays).
const NARRATIVE = [
  { title: "One ordinary photo.", body: "A starting point. Not a limit.", still: "01-capture" },
  { title: "The difference starts with direction.", body: "The story. The setting. The impression.", still: "02-direct" },
  { title: "Give the product a world.", body: "Light, texture, and context change how it is perceived.", still: "03-transform" },
  { title: "Show what it can do.", body: "Bring the product into a compelling commercial story.", still: "04-demonstrate" },
  { title: "Make every detail count.", body: "Movement. Material. Character.", still: "05-refine" },
  { title: "From a simple image. To a stronger impression.", body: "Creative direction and AI-assisted production, built around your brand.", still: "06-deliver" },
];

const SCRUB_SRC = "/videos/creative-film-scrub.mp4";
const FILM_SRC = "/videos/creative-film.mp4";
const IMG = (name: string) => `/images/creative-film/${name}.jpg`;
const DISCLOSURE = "AI-assisted creative concept demonstration.";

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = (t: number) => 1 - (1 - t) ** 3; // easeOutCubic
const pad = (n: number) => String(n).padStart(2, "0");
const chapterAt = (t: number) => {
  let i = 0;
  for (let j = 0; j < CHAPTERS.length; j++) if (t + 1e-3 >= CHAPTERS[j].start) i = j;
  return i;
};

// ── overlay primitives ────────────────────────────────────────────────
type Win = [number, number, number?, number?];
const w = ([a, b, c = 999, d = 999]: Win) => `${a},${b},${c},${d}`;
// Headline line revealed upward through a clipping mask.
function Line({ t, children, className = "" }: { t: Win; children: ReactNode; className?: string }) {
  return (
    <span className={`cf-mask ${className}`}>
      <span className="cf-fx cf-line" data-t={w(t)}>
        {children}
      </span>
    </span>
  );
}
function Fade({ t, children, className = "", enter }: { t: Win; children: ReactNode; className?: string; enter?: number }) {
  return (
    <span className={`cf-fx ${className}`} data-t={w(t)} data-enter={enter}>
      {children}
    </span>
  );
}

// Localized dark gradient behind a copy block; fades with that block only.
function Shade({ t }: { t: Win }) {
  return <span className="cf-fx cf-shade" data-t={w(t)} data-enter={0} />;
}

type VideoWithRVFC = HTMLVideoElement & {
  requestVideoFrameCallback?: (cb: (now: number, meta: { mediaTime: number }) => void) => number;
  cancelVideoFrameCallback?: (id: number) => void;
};
type Fx = { el: HTMLElement; a: number; b: number; c: number; d: number; enter: number; kind: string; last: string };

export function CreativeFilm() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const root: HTMLElement = rootRef.current;
    const journey = root.querySelector<HTMLElement>(".cf-journey")!;
    const stage = root.querySelector<HTMLElement>(".cf-stage")!;
    const video = root.querySelector<HTMLVideoElement>(".cf-scrub")! as VideoWithRVFC;
    const segs = [...root.querySelectorAll<HTMLElement>(".cf-seg-fill")];
    const jumps = [...root.querySelectorAll<HTMLButtonElement>(".cf-seg")];
    const dialog = root.querySelector<HTMLDialogElement>(".cf-dialog")!;
    const dialogVideo = dialog.querySelector<HTMLVideoElement>("video")!;
    const watch = root.querySelector<HTMLButtonElement>(".cf-watch")!;
    const closeButton = dialog.querySelector<HTMLButtonElement>(".cf-dialog-close")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");

    // Cache overlay elements and their windows once.
    const fx: Fx[] = [...root.querySelectorAll<HTMLElement>(".cf-stage [data-t]")].map((el) => {
      const [a, b, c, d] = el.dataset.t!.split(",").map(Number);
      const kind = el.classList.contains("cf-line")
        ? "line"
        : el.classList.contains("cf-rule")
          ? "rule"
          : el.classList.contains("cf-frame")
            ? "frame"
            : "fade";
      const enter = Number(el.dataset.enter ?? (kind === "line" ? CFG.enterPx : 14));
      return { el, a, b, c, d, enter, kind, last: "" };
    });

    let enabled = false;
    let failed = false;
    let near = false;
    let ready = false;
    let seeking = false;
    let playableEnd = Math.min(30, FILM_DURATION - 1 / FPS);
    let target = 0;
    let presented = -1;
    let shownChapter = -1;
    let start = 0;
    let frame = 0;
    let measureFrame = 0;
    let rvfc = 0;
    let lastTrigger: HTMLElement | null = null;

    // ── render everything from presented media time ──
    function render(time: number) {
      if (time === presented) return;
      presented = time;
      for (const f of fx) {
        const i = f.b > f.a ? ease(clamp((time - f.a) / (f.b - f.a))) : time >= f.b ? 1 : 0;
        const o = f.d > f.c ? ease(clamp((time - f.c) / (f.d - f.c))) : time >= f.d ? 1 : 0;
        const op = i * (1 - o);
        let css: string;
        if (f.kind === "rule") css = `opacity:${op.toFixed(3)};transform:scaleX(${i.toFixed(3)})`;
        else if (f.kind === "frame")
          css = `opacity:${(op * 0.9).toFixed(3)};clip-path:inset(0 ${((1 - i) * 100).toFixed(1)}% 0 0)`;
        else {
          const y = (1 - i) * f.enter - o * CFG.exitPx;
          css = `opacity:${op.toFixed(3)};transform:translate3d(0,${y.toFixed(1)}px,0)`;
        }
        if (css !== f.last) {
          f.last = css;
          f.el.style.cssText = css;
        }
      }
      CHAPTERS.forEach((c, j) => {
        segs[j].style.transform = `scaleX(${clamp((time - c.start) / (ENDS[j] - c.start)).toFixed(4)})`;
      });
      const i = chapterAt(time);
      if (i !== shownChapter) {
        shownChapter = i;
        jumps.forEach((b, j) => {
          if (j === i) b.setAttribute("aria-current", "step");
          else b.removeAttribute("aria-current");
        });
      }
    }

    // ── seek coalescing ──
    function drive() {
      if (!enabled || !ready || seeking) return;
      if (Math.abs(video.currentTime - target) < 0.5 / FPS) return;
      seeking = true;
      video.currentTime = target;
    }
    function onSeeked() {
      seeking = false;
      render(video.currentTime);
      if (video.requestVideoFrameCallback) {
        if (rvfc && video.cancelVideoFrameCallback) video.cancelVideoFrameCallback(rvfc);
        rvfc = video.requestVideoFrameCallback((_, meta) => {
          rvfc = 0;
          render(meta.mediaTime);
        });
      }
      drive();
    }
    function onMetadata() {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      playableEnd = Math.min(30, video.duration - 1 / FPS);
      ready = true;
      update();
    }
    function onError() {
      failed = true;
      schedule();
    }

    const toTime = (p: number) => clamp((p - CFG.holdIn) / CFG.span) * playableEnd;
    const toScroll = (t: number) => start + (CFG.holdIn + CFG.span * (t / playableEnd)) * CFG.travel;

    function update() {
      frame = 0;
      if (!enabled) return;
      target = toTime(clamp((scrollY - start) / CFG.travel));
      if (!ready) render(0); // poster is the opening frame until the video can seek
      drive();
    }
    function request() {
      if (enabled && near && !frame) frame = requestAnimationFrame(update);
    }
    function loadScrub() {
      if (!enabled || !near || video.getAttribute("src")) return;
      video.preload = "auto";
      video.src = SCRUB_SRC;
      video.load();
    }
    function headerOffset() {
      const header = document.querySelector<HTMLElement>("body > header, header.fixed");
      return header ? Math.ceil(header.getBoundingClientRect().height) : 0;
    }

    function measure() {
      measureFrame = 0;
      enabled = false;
      root.classList.remove("enhanced");
      journey.style.height = "";
      const top = headerOffset();
      const available = innerHeight - top;
      const natural = (innerWidth * 9) / 16; // full-width film height
      // Tall screens get a shorter stage (no crop); wide screens crop the
      // frame's height, but never more than maxCrop.
      const height = Math.min(available, natural);
      root.style.setProperty("--cf-top", `${top}px`);
      root.style.setProperty("--cf-stage-h", `${Math.floor(height)}px`);
      root.style.setProperty("--cf-pin-offset", `${Math.max(0, Math.floor((available - height) / 2))}px`);
      if (
        !failed &&
        !reduce.matches &&
        innerWidth >= CFG.stageMinWidth &&
        height >= CFG.minStageHeight &&
        1 - height / natural <= CFG.maxCrop
      ) {
        root.classList.add("enhanced");
        enabled = true;
        journey.style.height = `${stage.offsetHeight + CFG.travel}px`;
        start = scrollY + journey.getBoundingClientRect().top - top - Math.max(0, (available - height) / 2);
        presented = -1;
        loadScrub();
        update();
        if (!ready) render(0);
      } else if (video.getAttribute("src")) {
        video.removeAttribute("src");
        video.load();
        ready = false;
        seeking = false;
      }
    }
    function schedule() {
      if (!measureFrame) measureFrame = requestAnimationFrame(measure);
    }

    const jumpHandlers = jumps.map((b, i) => {
      const onClick = () => {
        if (!enabled) return;
        scrollTo({ top: toScroll(Math.min(CHAPTERS[i].read, playableEnd)), behavior: reduce.matches ? "instant" : "smooth" });
      };
      b.addEventListener("click", onClick);
      return onClick;
    });

    function openFilm(e: Event) {
      lastTrigger = e.currentTarget as HTMLElement;
      if (!dialogVideo.getAttribute("src")) dialogVideo.src = FILM_SRC;
      dialog.showModal();
      dialogVideo.currentTime = 0;
      dialogVideo.play().catch(() => {});
    }
    function onDialogClose() {
      dialogVideo.pause();
      lastTrigger?.focus();
    }
    const closeFilm = () => dialog.close();
    const onBackdrop = (e: MouseEvent) => {
      if (e.target === dialog) dialog.close();
    };
    watch.addEventListener("click", openFilm);
    closeButton.addEventListener("click", closeFilm);
    dialog.addEventListener("close", onDialogClose);
    dialog.addEventListener("click", onBackdrop);

    // Only fetch/scrub while the section is near the viewport.
    const io = new IntersectionObserver(
      ([entry]) => {
        near = entry.isIntersecting;
        if (near) {
          loadScrub();
          request();
        }
      },
      { rootMargin: "150% 0px" },
    );
    io.observe(journey);
    const ro = new ResizeObserver(schedule);
    const header = document.querySelector<HTMLElement>("body > header, header.fixed");
    if (header) ro.observe(header);

    video.addEventListener("loadedmetadata", onMetadata);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);
    addEventListener("scroll", request, { passive: true });
    addEventListener("resize", schedule);
    addEventListener("pageshow", schedule);
    reduce.addEventListener("change", schedule);
    document.fonts.ready.then(schedule);
    measure();

    return () => {
      io.disconnect();
      ro.disconnect();
      video.removeEventListener("loadedmetadata", onMetadata);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      removeEventListener("scroll", request);
      removeEventListener("resize", schedule);
      removeEventListener("pageshow", schedule);
      reduce.removeEventListener("change", schedule);
      jumps.forEach((b, i) => b.removeEventListener("click", jumpHandlers[i]));
      watch.removeEventListener("click", openFilm);
      closeButton.removeEventListener("click", closeFilm);
      dialog.removeEventListener("close", onDialogClose);
      dialog.removeEventListener("click", onBackdrop);
      if (rvfc && video.cancelVideoFrameCallback) video.cancelVideoFrameCallback(rvfc);
      if (frame) cancelAnimationFrame(frame);
      if (measureFrame) cancelAnimationFrame(measureFrame);
      video.removeAttribute("src");
      video.load();
      dialogVideo.pause();
    };
  }, []);

  return (
    <section ref={rootRef} id="creative" className="cf" aria-labelledby="cf-heading">
      {/* ── Cinematic stage (enhanced desktop) ── */}
      <div className="cf-journey">
        <div className="cf-stage">
          <video
            className="cf-scrub"
            muted
            playsInline
            preload="none"
            poster={IMG("01-capture")}
            aria-hidden="true"
            tabIndex={-1}
          />

          {/* Decorative, scroll-driven copy. Screen readers get the same words
              once, in order, from the narrative below. */}
          <div className="cf-overlay" aria-hidden="true">
            {/* 01 — starting point: bottom-left, clear of the saw */}
            <div className="cf-block cf-pos-open">
              <p className="cf-h cf-h-xl">
              <Shade t={[-1, 0, 1.8, 2.4]} />
                <Line t={[-1, 0, 1.7, 2.25]}>Creative production</Line>
                <Line t={[-1, 0, 1.75, 2.3]}>without the</Line>
                <Line t={[-1, 0, 1.8, 2.35]}>six-figure budget.</Line>
              </p>
              <p className="cf-s">
                <Fade t={[-1, 0, 1.8, 2.35]}>From a simple product photo to a stronger brand impression.</Fade>
              </p>
            </div>
            <span className="cf-fx cf-frame" data-t={w([2.3, 3.1, 4.1, 4.6])} />
            <div className="cf-block cf-pos-open">
              <p className="cf-h cf-h-l">
              <Shade t={[2.4, 3.0, 4.2, 4.75]} />
                <Line t={[2.55, 3.1, 4.2, 4.65]}>One ordinary photo.</Line>
              </p>
              <p className="cf-s">
                <Fade t={[3.0, 3.5, 4.25, 4.7]}>A starting point. Not a limit.</Fade>
              </p>
            </div>

            {/* 02 — direction: lower-left over the table, clear of the tool photo */}
            <div className="cf-block cf-pos-direct">
              <Shade t={[5.2, 5.9, 9.0, 9.65]} />
              <p className="cf-h cf-h-l">
                <Line t={[5.3, 5.9, 9.0, 9.55]}>The difference starts with direction.</Line>
              </p>
              <span className="cf-fx cf-rule" data-t={w([6.0, 8.0, 9.0, 9.55])} />
              <p className="cf-phrases">
                <Fade t={[6.3, 6.75, 9.05, 9.55]}>The story.</Fade>
                <Fade t={[6.95, 7.4, 9.1, 9.6]}>The setting.</Fade>
                <Fade t={[7.6, 8.05, 9.15, 9.65]}>The impression.</Fade>
              </p>
            </div>

            {/* 03 — product reveal: top-left negative space, after a pause */}
            <div className="cf-block cf-pos-product">
              <Shade t={[11.0, 11.7, 14.2, 14.85]} />
              <p className="cf-h cf-h-l">
                <Line t={[11.1, 11.7, 14.2, 14.8]}>Give the product a world.</Line>
              </p>
              <p className="cf-s">
                <Fade t={[11.7, 12.3, 14.25, 14.85]}>Light, texture, and context change how it is perceived.</Fade>
              </p>
            </div>

            {/* 04 — action: small, bottom-left over the apron; clears before the cut peaks */}
            <div className="cf-block cf-pos-action">
              <Shade t={[15.25, 15.85, 17.3, 17.85]} />
              <p className="cf-h cf-h-s">
                <Line t={[15.35, 15.85, 17.3, 17.8]} className="cf-mask-s">Show what it can do.</Line>
              </p>
              <p className="cf-s cf-s-s">
                <Fade t={[15.8, 16.3, 17.35, 17.85]}>Bring the product into a compelling commercial story.</Fade>
              </p>
            </div>

            {/* 05 — detail: bottom-right in the blurred dark, away from the sawdust */}
            <div className="cf-block cf-pos-detail">
              <Shade t={[19.9, 20.55, 23.6, 24.3]} />
              <p className="cf-h cf-h-l">
                <Line t={[20.0, 20.55, 23.6, 24.15]}>Make every detail count.</Line>
              </p>
              <p className="cf-phrases cf-phrases-end">
                <Fade t={[20.8, 21.2, 23.65, 24.2]}>Movement.</Fade>
                <Fade t={[21.5, 21.9, 23.7, 24.25]}>Material.</Fade>
                <Fade t={[22.2, 22.6, 23.75, 24.3]}>Character.</Fade>
              </p>
            </div>

            {/* 06 — payoff: top-left, then capabilities along the bench */}
            <div className="cf-block cf-pos-payoff">
              <Shade t={[24.9, 25.6]} />
              <p className="cf-h cf-h-l">
                <Line t={[25.0, 25.6]}>From a simple image.</Line>
                <Line t={[25.3, 25.9]}>To a stronger impression.</Line>
              </p>
              <p className="cf-s">
                <Fade t={[26.0, 26.6]}>Creative direction and AI-assisted production, built around your brand.</Fade>
              </p>
            </div>
            <div className="cf-block cf-pos-caps">
              <Shade t={[27.0, 27.6]} />
              <p className="cf-caps">
                <Fade t={[27.1, 27.6]}>Product &amp; lifestyle</Fade>
                <Fade t={[27.5, 28.0]}>Campaign &amp; brand</Fade>
                <Fade t={[27.9, 28.4]}>Film &amp; motion</Fade>
              </p>
              <p className="cf-caps-note">
                <Fade t={[28.4, 28.9]} enter={8}>Created for web, social, and paid media.</Fade>
              </p>
            </div>
          </div>

          {/* Controls: slim six-segment progress + small actions, bottom edge */}
          <div className="cf-controls">
            <nav className="cf-segs" aria-label="Film chapters">
              {CHAPTERS.map((c, i) => (
                <button key={c.id} type="button" className="cf-seg" aria-label={`Go to chapter ${i + 1}: ${c.label}`}>
                  <span className="cf-seg-track">
                    <span className="cf-seg-fill" />
                  </span>
                  <span className="cf-seg-label">
                    <span className="cf-seg-num">{pad(i + 1)}</span> {c.label}
                  </span>
                </button>
              ))}
            </nav>
            <div className="cf-actions">
              <button type="button" className="cf-watch">
                <span aria-hidden="true">▶</span> Watch the film
              </button>
              <a className="cf-skip" href="#creative-worktable">
                Skip film
              </a>
              <span className="cf-tag">{DISCLOSURE}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Static narrative: default layout, and what screen readers read ── */}
      <div className="cf-static">
        <div className="cf-static-player">
          <video
            controls
            playsInline
            preload="none"
            poster={IMG("poster")}
            src={FILM_SRC}
            aria-label="AI-assisted concept film for a reciprocating saw, 30 seconds, no audio"
          />
        </div>
        <div className="cf-static-copy">
          <h2 id="cf-heading" className="cf-static-headline">
            Creative production without the{" "}
            <span className="whitespace-nowrap">six-figure budget.</span>
          </h2>
          <p className="cf-static-lede">From a simple product photo to a stronger brand impression.</p>
          <p className="cf-static-note">{DISCLOSURE} 30 seconds, no audio.</p>
          <ol className="cf-static-list">
            {NARRATIVE.map((n, i) => (
              <li key={n.still}>
                <Image src={IMG(n.still)} alt="" width={1280} height={720} sizes="(min-width: 768px) 30vw, 90vw" />
                <p className="cf-static-num">
                  {pad(i + 1)} / {CHAPTERS[i].label}
                </p>
                <h3>{n.title}</h3>
                <p>{n.body}</p>
              </li>
            ))}
          </ol>
          <p className="cf-static-caps">
            Product &amp; lifestyle · Campaign &amp; brand · Film &amp; motion — created for web, social, and paid media.
          </p>
        </div>
      </div>

      <dialog className="cf-dialog" aria-label="AI concept film">
        <div className="cf-dialog-inner">
          <button type="button" className="cf-dialog-close" aria-label="Close film">
            ✕
          </button>
          <video controls playsInline preload="none" poster={IMG("poster")} />
          <p className="cf-static-note">{DISCLOSURE} No audio.</p>
        </div>
      </dialog>
    </section>
  );
}
