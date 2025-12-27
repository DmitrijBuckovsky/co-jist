'use client';
import { getDifficultyLabel } from '../_utils/difficulty';
import { Allergen, AllergenBadge } from './AllergenBadge';
import { GoogleIcon } from './GoogleIcon';
import { PageHeader } from './PageHeader';
import { CalendarCheck } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface RecipeIngredient {
  id: number;
  amount: string;
  is_main: boolean;
  ingredient:
    | {
        id: number;
        name: string;
        allergens?: Allergen[];
      }
    | number;
}

interface Recipe {
  id: number;
  name: string;
  difficulty?: string;
  instructions?: string;
  prep_time_mins?: number;
  servings?: number;
}

interface RecipeDetailProps {
  recipeId: number;
}

export function RecipeDetail({ recipeId }: RecipeDetailProps) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<number>>(new Set());

  useEffect(() => {
    const loadData = async () => {
      try {
        const [recipeRes, ingredientsRes] = await Promise.all([
          fetch(`/api/recipes/${recipeId}?depth=0`),
          fetch(`/api/recipe-ingredients?where[recipe][equals]=${recipeId}&depth=2&limit=100`),
        ]);

        if (!recipeRes.ok) throw new Error('Not found');

        const recipeData = await recipeRes.json();
        const ingredientsData = await ingredientsRes.json();

        setRecipe(recipeData);
        setIngredients(ingredientsData.docs || []);
      } catch (err) {
        setError('Recipe not found');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const saved = localStorage.getItem('selectedIngredients');
    if (saved) {
      try {
        setSelectedIngredients(new Set(JSON.parse(saved)));
      } catch {}
    }
  }, [recipeId]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-loading">
          <div className="spinner" />
          <p>Načítání...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="page-container">
        <PageHeader title="Nenalezeno" />
      </div>
    );
  }

  const main = ingredients.filter((ri) => ri.is_main);
  const extra = ingredients.filter((ri) => !ri.is_main);

  const handleGoogleSearch = () => {
    const searchQuery = `Recept: "${recipe.name}"`;
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    window.open(googleUrl, '_blank');
  };

  return (
    <div className="page-container">
      <PageHeader title={recipe.name}>
        <Link href={`/?view=zerowaste&recipeId=${recipe.id}`} className="google-search-btn" title="Plán">
          <CalendarCheck size={20} />
        </Link>
        <button onClick={handleGoogleSearch} className="google-search-btn" title="Hledat na Google">
          <GoogleIcon size={20} />
        </button>
      </PageHeader>

      {(recipe.difficulty || recipe.prep_time_mins || recipe.servings) && (
        <div className="detail-meta">
          {recipe.difficulty && (
            <span className={`difficulty-badge ${recipe.difficulty}`}>{getDifficultyLabel(recipe.difficulty)}</span>
          )}
          {recipe.prep_time_mins && <span>{recipe.prep_time_mins} min</span>}
          {recipe.servings && <span>{recipe.servings} servings</span>}
        </div>
      )}

      <div className="detail-grid">
        <section className="detail-section">
          <h2>Ingredience</h2>

          {main.length > 0 && (
            <div className="ingredients-group">
              <h3>Hlavní</h3>
              <ul className="detail-ingredients">
                {main.map((ri) => {
                  const ing = typeof ri.ingredient === 'object' ? ri.ingredient : null;
                  if (!ing) return null;
                  const have = selectedIngredients.has(ing.id);
                  return (
                    <li key={ri.id} className={have ? 'have' : 'missing'}>
                      <span className="amount">{ri.amount}</span>
                      <span className="name">
                        {ing.name}
                        {ing.allergens && ing.allergens.length > 0 && <AllergenBadge allergens={ing.allergens} />}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {extra.length > 0 && (
            <div className="ingredients-group">
              <h3>Doplňkové</h3>
              <ul className="detail-ingredients">
                {extra.map((ri) => {
                  const ing = typeof ri.ingredient === 'object' ? ri.ingredient : null;
                  if (!ing) return null;
                  const have = selectedIngredients.has(ing.id);
                  return (
                    <li key={ri.id} className={have ? 'have' : 'missing'}>
                      <span className="amount">{ri.amount}</span>
                      <span className="name">
                        {ing.name}
                        {ing.allergens && ing.allergens.length > 0 && <AllergenBadge allergens={ing.allergens} />}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>

        {recipe.instructions && (
          <section className="detail-section">
            <h2>Postup</h2>
            <div className="detail-instructions">
              {recipe.instructions.split('\n').map((step, i) => step.trim() && <p key={i}>{step}</p>)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
