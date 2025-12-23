import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Enable extensions for fuzzy search
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS unaccent;`);

  // Add name_search column with default empty string for existing rows
  await db.execute(sql`
    ALTER TABLE "recipes" ADD COLUMN "name_search" varchar NOT NULL DEFAULT '';
  `);

  // Populate name_search from existing name values (normalize: remove diacritics, lowercase)
  await db.execute(sql`
    UPDATE "recipes"
    SET name_search = LOWER(unaccent(name))
    WHERE name_search = '';
  `);

  // Create GIN index for trigram similarity search
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "recipes_name_search_trgm_idx"
    ON "recipes" USING GIN (name_search gin_trgm_ops);
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP INDEX IF EXISTS "recipes_name_search_trgm_idx";`);
  await db.execute(sql`ALTER TABLE "recipes" DROP COLUMN "name_search";`);
}
