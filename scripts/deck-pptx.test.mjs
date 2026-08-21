import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";
import { buildEditableDeck, buildPresenterDeck, LAYOUT } from "./deck-pptx.mjs";

const require = createRequire(import.meta.url);
const PptxGenJS = require("pptxgenjs");
const JSZip = require("jszip");

const deck = {
  id: "t",
  title: "Test deck",
  subtitle: "A test",
  lastVerified: "2026-08",
  slides: [
    { id: "title", type: "title", title: "Hello room", body: "Welcome.", notes: "Open warmly." },
    { id: "m", type: "method", kicker: "Method 01", title: "FIND", items: ["One", "Two", "Three"], body: "Drill.", notes: "Run it." },
    { id: "d", type: "drill", title: "The drill", minutes: 25, items: ["Do"], source: { label: "Run-sheet", url: "https://hirefrom.ph/educators" }, notes: "Keep time." },
    { id: "close", type: "close", title: "Pass it on", notes: "Thank them." },
  ],
};

async function zipOf(pptx) {
  const buffer = await pptx.write({ outputType: "nodebuffer" });
  return JSZip.loadAsync(buffer);
}

test("the editable deck has one slide and one notes page per input slide", async () => {
  const pptx = buildEditableDeck(new PptxGenJS(), deck, { photos: {}, icons: {}, diagrams: {}, attribution: "CC BY" });
  const files = Object.keys((await zipOf(pptx)).files);
  const slides = files.filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f));
  const notes = files.filter((f) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(f));
  assert.equal(slides.length, deck.slides.length);
  assert.equal(notes.length, deck.slides.length);
});

test("the editable deck carries the copy as text, not pixels", async () => {
  const pptx = buildEditableDeck(new PptxGenJS(), deck, { photos: {}, icons: {}, diagrams: {}, attribution: "CC BY" });
  const zip = await zipOf(pptx);
  const slide2 = await zip.file("ppt/slides/slide2.xml").async("string");
  assert.match(slide2, /FIND/);
  assert.match(slide2, /Three/);
  const slide3 = await zip.file("ppt/slides/slide3.xml").async("string");
  assert.match(slide3, /25 min/);
  assert.match(slide3, /hirefrom\.ph\/educators/);
  const presentation = await zip.file("ppt/presentation.xml").async("string");
  // 16:9 at 13.333in × 7.5in, in EMU.
  assert.match(presentation, new RegExp(`cx="${Math.round(LAYOUT.width * 914400)}"`));
});

test("the presenter deck refuses a slide without a screenshot", () => {
  assert.throws(() => buildPresenterDeck(new PptxGenJS(), deck, {}), /no screenshot for slide t\/title/);
});
