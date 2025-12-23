import { SIMILARITY } from '@/constants';

import { withErrorHandling } from '@/core/exceptions';
import { extractJsonBody } from '@/core/utils/json-body-extractor';
import type { PayloadRequest } from 'payload';

/**
 * Normalizes text by removing diacritics and converting to lowercase
 */
function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

interface SearchRecipesBody {
  query: string;
  limit?: number;
  difficulty?: string[];
  maxPrepTime?: number;
}

interface RecipeSearchResultDB {
  id: number;
  name: string;
  difficulty: string | null;
  prep_time_mins: number | null;
  similarity: number;
}

/**
 * POST /api/recipes/search-recipes
 *
 * Searches recipes by name using fuzzy matching (trigram similarity)
 * Ignores diacritics by searching on name_search column
 */
export const searchRecipesHandler = withErrorHandling(async (req: PayloadRequest) => {
  const body = (await extractJsonBody(req)) as SearchRecipesBody;

  if (!body?.query || typeof body.query !== 'string') {
    return Response.json({ error: 'Query is required' }, { status: 400 });
  }

  const normalizedQuery = normalizeText(body.query);
  const limit = Math.min(body.limit || 10, 50);

  if (normalizedQuery.length < 2) {
    return Response.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
  }

  // Validate difficulty values
  const validDifficulties = ['easy', 'medium', 'hard'];
  const sanitizedDifficulty = Array.isArray(body.difficulty)
    ? body.difficulty.filter((d) => validDifficulties.includes(d))
    : [];

  // Validate maxPrepTime
  const maxPrepTime = typeof body.maxPrepTime === 'number' && body.maxPrepTime > 0 ? body.maxPrepTime : null;

  // Build filter clauses
  const filters: string[] = [];
  const params: any[] = [normalizedQuery, limit];

  if (sanitizedDifficulty.length > 0) {
    params.push(sanitizedDifficulty);
    filters.push(`difficulty IS NOT NULL AND difficulty::text = ANY($${params.length}::text[])`);
  }

  if (maxPrepTime !== null) {
    params.push(maxPrepTime);
    filters.push(`prep_time_mins <= $${params.length}`);
  }

  const whereClause = filters.length > 0 ? `AND ${filters.join(' AND ')}` : '';

  // Use PostgreSQL trigram similarity for fuzzy matching
  // Falls back to LIKE if pg_trgm extension is not available
  let results: {
    id: number;
    name: string;
    difficulty: string | null;
    prep_time_mins: number | null;
    similarity: number;
  }[] = [];

  try {
    // Query using pg_trgm similarity function
    const { rows } = await req.payload.db.pool.query<RecipeSearchResultDB>(
      `
      SELECT
        id,
        name,
        difficulty,
        prep_time_mins,
        similarity(name_search, $1) as similarity
      FROM recipes
      WHERE (similarity(name_search, $1) > ${SIMILARITY}
         OR name_search LIKE '%' || $1 || '%')
         ${whereClause}
      ORDER BY similarity(name_search, $1) DESC, name ASC
      LIMIT $2
    `,
      params,
    );

    results = rows.map((r) => ({
      id: r.id,
      name: r.name,
      difficulty: r.difficulty,
      prep_time_mins: r.prep_time_mins,
      similarity: Math.round((r.similarity || 0) * 100),
    }));
  } catch {
    // Fallback to simple LIKE search if pg_trgm is not available
    const { rows } = await req.payload.db.pool.query<RecipeSearchResultDB>(
      `
      SELECT id, name, difficulty, prep_time_mins, 0 as similarity
      FROM recipes
      WHERE name_search LIKE '%' || $1 || '%'
        ${whereClause}
      ORDER BY name ASC
      LIMIT $2
    `,
      params,
    );

    results = rows.map((r) => ({
      id: r.id,
      name: r.name,
      difficulty: r.difficulty,
      prep_time_mins: r.prep_time_mins,
      similarity: 0,
    }));
  }

  return Response.json({
    success: true,
    data: {
      query: body.query,
      totalResults: results.length,
      recipes: results,
    },
  });
});
