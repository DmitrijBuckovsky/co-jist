'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from './PageHeader';

interface RecipeIngredient {
  id: number;
  name: string;
  isMain: boolean;
  have: boolean;
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
  ingredients: RecipeIngredient[];
}

interface RecipeResultsData {
  totalMatches: number;
  recipes: RecipeMatch[];
}

export function RecipeResults() {
  const router = useRouter();
  const [results, setResults] = useState<RecipeResultsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedResults = localStorage.getItem('recipeMatches');

    if (!savedResults) {
      router.push('/');
      return;
    }

    try {
      setResults(JSON.parse(savedResults));
    } catch {
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-loading">
          <div className="spinner" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!results || results.recipes.length === 0) {
    return (
      <div className="page-container">
        <PageHeader title="No recipes found" />
        <p className="page-message">Try selecting more ingredients</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader title={`${results.totalMatches} Recipe${results.totalMatches !== 1 ? 's' : ''}`} />

      <div className="results-list">
        {results.recipes.map((recipe) => (
          <Link key={recipe.id} href={`/recipe/${recipe.id}`} className="results-card">
            <div className="results-card-content">
              <h2>{recipe.name}</h2>
              <div className="results-card-ingredients">
                {recipe.ingredients.map((ing) => (
                  <span
                    key={ing.id}
                    className={`results-ingredient ${ing.have ? 'have' : 'missing'} ${ing.isMain ? 'main' : ''}`}
                  >
                    {ing.name}
                  </span>
                ))}
              </div>
            </div>
            <span className="results-card-score">{recipe.score}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
