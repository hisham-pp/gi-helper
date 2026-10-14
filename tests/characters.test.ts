import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  characterAvatarUrl,
  getAllCharacters,
  getCharacter,
  randomCharacter,
} from "../src/lib/characters";
import { detectImageType } from "../src/lib/feedback/images";

const characters = getAllCharacters();

test("characters have unique ids the database accepts as avatars", () => {
  assert.ok(characters.length > 100, `only ${characters.length} characters`);
  const ids = new Set<string>();
  for (const character of characters) {
    // Same pattern as the feedback_private.entries.avatar check
    assert.match(character.id, /^[a-z0-9-]{1,40}$/, character.name);
    assert.ok(!ids.has(character.id), `duplicate id ${character.id}`);
    ids.add(character.id);
    assert.ok(character.name.trim().length > 0 && character.name.length <= 40, character.id);
    assert.ok([4, 5].includes(character.rarity), `${character.name} rarity ${character.rarity}`);
  }
});

test("every character has a WebP avatar and nothing else is stored", () => {
  const dir = path.join(process.cwd(), "public", "images", "character-avatars");
  const files = new Set(fs.readdirSync(dir));
  for (const character of characters) {
    const file = path.basename(characterAvatarUrl(character.id));
    assert.ok(files.has(file), `missing avatar for ${character.name}`);
    const bytes = new Uint8Array(fs.readFileSync(path.join(dir, file)));
    assert.equal(detectImageType(bytes), "image/webp", file);
    assert.ok(bytes.length < 20 * 1024, `${file} is ${bytes.length} bytes`);
  }
  assert.equal(files.size, characters.length, "avatars without a character");
});

test("getCharacter finds listed ids only", () => {
  assert.equal(getCharacter("hu-tao")?.name, "Hu Tao");
  assert.equal(getCharacter("not-a-character"), undefined);
  assert.equal(getCharacter(null), undefined);
});

test("randomCharacter never repeats the character it re-rolls", () => {
  for (let i = 0; i < 200; i++) {
    const current = randomCharacter();
    assert.ok(getCharacter(current.id));
    assert.notEqual(randomCharacter(current.id).id, current.id);
  }
});
