import type { CollectionBeforeChangeHook } from 'payload';

/**
 * Normalizes text by removing diacritics (accents) and converting to lowercase
 * Example: "Café" -> "cafe", "Müller" -> "muller"
 */
function normalizeText(text: string): string {
  return text
    .normalize('NFD') // Decompose characters into base + combining marks
    .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
    .toLowerCase()
    .trim();
}

/**
 * Auto-generates the name_search field from the name field
 * whenever the name is present (on create or update)
 */
export const generateNameSearchHook: CollectionBeforeChangeHook = async ({ data }) => {
  // Auto-generate name_search from name whenever name is present
  if (data.name) {
    data.name_search = normalizeText(data.name);
  }
  return data;
};
