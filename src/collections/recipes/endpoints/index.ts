import { listRecipesHandler } from './list-recipes.handler';
import { matchRecipesHandler } from './match-recipes.handler';
import { searchRecipesHandler } from './search-recipes.handler';
import { Endpoint } from 'payload';

export const matchRecipes: Endpoint = {
  method: 'post',
  handler: matchRecipesHandler,
  path: '/match-recipes',
};

export const searchRecipes: Endpoint = {
  method: 'post',
  handler: searchRecipesHandler,
  path: '/search-recipes',
};

export const listRecipes: Endpoint = {
  method: 'post',
  handler: listRecipesHandler,
  path: '/list-recipes',
};
