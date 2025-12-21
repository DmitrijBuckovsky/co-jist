// Test script for recipe matching endpoint
// Run this with: node test-recipe-matching.js

const testRecipeMatching = async () => {
  try {
    // Example: User has ingredients with IDs [1, 2, 3, 4, 5]
    const ingredientIds = [1, 2, 3, 4, 5];

    const response = await fetch('http://localhost:3000/api/recipes/match-recipes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ingredientIds }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    console.log('Recipe Matching Results:');
    console.log('=======================');
    console.log(`Total matches: ${result.data.totalMatches}`);
    console.log('');

    result.data.recipes.forEach((recipe, index) => {
      console.log(`${index + 1}. ${recipe.name}`);
      console.log(`   Score: ${recipe.score}`);
      console.log(`   Main ingredients: ${recipe.main_have}/${recipe.main_total}`);
      console.log(`   Secondary ingredients: ${recipe.secondary_have}/${recipe.secondary_total}`);
      console.log(`   Missing ingredients: ${recipe.missing_total}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error testing recipe matching:', error);
  }
};

// Run the test
testRecipeMatching();
