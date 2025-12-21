'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Ingredient {
  id: number;
  name: string;
  category: {
    id: number;
    name: string;
  };
}

interface Category {
  id: number;
  name: string;
  ingredients: Ingredient[];
}

interface RecipeMatch {
  id: number;
  name: string;
  mainTotal: number;
  mainHave: number;
  secondaryTotal: number;
  secondaryHave: number;
  missingMain: number;
  missingSecondary: number;
  missingTotal: number;
  score: number;
}

export function IngredientSelector() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await fetch('/api/ingredients?depth=2&limit=1000');
      const data = await response.json();

      // Group ingredients by category
      const categoryMap = new Map<number, Category>();

      data.docs.forEach((ingredient: Ingredient) => {
        const categoryId = ingredient.category.id;
        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            id: categoryId,
            name: ingredient.category.name,
            ingredients: [],
          });
        }
        categoryMap.get(categoryId)!.ingredients.push(ingredient);
      });

      // Sort categories and ingredients alphabetically
      const sortedCategories = Array.from(categoryMap.values())
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(category => ({
          ...category,
          ingredients: category.ingredients.sort((a, b) => a.name.localeCompare(b.name)),
        }));

      setCategories(sortedCategories);
    } catch (error) {
      console.error('Failed to fetch ingredients:', error);
      setError('Failed to load ingredients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleIngredientToggle = (ingredientId: number) => {
    setSelectedIngredients(prev =>
      prev.includes(ingredientId)
        ? prev.filter(id => id !== ingredientId)
        : [...prev, ingredientId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedIngredients.length === 0) {
      setError('Please select at least one ingredient.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/recipes/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredientIds: selectedIngredients }),
      });

      if (!response.ok) {
        throw new Error('Failed to match recipes');
      }

      const result = await response.json();

      // Store results in localStorage and navigate to results page
      localStorage.setItem('recipeMatches', JSON.stringify(result.data));
      localStorage.setItem('selectedIngredients', JSON.stringify(selectedIngredients));
      router.push('/results');
    } catch (error) {
      console.error('Failed to match recipes:', error);
      setError('Failed to find recipes. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="ingredient-selector">
        <div className="content">
          <h1>Find Recipes</h1>
          <div className="loading">Loading ingredients...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ingredient-selector">
      <div className="content">
        <h1>Find Recipes by Ingredients</h1>
        <p>Select the ingredients you have available and we'll find recipes you can make!</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="ingredients-grid">
            {categories.map(category => (
              <div key={category.id} className="category-section">
                <h3>{category.name}</h3>
                <div className="ingredients-list">
                  {category.ingredients.map(ingredient => (
                    <label key={ingredient.id} className="ingredient-item">
                      <input
                        type="checkbox"
                        checked={selectedIngredients.includes(ingredient.id)}
                        onChange={() => handleIngredientToggle(ingredient.id)}
                      />
                      <span className="checkmark"></span>
                      {ingredient.name}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={submitting || selectedIngredients.length === 0}
              className="submit-btn"
            >
              {submitting ? 'Finding Recipes...' : `Find Recipes (${selectedIngredients.length} selected)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
