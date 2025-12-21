'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface RecipeIngredient {
  id: number;
  amount: string;
  is_main: boolean;
  ingredient: {
    id: number;
    name: string;
    category: {
      name: string;
    };
  };
}

interface Recipe {
  id: number;
  name: string;
  description?: string;
  instructions?: string;
  recipe_ingredients?: RecipeIngredient[];
}

interface RecipeDetailProps {
  recipeId: number;
}

export function RecipeDetail({ recipeId }: RecipeDetailProps) {
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecipe();
  }, [recipeId]);

  const fetchRecipe = async () => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}?depth=3`);
      if (!response.ok) {
        throw new Error('Recipe not found');
      }
      const data = await response.json();
      setRecipe(data);
    } catch (error) {
      console.error('Failed to fetch recipe:', error);
      setError('Failed to load recipe. It may have been deleted.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToResults = () => {
    router.push('/results');
  };

  const handleNewSearch = () => {
    localStorage.removeItem('recipeMatches');
    localStorage.removeItem('selectedIngredients');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="recipe-detail">
        <div className="content">
          <h1>Loading recipe...</h1>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="recipe-detail">
        <div className="content">
          <h1>Recipe Not Found</h1>
          <p>{error || 'The recipe you\'re looking for doesn\'t exist.'}</p>
          <div className="actions">
            <button onClick={handleBackToResults} className="back-btn">
              Back to Results
            </button>
            <button onClick={handleNewSearch} className="new-search-btn">
              New Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  const mainIngredients = recipe.recipe_ingredients?.filter(ri => ri.is_main) || [];
  const secondaryIngredients = recipe.recipe_ingredients?.filter(ri => !ri.is_main) || [];

  return (
    <div className="recipe-detail">
      <div className="content">
        <div className="recipe-header">
          <h1>{recipe.name}</h1>
          <div className="recipe-actions">
            <button onClick={handleBackToResults} className="back-btn">
              ← Back to Results
            </button>
            <button onClick={handleNewSearch} className="new-search-btn">
              New Search
            </button>
          </div>
        </div>

        {recipe.description && (
          <div className="recipe-description">
            <h2>Description</h2>
            <p>{recipe.description}</p>
          </div>
        )}

        <div className="ingredients-section">
          {mainIngredients.length > 0 && (
            <div className="ingredients-group">
              <h2>Main Ingredients</h2>
              <ul className="ingredients-list">
                {mainIngredients.map(ri => (
                  <li key={ri.id} className="ingredient-item main">
                    <span className="amount">{ri.amount}</span>
                    <span className="name">{ri.ingredient.name}</span>
                    <span className="category">({ri.ingredient.category.name})</span>
                    <span className="main-indicator">⭐</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {secondaryIngredients.length > 0 && (
            <div className="ingredients-group">
              <h2>Secondary Ingredients</h2>
              <ul className="ingredients-list">
                {secondaryIngredients.map(ri => (
                  <li key={ri.id} className="ingredient-item secondary">
                    <span className="amount">{ri.amount}</span>
                    <span className="name">{ri.ingredient.name}</span>
                    <span className="category">({ri.ingredient.category.name})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {recipe.instructions && (
          <div className="instructions-section">
            <h2>Instructions</h2>
            <div className="instructions">
              {recipe.instructions.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
