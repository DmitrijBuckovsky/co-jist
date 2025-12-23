import { PayloadHandler } from 'payload';

export const randomRecipesHandler: PayloadHandler = async (req) => {
  const { payload } = req;
  const difficulties = ['easy', 'medium', 'hard'];
  const randomRecipes = [];

  try {
    for (const difficulty of difficulties) {
      // First, get the count of recipes for this difficulty
      const countResult = await payload.find({
        collection: 'recipes',
        where: {
          difficulty: {
            equals: difficulty,
          },
        },
        limit: 0, // We only want the count
      });

      const totalDocs = countResult.totalDocs;

      if (totalDocs > 0) {
        // Generate a random page number (1-based)
        const randomPage = Math.floor(Math.random() * totalDocs) + 1;

        // Fetch one random recipe
        const result = await payload.find({
          collection: 'recipes',
          where: {
            difficulty: {
              equals: difficulty,
            },
          },
          limit: 1,
          page: randomPage,
          depth: 1, // Populate relationships if needed
        });

        if (result.docs.length > 0) {
          randomRecipes.push(result.docs[0]);
        }
      }
    }

    return Response.json(randomRecipes);
  } catch (error) {
    console.error('Error fetching random recipes:', error);
    return Response.json({ error: 'Failed to fetch random recipes' }, { status: 500 });
  }
};
