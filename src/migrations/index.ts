import * as migration_20251222_164507 from './20251222_164507';
import * as migration_20251222_213756_add_ingredients_data_to_recipes from './20251222_213756_add_ingredients_data_to_recipes';
import * as migration_20251222_221552_recipe_ingredients_cascade_delete from './20251222_221552_recipe_ingredients_cascade_delete';
import * as migration_20251223_155130_add_recipe_name_search from './20251223_155130_add_recipe_name_search';
import * as migration_20251223_183051_add_recipe_difficulty from './20251223_183051_add_recipe_difficulty';

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
    name: '20251222_221552_recipe_ingredients_cascade_delete',
  },
  {
    up: migration_20251223_155130_add_recipe_name_search.up,
    down: migration_20251223_155130_add_recipe_name_search.down,
    name: '20251223_155130_add_recipe_name_search',
  },
  {
    up: migration_20251223_183051_add_recipe_difficulty.up,
    down: migration_20251223_183051_add_recipe_difficulty.down,
    name: '20251223_183051_add_recipe_difficulty'
  },
];
