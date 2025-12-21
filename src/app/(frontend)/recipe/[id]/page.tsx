import React from 'react';
import { RecipeDetail } from '../../_components/RecipeDetail';

interface RecipePageProps {
  params: Promise<{ id: string }>;
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;
  return <RecipeDetail recipeId={parseInt(id)} />;
}
