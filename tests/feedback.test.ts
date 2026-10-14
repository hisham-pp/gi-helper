import test from "node:test";
import assert from "node:assert/strict";
import { censorProfanity, containsProfanity } from "../src/lib/feedback/profanity";
import { detectImageType } from "../src/lib/feedback/images";
import { feedbackErrorMessage, FEEDBACK_LIMITS } from "../src/lib/feedback/types";

test("censorProfanity masks bad words and keeps the rest of the text", () => {
  assert.equal(censorProfanity("what the fuck is this"), "what the **** is this");
  assert.equal(censorProfanity("This SHIT scanner"), "This **** scanner");
  assert.equal(censorProfanity("fuck, shit!"), "****, ****!");
});

test("censorProfanity leaves clean text exactly as written", () => {
  const text = "Hero's Wit read 1234 instead of 1284.\nsnake_case and  double  spaces stay.";
  assert.equal(censorProfanity(text), text);
  assert.equal(censorProfanity(""), "");
});

test("words that only contain a bad word are not masked", () => {
  for (const text of ["Scunthorpe", "class assessment", "a cocktail", "Dickens", "grass"]) {
    assert.equal(containsProfanity(text), false, text);
    assert.equal(censorProfanity(text), text);
  }
});

test("game words on the allow list are not masked", () => {
  const text = "Zhongli is a god, the Abyss is hell, Wang the merchant";
  assert.equal(containsProfanity(text), false);
  assert.equal(censorProfanity(text), text);
});

test("containsProfanity flags bad words in any case", () => {
  assert.equal(containsProfanity("you are an ASSHOLE"), true);
  assert.equal(containsProfanity("Love the new inventory page!"), false);
});

test("detectImageType reads PNG, JPEG and WebP signatures", () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
  const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0]);
  const webp = new Uint8Array([0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50, 0]);
  assert.equal(detectImageType(png), "image/png");
  assert.equal(detectImageType(jpeg), "image/jpeg");
  assert.equal(detectImageType(webp), "image/webp");
});

test("detectImageType rejects SVG, GIF and other files whatever they claim to be", () => {
  const encoder = new TextEncoder();
  assert.equal(detectImageType(encoder.encode("<svg xmlns='http://www.w3.org/2000/svg'/>")), null);
  assert.equal(detectImageType(encoder.encode("GIF89a")), null);
  assert.equal(detectImageType(encoder.encode("RIFF1234WAVE")), null);
  assert.equal(detectImageType(new Uint8Array()), null);
});

test("feedbackErrorMessage explains known codes and falls back for unknown ones", () => {
  assert.match(feedbackErrorMessage("rate_limited"), /wait a few minutes/);
  assert.match(feedbackErrorMessage("invalid_message"), new RegExp(String(FEEDBACK_LIMITS.messageMax)));
  assert.equal(feedbackErrorMessage("something_else"), feedbackErrorMessage("unavailable"));
  assert.equal(feedbackErrorMessage(undefined), feedbackErrorMessage("unavailable"));
});
