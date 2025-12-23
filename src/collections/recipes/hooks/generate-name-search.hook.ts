import type { CollectionBeforeChangeHook } from 'payload';

/**
 * Normalizes text by removing diacritics (accents) and converting to lowercase
 * Example: "Svíčková" -> "svickova", "Kuřecí" -> "kureci"
 */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Auto-generates the name_search field from the name field
 */
export const generateNameSearchHook: CollectionBeforeChangeHook = async ({ data }) => {
  if (data.name) {
    data.name_search = normalizeText(data.name);
  }
  return data;
};
