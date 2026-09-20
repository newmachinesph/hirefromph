/**
 * Slide JSON → pptxgenjs, two ways.
 *
 *   buildEditableDeck(pptx, deck, assets)  — real text boxes, shapes and images
 *   buildPresenterDeck(pptx, deck, shots)  — one full-bleed PNG per slide
 *
 * Pure: takes a pptxgenjs instance and file paths, touches no network and no
 * server, so scripts/deck-pptx.test.mjs can run it with node --test. The
 * geometry mirrors components/deck/slides.tsx at 1920×1080 → 13.333in×7.5in,
 * i.e. 144 px per inch. Font sizes are points: px × 0.5 at that density.
 */

export const LAYOUT = { name: "HFPH_16x9", width: 13.333, height: 7.5 };
const PX = 144;
const px = (n) => n / PX;

export const COLORS = {
  ink: "161A24",
  inkSoft: "464C5C",
  inkFaint: "5F6575",
  paper: "FFFFFF",
  band: "F3F4F6",
  tint: "EAF0FB",
  primary: "043882",
  primarySoft: "AFC5EE",
  onNavy: "FFFFFF",
  onNavySoft: "EAF0FB",
};

const FONT = "Inter";
const NAVY_TYPES = new Set(["title", "chapter", "close"]);
const PAD = 120;
const CONTENT_W = 1920 - PAD * 2;

function text(slide, value, opts) {
  slide.addText(value, { fontFace: FONT, margin: 0, ...opts });
}

function footer(slide, s, n, of, attribution, navy) {
  const color = navy ? COLORS.onNavySoft : COLORS.inkFaint;
  const left = s.source ? `${s.source.label} · ${s.source.url.replace(/^https?:\/\//, "")}` : attribution;
  text(slide, left, { x: px(PAD), y: px(1080 - 96), w: px(CONTENT_W - 200), h: px(40), fontSize: 11, color });
  text(slide, `${n} / ${of}`, { x: px(1920 - PAD - 200), y: px(1080 - 96), w: px(200), h: px(40), fontSize: 11, color, align: "right" });
}

function kicker(slide, value, y, navy, opts = {}) {
  if (!value) return y;
  text(slide, value.toUpperCase(), {
    x: px(opts.x ?? PAD), y: px(y), w: px(opts.w ?? CONTENT_W), h: px(40),
    fontSize: 14, bold: true, charSpacing: 3, color: navy ? COLORS.primarySoft : COLORS.primary,
  });
  return y + 64;
}

function title(slide, value, y, size, navy, opts = {}) {
  const w = opts.w ?? CONTENT_W;
  const lines = Math.max(1, Math.ceil((value.length * size * 0.52) / w));
  const h = lines * size * 1.08 + 16;
  text(slide, value, {
    x: px(opts.x ?? PAD), y: px(y), w: px(w), h: px(h),
    fontSize: size * 0.5, bold: true, color: navy ? COLORS.onNavy : COLORS.ink, valign: "top",
    lineSpacingMultiple: 1.02,
  });
  return y + h + 24;
}

function body(slide, value, y, size, navy, opts = {}) {
  if (!value) return y;
  const w = opts.w ?? Math.min(CONTENT_W, 1300);
  const lines = Math.max(1, Math.ceil((value.length * size * 0.5) / w));
  const h = lines * size * 1.4 + 12;
  text(slide, value, {
    x: px(opts.x ?? PAD), y: px(y), w: px(w), h: px(h),
    fontSize: size * 0.5, color: navy ? COLORS.onNavySoft : COLORS.inkSoft, valign: "top",
    lineSpacingMultiple: 1.15,
  });
  return y + h + 16;
}

function items(slide, list, y, navy, opts = {}) {
  if (!list?.length) return y;
  const size = opts.size ?? 34;
  const w = opts.w ?? CONTENT_W;
  const runs = list.map((item) => ({
    text: item,
    options: {
      bullet: opts.numbered ? { type: "number" } : { indent: 28 },
      fontSize: size * 0.5,
      color: navy ? COLORS.onNavy : COLORS.ink,
      breakLine: true,
      paraSpaceAfter: size * 0.32,
    },
  }));
  const lines = list.reduce((sum, item) => sum + Math.max(1, Math.ceil((item.length * size * 0.5) / w)), 0);
  const h = lines * size * 1.35 + list.length * size * 0.32 + 20;
  slide.addText(runs, { x: px(opts.x ?? PAD), y: px(y), w: px(w), h: px(h), fontFace: FONT, margin: 0, valign: "top" });
  return y + h;
}

/**
 * @param pptx a `new PptxGenJS()`
 * @param deck the validated deck JSON
 * @param assets { photos: {[photoId]: absPath}, icons: {[iconId]: absPath}, diagrams: {[slideId]: absPath}, attribution }
 */
