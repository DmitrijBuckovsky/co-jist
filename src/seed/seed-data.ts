import { normalizeText } from '@/collections/ingredients/hooks/before-change.hook';
import type { Payload } from 'payload';

export async function seedData(payload: Payload): Promise<void> {
  console.log('Seeding database with Czech recipe data...');

  // Create categories
  const categories = [
    { name: 'zelenina' },
    { name: 'ovoce' },
    { name: 'maso' },
    { name: 'mléčné výrobky' },
    { name: 'obiloviny' },
    { name: 'koření' },
    { name: 'oleje a tuky' },
  ];

  const categoryMap: Record<string, number> = {};

  for (const cat of categories) {
    const existing = await payload.find({
      collection: 'categories',
      where: { name: { equals: cat.name } },
    });

    if (existing.docs.length > 0) {
      categoryMap[cat.name] = existing.docs[0].id;
      console.log(`Category "${cat.name}" already exists`);
    } else {
      const created = await payload.create({
        collection: 'categories',
        data: cat,
      });
      categoryMap[cat.name] = created.id;
      console.log(`Created category: ${cat.name}`);
    }
  }

  // Create ingredients
  const ingredients = [
    // Zelenina
    { name: 'Cibule', category: 'zelenina' },
    { name: 'Česnek', category: 'zelenina' },
    { name: 'Rajčata', category: 'zelenina' },
    { name: 'Paprika', category: 'zelenina' },
    { name: 'Brambory', category: 'zelenina' },
    { name: 'Mrkev', category: 'zelenina' },
    { name: 'Zelí', category: 'zelenina' },
    { name: 'Okurka', category: 'zelenina' },
    // Maso
    { name: 'Kuřecí prsa', category: 'maso' },
    { name: 'Hovězí maso', category: 'maso' },
    { name: 'Vepřové maso', category: 'maso' },
    { name: 'Slanina', category: 'maso' },
    // Mléčné výrobky
    { name: 'Mléko', category: 'mléčné výrobky' },
    { name: 'Smetana', category: 'mléčné výrobky' },
    { name: 'Máslo', category: 'mléčné výrobky' },
    { name: 'Sýr', category: 'mléčné výrobky' },
    { name: 'Vejce', category: 'mléčné výrobky' },
    // Obiloviny
    { name: 'Mouka', category: 'obiloviny' },
    { name: 'Rýže', category: 'obiloviny' },
    { name: 'Těstoviny', category: 'obiloviny' },
    { name: 'Chléb', category: 'obiloviny' },
    // Koření
    { name: 'Paprika mletá', category: 'koření' },
    { name: 'Kmín', category: 'koření' },
    { name: 'Majoránka', category: 'koření' },
    { name: 'Bobkový list', category: 'koření' },
    // Oleje a tuky
    { name: 'Olej', category: 'oleje a tuky' },
    { name: 'Sádlo', category: 'oleje a tuky' },
  ];

  const ingredientMap: Record<string, number> = {};

  for (const ing of ingredients) {
    const existing = await payload.find({
      collection: 'ingredients',
      where: { name: { equals: ing.name } },
    });

    if (existing.docs.length > 0) {
      ingredientMap[ing.name] = existing.docs[0].id;
      console.log(`Ingredient "${ing.name}" already exists`);
    } else {
      const created = await payload.create({
        collection: 'ingredients',
        data: {
          name: ing.name,
          name_search: normalizeText(ing.name),
          category: categoryMap[ing.category],
        },
      });
      ingredientMap[ing.name] = created.id;
      console.log(`Created ingredient: ${ing.name}`);
    }
  }

  // Create recipes
  const recipes = [
    {
      name: 'Svíčková na smetaně',
      instructions: `1. Hovězí svíčkovou nasolte a opepřete.
2. Na sádle orestujte nakrájenou zeleninu (mrkev, cibuli, petržel).
3. Přidejte maso a orestujte ze všech stran.
4. Zalijte vodou, přidejte bobkový list, nové koření a duste 2 hodiny.
5. Maso vyjměte, zeleninu rozmixujte.
6. Přidejte smetanu a zahřejte.
7. Podávejte s houskovým knedlíkem a brusinkami.`,
      prep_time_mins: 150,
      ingredients: [
        { name: 'Hovězí maso', amount: '800 g', is_main: true },
        { name: 'Smetana', amount: '250 ml', is_main: true },
        { name: 'Mrkev', amount: '2 ks', is_main: false },
        { name: 'Cibule', amount: '2 ks', is_main: false },
        { name: 'Sádlo', amount: '50 g', is_main: false },
        { name: 'Bobkový list', amount: '2 ks', is_main: false },
        { name: 'Sůl', amount: 'podle chuti', is_main: false },
        { name: 'Pepř', amount: 'podle chuti', is_main: false },
      ],
    },
    {
      name: 'Kuřecí paprikáš',
      instructions: `1. Kuřecí maso nakrájejte na kousky, osolte a opepřete.
2. Na oleji orestujte nakrájenou cibuli do zlatova.
3. Přidejte mletou papriku a krátce orestujte.
4. Vložte kuřecí maso a orestujte ze všech stran.
5. Zalijte trochou vody a duste 30 minut.
6. Na konci přidejte smetanu a prohřejte.
7. Podávejte s houskovým knedlíkem nebo těstovinami.`,
      prep_time_mins: 45,
      ingredients: [
        { name: 'Kuřecí prsa', amount: '500 g', is_main: true },
        { name: 'Paprika mletá', amount: '2 lžíce', is_main: true },
        { name: 'Cibule', amount: '1 ks', is_main: false },
        { name: 'Smetana', amount: '200 ml', is_main: false },
        { name: 'Olej', amount: '3 lžíce', is_main: false },
        { name: 'Sůl', amount: 'podle chuti', is_main: false },
        { name: 'Pepř', amount: 'podle chuti', is_main: false },
      ],
    },
    {
      name: 'Bramboráky',
      instructions: `1. Brambory oloupejte a nastrouhejte na hrubém struhadle.
2. Přidejte prolisovaný česnek, vejce, mouku, sůl, pepř a majoránku.
3. Vše důkladně promíchejte.
4. Na rozpáleném oleji smažte lžíce těsta z obou stran do zlatova.
5. Podávejte teplé s kyselou smetanou nebo zelím.`,
      prep_time_mins: 30,
      ingredients: [
        { name: 'Brambory', amount: '1 kg', is_main: true },
        { name: 'Vejce', amount: '2 ks', is_main: true },
        { name: 'Mouka', amount: '4 lžíce', is_main: false },
        { name: 'Česnek', amount: '4 stroužky', is_main: false },
        { name: 'Majoránka', amount: '1 lžička', is_main: false },
        { name: 'Olej', amount: 'na smažení', is_main: false },
        { name: 'Sůl', amount: 'podle chuti', is_main: false },
        { name: 'Pepř', amount: 'podle chuti', is_main: false },
      ],
    },
  ];

  for (const recipe of recipes) {
    const existing = await payload.find({
      collection: 'recipes',
      where: { name: { equals: recipe.name } },
    });

    if (existing.docs.length > 0) {
      console.log(`Recipe "${recipe.name}" already exists`);
      continue;
    }

    // Create recipe without ingredients_data to avoid hook trigger
    const created = await payload.create({
      collection: 'recipes',
      data: {
        name: recipe.name,
        instructions: recipe.instructions,
        prep_time_mins: recipe.prep_time_mins,
      },
      context: { skipIngredientSync: true },
    });
    console.log(`Created recipe: ${recipe.name}`);

    // Create recipe ingredients directly
    for (const ing of recipe.ingredients) {
      const ingredientId = ingredientMap[ing.name];
      if (!ingredientId) {
        console.warn(`Ingredient "${ing.name}" not found, skipping`);
        continue;
      }

      await payload.create({
        collection: 'recipe-ingredients',
        data: {
          recipe: created.id,
          ingredient: ingredientId,
          amount: ing.amount,
          is_main: ing.is_main,
        },
      });
    }
    console.log(`  Added ${recipe.ingredients.length} ingredients`);
  }

  console.log('Seeding complete!');
}
