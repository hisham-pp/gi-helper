/**
 * GOOD keys are the English name in PascalCase with only letters and digits:
 * apostrophes and quotes join their word ("Hero's Wit" → "HerosWit"), and any
 * other separator (space, hyphen, colon, dash) starts a new word
 * ("Ascended Sample: Knight" → "AscendedSampleKnight"). The same rule names
 * materials, characters, weapons and artifact sets (Genshin Optimizer's
 * "remove all symbols, capitalize each word").
 */
export function toGOODKey(name: string): string {
  return name
    .replace(/['‘’"“”]/g, "")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}
