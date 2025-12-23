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
    { name: 'Kyselé zelí', category: 'zelenina' },
    { name: 'Špenát', category: 'zelenina' },
    { name: 'Houby', category: 'zelenina' },
    { name: 'Hrášek', category: 'zelenina' },
    // Ovoce
    { name: 'Jablka', category: 'ovoce' },
    { name: 'Švestky', category: 'ovoce' },
    { name: 'Meruňky', category: 'ovoce' },
    // Maso
    { name: 'Kuřecí prsa', category: 'maso' },
    { name: 'Hovězí maso', category: 'maso' },
    { name: 'Vepřové maso', category: 'maso' },
    { name: 'Slanina', category: 'maso' },
    { name: 'Mleté maso', category: 'maso' },
    { name: 'Klobása', category: 'maso' },
    { name: 'Uzené maso', category: 'maso' },
    { name: 'Játra', category: 'maso' },
    // Mléčné výrobky
    { name: 'Mléko', category: 'mléčné výrobky' },
    { name: 'Smetana', category: 'mléčné výrobky' },
    { name: 'Máslo', category: 'mléčné výrobky' },
    { name: 'Sýr', category: 'mléčné výrobky' },
    { name: 'Vejce', category: 'mléčné výrobky' },
    { name: 'Tvaroh', category: 'mléčné výrobky' },
    { name: 'Zakysaná smetana', category: 'mléčné výrobky' },
    // Obiloviny
    { name: 'Mouka', category: 'obiloviny' },
    { name: 'Rýže', category: 'obiloviny' },
    { name: 'Těstoviny', category: 'obiloviny' },
    { name: 'Chléb', category: 'obiloviny' },
    { name: 'Strouhanka', category: 'obiloviny' },
    { name: 'Kroupy', category: 'obiloviny' },
    // Koření
    { name: 'Paprika mletá', category: 'koření' },
    { name: 'Kmín', category: 'koření' },
    { name: 'Majoránka', category: 'koření' },
    { name: 'Bobkový list', category: 'koření' },
    { name: 'Cukr', category: 'koření' },
    { name: 'Skořice', category: 'koření' },
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
      difficulty: 'hard' as const,
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
      difficulty: 'easy' as const,
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
      difficulty: 'easy' as const,
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
    {
      name: 'Hovězí guláš',
      difficulty: 'medium' as const,
      instructions: `1. Hovězí maso nakrájejte na kostky, osolte a opepřete.
2. Na sádle orestujte nakrájenou cibuli do zlatova.
3. Přidejte mletou papriku, promíchejte a ihned přidejte maso.
4. Orestujte maso ze všech stran.
5. Přidejte kmín, česnek a zalijte vodou.
6. Duste pod pokličkou 1,5 - 2 hodiny, dokud maso není měkké.
7. Podávejte s houskovým knedlíkem nebo chlebem.`,
      prep_time_mins: 120,
      ingredients: [
        { name: 'Hovězí maso', amount: '600 g', is_main: true },
        { name: 'Cibule', amount: '3 ks', is_main: true },
        { name: 'Paprika mletá', amount: '2 lžíce', is_main: true },
        { name: 'Sádlo', amount: '50 g', is_main: false },
        { name: 'Kmín', amount: '1 lžička', is_main: false },
        { name: 'Česnek', amount: '3 stroužky', is_main: false },
      ],
    },
    {
      name: 'Smažený sýr',
      difficulty: 'easy' as const,
      instructions: `1. Sýr nakrájejte na silnější plátky (cca 1,5 cm).
2. Obalte v mouce, rozšlehaném vejci a strouhance.
3. Smažte na rozpáleném oleji z obou stran do zlatova.
4. Podávejte s hranolky a tatarskou omáčkou.`,
      prep_time_mins: 20,
      ingredients: [
        { name: 'Sýr', amount: '400 g', is_main: true },
        { name: 'Vejce', amount: '2 ks', is_main: false },
        { name: 'Mouka', amount: '100 g', is_main: false },
        { name: 'Strouhanka', amount: '150 g', is_main: false },
        { name: 'Olej', amount: 'na smažení', is_main: false },
      ],
    },
    {
      name: 'Vepřo knedlo zelo',
      difficulty: 'medium' as const,
      instructions: `1. Vepřové maso osolte, opepřete a potřete kmínem.
2. Vložte do pekáče s trochou vody a pečte při 180°C.
3. Během pečení podlévejte a otáčejte.
4. Pečte cca 2 hodiny, dokud maso není měkké.
5. Podávejte s houskovým knedlíkem a duseným zelím.`,
      prep_time_mins: 150,
      ingredients: [
        { name: 'Vepřové maso', amount: '1 kg', is_main: true },
        { name: 'Kyselé zelí', amount: '500 g', is_main: true },
        { name: 'Kmín', amount: '1 lžíce', is_main: false },
        { name: 'Cibule', amount: '1 ks', is_main: false },
        { name: 'Sádlo', amount: '30 g', is_main: false },
      ],
    },
    {
      name: 'Kulajda',
      difficulty: 'medium' as const,
      instructions: `1. Brambory oloupejte a nakrájejte na kostky.
2. Vařte v osolené vodě s bobkovým listem a koprem.
3. Houby nakrájejte a přidejte k bramborám.
4. Když jsou brambory měkké, přidejte smetanu.
5. Zahustěte moukou rozmíchanou ve studené vodě.
6. Podávejte se zastřeným vejcem.`,
      prep_time_mins: 40,
      ingredients: [
        { name: 'Brambory', amount: '500 g', is_main: true },
        { name: 'Houby', amount: '300 g', is_main: true },
        { name: 'Smetana', amount: '200 ml', is_main: false },
        { name: 'Vejce', amount: '4 ks', is_main: false },
        { name: 'Mouka', amount: '2 lžíce', is_main: false },
        { name: 'Bobkový list', amount: '2 ks', is_main: false },
      ],
    },
    {
      name: 'Vepřový řízek',
      difficulty: 'easy' as const,
      instructions: `1. Maso naklepejte, osolte a opepřete.
2. Obalte postupně v mouce, rozšlehaném vejci a strouhance.
3. Smažte na rozpáleném oleji z obou stran do zlatova.
4. Podávejte s bramborovým salátem nebo hranolky.`,
      prep_time_mins: 30,
      ingredients: [
        { name: 'Vepřové maso', amount: '600 g', is_main: true },
        { name: 'Vejce', amount: '3 ks', is_main: false },
        { name: 'Mouka', amount: '100 g', is_main: false },
        { name: 'Strouhanka', amount: '200 g', is_main: false },
        { name: 'Olej', amount: 'na smažení', is_main: false },
      ],
    },
    {
      name: 'Špenát s vejcem',
      difficulty: 'easy' as const,
      instructions: `1. Špenát rozmrazte nebo použijte čerstvý.
2. Na másle orestujte česnek, přidejte špenát.
3. Poduste a ochutnejte solí, pepřem a špetkou muškátového oříšku.
4. Zahustěte trochou mouky nebo smetany.
5. Podávejte s vařenými bramborami a volským okem.`,
      prep_time_mins: 25,
      ingredients: [
        { name: 'Špenát', amount: '500 g', is_main: true },
        { name: 'Vejce', amount: '4 ks', is_main: true },
        { name: 'Brambory', amount: '600 g', is_main: false },
        { name: 'Máslo', amount: '50 g', is_main: false },
        { name: 'Česnek', amount: '2 stroužky', is_main: false },
        { name: 'Smetana', amount: '100 ml', is_main: false },
      ],
    },
    {
      name: 'Sekaná',
      difficulty: 'easy' as const,
      instructions: `1. Smíchejte mleté maso s namočeným chlebem, vejcem, cibulí a kořením.
2. Vytvarujte bochník a vložte do vymazané formy.
3. Pečte při 180°C cca 45 minut.
4. Podávejte s bramborovou kaší.`,
      prep_time_mins: 60,
      ingredients: [
        { name: 'Mleté maso', amount: '500 g', is_main: true },
        { name: 'Chléb', amount: '2 krajíce', is_main: false },
        { name: 'Vejce', amount: '1 ks', is_main: false },
        { name: 'Cibule', amount: '1 ks', is_main: false },
        { name: 'Česnek', amount: '2 stroužky', is_main: false },
        { name: 'Majoránka', amount: '1 lžička', is_main: false },
      ],
    },
    {
      name: 'Kroupový kuba',
      difficulty: 'medium' as const,
      instructions: `1. Kroupy předem namočte.
2. Uvařte do měkka v osolené vodě.
3. Houby nakrájejte a orestujte na sádle s cibulí.
4. Smíchejte s kroupami, přidejte majoránku a česnek.
5. Podávejte jako přílohu nebo samostatné jídlo.`,
      prep_time_mins: 50,
      ingredients: [
        { name: 'Kroupy', amount: '300 g', is_main: true },
        { name: 'Houby', amount: '200 g', is_main: true },
        { name: 'Cibule', amount: '1 ks', is_main: false },
        { name: 'Sádlo', amount: '50 g', is_main: false },
        { name: 'Česnek', amount: '3 stroužky', is_main: false },
        { name: 'Majoránka', amount: '1 lžíce', is_main: false },
      ],
    },
    {
      name: 'Tvarohové knedlíky',
      difficulty: 'medium' as const,
      instructions: `1. Smíchejte tvaroh, vejce, mouku a špetku soli.
2. Vytvarujte malé knedlíky.
3. Vařte v osolené vodě cca 10 minut.
4. Podávejte posypané strouhankou opraženou na másle a cukrem.`,
      prep_time_mins: 35,
      ingredients: [
        { name: 'Tvaroh', amount: '500 g', is_main: true },
        { name: 'Mouka', amount: '200 g', is_main: false },
        { name: 'Vejce', amount: '2 ks', is_main: false },
        { name: 'Máslo', amount: '80 g', is_main: false },
        { name: 'Strouhanka', amount: '100 g', is_main: false },
        { name: 'Cukr', amount: '50 g', is_main: false },
      ],
    },
    {
      name: 'Zelňačka',
      difficulty: 'easy' as const,
      instructions: `1. Kyselé zelí krátce poduste na sádle s cibulí.
2. Přidejte nakrájené brambory a zalijte vodou.
3. Vařte, dokud brambory nezměknou.
4. Přidejte nakrájenou klobásu a prohřejte.
5. Ochutnejte kmínem, solí a pepřem.
6. Podávejte se zakysanou smetanou.`,
      prep_time_mins: 45,
      ingredients: [
        { name: 'Kyselé zelí', amount: '400 g', is_main: true },
        { name: 'Klobása', amount: '200 g', is_main: true },
        { name: 'Brambory', amount: '300 g', is_main: false },
        { name: 'Cibule', amount: '1 ks', is_main: false },
        { name: 'Sádlo', amount: '30 g', is_main: false },
        { name: 'Kmín', amount: '1 lžička', is_main: false },
        { name: 'Zakysaná smetana', amount: '100 ml', is_main: false },
      ],
    },
    {
      name: 'Jablkový štrúdl',
      difficulty: 'medium' as const,
      instructions: `1. Jablka oloupejte a nastrouhejte.
2. Smíchejte s cukrem, skořicí a rozinkami.
3. Listové těsto rozválejte a naplňte směsí.
4. Zarolujte a potřete rozšlehaným vejcem.
5. Pečte při 180°C cca 30 minut do zlatova.`,
      prep_time_mins: 50,
      ingredients: [
        { name: 'Jablka', amount: '1 kg', is_main: true },
        { name: 'Mouka', amount: '300 g', is_main: false },
        { name: 'Máslo', amount: '100 g', is_main: false },
        { name: 'Cukr', amount: '100 g', is_main: false },
        { name: 'Skořice', amount: '1 lžička', is_main: false },
        { name: 'Vejce', amount: '1 ks', is_main: false },
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
        name_search: normalizeText(recipe.name),
        instructions: recipe.instructions,
        prep_time_mins: recipe.prep_time_mins,
        difficulty: recipe.difficulty,
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
