import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_recipes_difficulty" AS ENUM('easy', 'medium', 'hard');
  ALTER TABLE "recipes" ADD COLUMN "difficulty" "enum_recipes_difficulty";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "recipes" DROP COLUMN "difficulty";
  DROP TYPE "public"."enum_recipes_difficulty";`)
}
