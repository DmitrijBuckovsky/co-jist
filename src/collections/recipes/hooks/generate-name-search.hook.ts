import { normalizeText } from '@/core/utils/normalize-text';
import type { CollectionBeforeChangeHook } from 'payload';

/**
 * Auto-generates the name_search field from the name field
 */
export const generateNameSearchHook: CollectionBeforeChangeHook = async ({ data }) => {
  if (data.name) {
    data.name_search = normalizeText(data.name);
  }
  return data;
};
