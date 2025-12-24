/**
 * Normalizes text by removing diacritics (accents) and converting to lowercase
 * Useful for search matching that ignores Czech accents
 * Example: "Svíčková" -> "svickova", "Kuřecí" -> "kureci"
 */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
