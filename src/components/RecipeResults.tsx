'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

interface RecipeResultsData {
  totalMatches: number;
  recipes: RecipeMatch[];
}

export function RecipeResults() {
  const router = useRouter();
  const [results, setResults] = useState<RecipeResultsData | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load results from localStorage
    const savedResults = localStorage.getItem('recipeMatches');
    const savedIngredients = localStorage.getItem('selectedIngredients');

    if (!savedResults) {
      router.push('/');
      return;
    }

    try {
      setResults(JSON.parse(savedResults));
      setSelectedIngredients(JSON.parse(savedIngredients || '[]'));
    } catch (error) {
      console.error('Failed to parse saved results:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleNewSearch = () => {
    localStorage.removeItem('recipeMatches');
    localStorage.removeItem('selectedIngredients');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="recipe-results">
        <div className="content">
          <h1>Loading results...</h1>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="recipe-results">
        <div className="content">
          <h1>No results found</h1>
          <button onClick={handleNewSearch} className="new-search-btn">
            Start New Search
          </button>
        </div>
      </div>
    );
  }

  const { totalMatches, recipes } = results;

  return (
    <div className="recipe-results">
      <div className="content">
        <div className="results-header">
          <h1>Recipe Matches</h1>
          <p>Found {totalMatches} recipe{totalMatches !== 1 ? 's' : ''} you can make!</p>
          <button onClick={handleNewSearch} className="new-search-btn">
            New Search
          </button>
        </div>

        {recipes.length === 0 ? (
          <div className="no-results">
            <p>No recipes found with your selected ingredients. Try selecting different ingredients!</p>
          </div>
        ) : (
          <div className="recipes-list">
            {recipes.map(recipe => (
              <div key={recipe.id} className="recipe-card">
                <div className="recipe-header">
                  <h3>{recipe.name}</h3>
                  <div className="recipe-score">
                    Score: {recipe.score}
                  </div>
                </div>

                <div className="recipe-stats">
                  <div className="stat">
                    <span className="stat-label">Main Ingredients:</span>
                    <span className="stat-value">
                      {recipe.mainHave}/{recipe.mainTotal} available
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Secondary Ingredients:</span>
                    <span className="stat-value">
                      {recipe.secondaryHave}/{recipe.secondaryTotal} available
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Missing:</span>
                    <span className="stat-value">
                      {recipe.missingTotal} ingredient{recipe.missingTotal !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="recipe-actions">
                  <Link href={`/recipe/${recipe.id}`} className="view-recipe-btn">
                    View Recipe
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
