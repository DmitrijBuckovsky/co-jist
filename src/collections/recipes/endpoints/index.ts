import { matchRecipesHandler } from './match-recipes.handler';
import { Endpoint } from 'payload';

export const matchRecipes: Endpoint = {
  method: 'post',
  handler: matchRecipesHandler,
  path: '/match-recipes',
};
