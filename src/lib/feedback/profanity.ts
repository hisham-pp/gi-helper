import { Filter } from "bad-words";

/**
 * Bad-word filter for feedback names and messages, built on the `bad-words`
 * package. Words only match on their own, so "class", "Scunthorpe" or
 * "cocktail" are left alone; a bad word is masked with asterisks ("****").
 *
 * The send form uses it to warn while typing; the server masks with it before
 * saving, so stored messages are already clean.
 */

/** In the default list, but normal on a Genshin site (Archons are gods) or a surname. */
const ALLOWED = ["god", "hell", "pawn", "lust", "wang"];

const filter = new Filter({
  exclude: ALLOWED,
  // The default (/\b|_/g) drops underscores from the text it returns
  splitRegex: /\b/,
});

/** True when the text has a word the filter would mask. */
export function containsProfanity(text: string): boolean {
  return filter.isProfane(text);
}

/** The text with each bad word masked. */
export function censorProfanity(text: string): string {
  // clean() checks the whole list for every word; skip it for clean text
  return text && filter.isProfane(text) ? filter.clean(text) : text;
}
