import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Drop existing foreign key constraints and recreate with CASCADE
  await db.execute(sql`
    ALTER TABLE "recipe_ingredients"
    DROP CONSTRAINT IF EXISTS "recipe_ingredients_recipe_id_recipes_id_fk";
  `);

  await db.execute(sql`
    ALTER TABLE "recipe_ingredients"
    ADD CONSTRAINT "recipe_ingredients_recipe_id_recipes_id_fk"
    FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
  `);

  await db.execute(sql`
    ALTER TABLE "recipe_ingredients"
    DROP CONSTRAINT IF EXISTS "recipe_ingredients_ingredient_id_ingredients_id_fk";
  `);

  await db.execute(sql`
    ALTER TABLE "recipe_ingredients"
    ADD CONSTRAINT "recipe_ingredients_ingredient_id_ingredients_id_fk"
    FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Revert to original constraints (SET NULL on delete)
  await db.execute(sql`
    ALTER TABLE "recipe_ingredients"
    DROP CONSTRAINT IF EXISTS "recipe_ingredients_recipe_id_recipes_id_fk";
  `);

  await db.execute(sql`
    ALTER TABLE "recipe_ingredients"
    ADD CONSTRAINT "recipe_ingredients_recipe_id_recipes_id_fk"
    FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
  `);

  await db.execute(sql`
    ALTER TABLE "recipe_ingredients"
    DROP CONSTRAINT IF EXISTS "recipe_ingredients_ingredient_id_ingredients_id_fk";
  `);

  await db.execute(sql`
    ALTER TABLE "recipe_ingredients"
    ADD CONSTRAINT "recipe_ingredients_ingredient_id_ingredients_id_fk"
    FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
  `);
}
