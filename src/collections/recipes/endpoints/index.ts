import { autocompleteWordsHandler } from './autocomplete-words.handler';
import { listRecipesHandler } from './list-recipes.handler';
import { matchRecipesHandler } from './match-recipes.handler';
import { randomRecipesHandler } from './random-recipes.handler';
import { searchRecipesHandler } from './search-recipes.handler';
import { Endpoint } from 'payload';

export const autocompleteWords: Endpoint = {
  method: 'get',
  handler: autocompleteWordsHandler,
  path: '/autocomplete-words',
};

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

export const randomRecipes: Endpoint = {
  method: 'get',
  handler: randomRecipesHandler,
  path: '/random-recipes',
};
