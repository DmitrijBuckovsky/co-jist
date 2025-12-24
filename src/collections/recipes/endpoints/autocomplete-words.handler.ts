import { withErrorHandling } from '@/core/exceptions';
import type { PayloadRequest } from 'payload';

interface RecipeRow {
  name: string;
  name_search: string;
}

/**
 * GET /api/recipes/autocomplete-words
 *
 * Returns unique words from all recipe names for client-side autocomplete.
 * Uses name_search (already normalized) paired with original words from name.
 */
export const autocompleteWordsHandler = withErrorHandling(async (req: PayloadRequest) => {
  const { rows } = await req.payload.db.pool.query<RecipeRow>(
    `SELECT name, name_search FROM recipes ORDER BY name ASC`,
  );

  // Extract unique words from all recipe names
  // Map normalized word -> original word (with diacritics)
  const words = new Map<string, string>();

  for (const recipe of rows) {
    const originalWords = recipe.name.split(/\s+/);
    const normalizedWords = recipe.name_search.split(/\s+/);

    for (let i = 0; i < originalWords.length && i < normalizedWords.length; i++) {
      const normalized = normalizedWords[i];
      const original = originalWords[i];
      if (normalized && normalized.length >= 2 && !words.has(normalized)) {
        words.set(normalized, original);
      }
    }
  }

  const result = Array.from(words.entries())
    .map(([wordSearch, word]) => ({ word, wordSearch }))
    .sort((a, b) => a.word.localeCompare(b.word, 'cs'));

  return Response.json({
    success: true,
    data: result,
  });
});