export function buildEditableDeck(pptx, deck, assets) {
  pptx.defineLayout(LAYOUT);
  pptx.layout = LAYOUT.name;
  pptx.title = deck.title;
  pptx.subject = deck.subtitle;
  pptx.author = "Hire From PH";

  const of = deck.slides.length;
  deck.slides.forEach((s, index) => {
    const n = index + 1;
    const navy = NAVY_TYPES.has(s.type);
    const slide = pptx.addSlide();
    const band = s.type === "list" || s.type === "drill";
    slide.background = { color: navy ? COLORS.ink : band ? COLORS.band : COLORS.paper };

    const photo = s.media?.photo && assets.photos?.[s.media.photo];
    if (navy && photo) {
      slide.addImage({ path: photo, x: 0, y: 0, w: LAYOUT.width, h: LAYOUT.height, sizing: { type: "cover", w: LAYOUT.width, h: LAYOUT.height } });
      // Scrim so the type stays legible over any photo.
      slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: LAYOUT.width, h: LAYOUT.height, fill: { color: COLORS.ink, transparency: 28 }, line: { color: COLORS.ink, transparency: 100 } });
    }

    let y = PAD;
    switch (s.type) {
      case "title": {
        y = 540;
        y = kicker(slide, s.kicker ?? deck.subtitle, y, navy);
        y = title(slide, s.title, y, 120, navy);
        body(slide, s.body, y, 44, navy);
        break;
      }
      case "chapter":
      case "close": {
        y = s.type === "close" ? 300 : 520;
        y = kicker(slide, s.kicker, y, navy);
        y = title(slide, s.title, y, 104, navy);
        y = body(slide, s.body, y, 44, navy);
        items(slide, s.items, y, navy);
        break;
      }
      case "method": {
        const icon = s.media?.icon && assets.icons?.[s.media.icon];
        if (icon) slide.addImage({ path: icon, x: px(PAD), y: px(PAD + 40), w: px(360), h: px(360) });
        const x = PAD + 440;
        const w = CONTENT_W - 440;
        y = kicker(slide, s.kicker, y, navy, { x, w });
        y = title(slide, s.title, y, 76, navy, { x, w });
        y = items(slide, s.items, y, navy, { x, w, numbered: true, size: 34 });
        if (s.body) {
          slide.addShape(pptx.ShapeType.rect, { x: px(x), y: px(y + 8), w: px(w), h: px(120), fill: { color: COLORS.tint }, line: { color: COLORS.tint } });
          text(slide, s.body, { x: px(x + 32), y: px(y + 8), w: px(w - 64), h: px(120), fontSize: 15, color: COLORS.ink, valign: "middle" });
        }
        break;
      }
      case "diagram": {
        y = kicker(slide, s.kicker, y, navy);
        y = title(slide, s.title, y, 64, navy);
        y = body(slide, s.body, y, 34, navy);
        const raster = assets.diagrams?.[s.id];
        if (raster) {
          const top = Math.max(y, 400);
          const h = Math.min(560, 1080 - 140 - top);
          slide.addImage({ path: raster, x: px(PAD), y: px(top), w: px(CONTENT_W), h: px(h), sizing: { type: "contain", w: px(CONTENT_W), h: px(h) } });
        }
        break;
      }
      case "drill": {
        y = kicker(slide, s.kicker, y, navy);
        if (s.minutes !== undefined) {
          slide.addShape(pptx.ShapeType.roundRect, { x: px(1920 - PAD - 200), y: px(PAD - 8), w: px(200), h: px(56), fill: { color: COLORS.primary }, line: { color: COLORS.primary }, rectRadius: 0.19 });
          text(slide, `${s.minutes} min`, { x: px(1920 - PAD - 200), y: px(PAD - 8), w: px(200), h: px(56), fontSize: 14, bold: true, color: COLORS.paper, align: "center", valign: "middle" });
        }
        y = title(slide, s.title, y, 76, navy);
        y = body(slide, s.body, y, 36, navy);
        items(slide, s.items, y, navy, { numbered: true });
        break;
      }
      case "list": {
        y = kicker(slide, s.kicker, y, navy);
        y = title(slide, s.title, y, 76, navy);
        y = body(slide, s.body, y, 36, navy);
        items(slide, s.items, y, navy);
        break;
      }
      default: {
        y = 280;
        y = kicker(slide, s.kicker, y, navy);
        y = title(slide, s.title, y, 92, navy);
        y = body(slide, s.body, y, 40, navy);
        items(slide, s.items, y, navy);
      }
    }

    footer(slide, s, n, of, assets.attribution ?? "", navy);
    if (s.notes) slide.addNotes(s.notes);
  });
  return pptx;
}

/**
 * @param shots {[slideId]: absPath to a 1920×1080 PNG}
 */
export function buildPresenterDeck(pptx, deck, shots) {
  pptx.defineLayout(LAYOUT);
  pptx.layout = LAYOUT.name;
  pptx.title = `${deck.title} (presenter)`;
  pptx.author = "Hire From PH";
  for (const s of deck.slides) {
    const shot = shots[s.id];
    if (!shot) throw new Error(`no screenshot for slide ${deck.id}/${s.id}`);
    const slide = pptx.addSlide();
    slide.addImage({ path: shot, x: 0, y: 0, w: LAYOUT.width, h: LAYOUT.height });
    if (s.notes) slide.addNotes(s.notes);
  }
  return pptx;
}
