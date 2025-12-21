import type { CollectionBeforeChangeHook } from 'payload';

/**
 * Converts the name field to lowercase for consistent searching
 */
export const normalizeCategoryNameHook: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  // Convert name to lowercase whenever name is present
  if (data.name) {
    data.name = data.name.toLowerCase().trim();
  }
  return data;
};
