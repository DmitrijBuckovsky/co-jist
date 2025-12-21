import { Endpoint } from 'payload';
import { matchRecipesHandler } from './match-recipes.handler';

export const matchRecipes: Endpoint = {
  method: 'post',
  handler: matchRecipesHandler,
  path: '/match-recipes',
};
