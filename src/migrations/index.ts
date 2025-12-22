import * as migration_20251222_164507 from './20251222_164507';
import * as migration_20251222_213756_add_ingredients_data_to_recipes from './20251222_213756_add_ingredients_data_to_recipes';
import * as migration_20251222_221552_recipe_ingredients_cascade_delete from './20251222_221552_recipe_ingredients_cascade_delete';

export const migrations = [
  {
    up: migration_20251222_164507.up,
    down: migration_20251222_164507.down,
    name: '20251222_164507',
  },
  {
    up: migration_20251222_213756_add_ingredients_data_to_recipes.up,
    down: migration_20251222_213756_add_ingredients_data_to_recipes.down,
    name: '20251222_213756_add_ingredients_data_to_recipes',
  },
  {
    up: migration_20251222_221552_recipe_ingredients_cascade_delete.up,
    down: migration_20251222_221552_recipe_ingredients_cascade_delete.down,
    name: '20251222_221552_recipe_ingredients_cascade_delete'
  },
];
