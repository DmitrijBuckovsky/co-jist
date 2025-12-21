/**
 * Extracts objects from a Payload CMS relation field (single or array).
 */
export function extractRelation<T>(
  relation: T | number | string | (T | number | string)[] | null | undefined,
): T | null;
export function extractRelation<T>(
  relation: T | number | string | (T | number | string)[] | null | undefined,
  multiple: true,
): T[];
export function extractRelation<T>(
  relation: T | number | string | (T | number | string)[] | null | undefined,
  multiple?: boolean,
): T | T[] | null {
  if (!relation) {
    return multiple ? [] : null;
  }

  if (Array.isArray(relation)) {
    return relation.filter((item): item is T => typeof item === 'object') as T[];
  }

  if (typeof relation === 'object') {
    return multiple ? [relation as T] : (relation as T);
  }

  return multiple ? [] : null;
}

export function extractRelationId(relation: { id: number } | number | null | undefined): number | null {
  if (!relation) {
    return null;
  }

  if (typeof relation === 'object') {
    return relation.id;
  }

  return relation;
}
