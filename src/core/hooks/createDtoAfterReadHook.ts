import { UserRole } from '@/collections/users/users.config';
import { CollectionAfterReadHook } from 'payload';

/**
 * Creates a reusable afterRead hook that returns full document for admins and Local API,
 * otherwise returns a DTO instance for regular users.
 *
 * @param DtoClass - The DTO class constructor to use for regular users
 * @returns An afterRead hook function
 */
export function createDtoAfterReadHook<TDoc, TDto>(DtoClass: new (doc: TDoc) => TDto): CollectionAfterReadHook {
  return async ({ req, doc }) => {
    // For admin panel return full doc
    if (req?.user && req.user?.role === UserRole.Admin) return doc;

    // For Local API requests return full doc. This is called from Local API too, lol.
    if (!req?.method) return doc;

    // Regular users can only see some fields
    return new DtoClass(doc);
  };
}
