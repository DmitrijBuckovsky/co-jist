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
    { name: 'ostatní' },
  ];

  const categoryMap: Record<string, number> = {};

  for (const cat of categories) {
    const existing = await payload.find({
      collection: 'categories',
      where: { name: { equals: cat.name } },
    });

    if (existing.docs.length > 0) {
      const existingId = existing.docs[0].id;
      await payload.update({
        collection: 'categories',
        id: existingId,
        data: cat,
      });
      categoryMap[cat.name] = existingId;
      console.log(`Updated category: ${cat.name}`);
    } else {
      const created = await payload.create({
        collection: 'categories',
        data: cat,
      });
      categoryMap[cat.name] = created.id;
      console.log(`Created category: ${cat.name}`);
    }
  }

  // Create allergens (EU standard 14 allergens)
  const allergens = [
    { number: 1, name: 'Obiloviny obsahující lepek' },
    { number: 2, name: 'Korýši' },
    { number: 3, name: 'Vejce' },
    { number: 4, name: 'Ryby' },
    { number: 5, name: 'Arašídy' },
    { number: 6, name: 'Sója' },
    { number: 7, name: 'Mléko' },
    { number: 8, name: 'Skořápkové plody (ořechy)' },
    { number: 9, name: 'Celer' },
    { number: 10, name: 'Hořčice' },
    { number: 11, name: 'Sezam' },
    { number: 12, name: 'Oxid siřičitý a siřičitany' },
    { number: 13, name: 'Lupina' },
    { number: 14, name: 'Měkkýši' },
  ];

  const allergenMap: Record<number, number> = {};

  for (const allergen of allergens) {
    const existing = await payload.find({
      collection: 'allergens',
      where: { number: { equals: allergen.number } },
    });

    if (existing.docs.length > 0) {
      const existingId = existing.docs[0].id;
      await payload.update({
        collection: 'allergens',
        id: existingId,
        data: allergen,
      });
      allergenMap[allergen.number] = existingId;
      console.log(`Updated allergen: ${allergen.number} - ${allergen.name}`);
    } else {
      const created = await payload.create({
        collection: 'allergens',
        data: allergen,
      });
      allergenMap[allergen.number] = created.id;
      console.log(`Created allergen: ${allergen.number} - ${allergen.name}`);
    }
  }

  // Create ingredients
  // Allergen numbers: 1=Gluten, 2=Crustaceans, 3=Eggs, 4=Fish, 5=Peanuts, 6=Soy, 7=Milk,
  // 8=Tree nuts, 9=Celery, 10=Mustard, 11=Sesame, 12=Sulphites, 13=Lupin, 14=Molluscs
  const ingredients: { name: string; category: string; allergens?: number[] }[] = [
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
    { name: 'Mléko', category: 'mléčné výrobky', allergens: [7] },
    { name: 'Smetana', category: 'mléčné výrobky', allergens: [7] },
    { name: 'Máslo', category: 'mléčné výrobky', allergens: [7] },
    { name: 'Sýr', category: 'mléčné výrobky', allergens: [7] },
    { name: 'Vejce', category: 'mléčné výrobky', allergens: [3] },
    { name: 'Tvaroh', category: 'mléčné výrobky', allergens: [7] },
    { name: 'Zakysaná smetana', category: 'mléčné výrobky', allergens: [7] },
    // Obiloviny
    { name: 'Mouka', category: 'obiloviny', allergens: [1] },
    { name: 'Rýže', category: 'obiloviny' },
    { name: 'Těstoviny', category: 'obiloviny', allergens: [1] },
    { name: 'Chléb', category: 'obiloviny', allergens: [1] },
    { name: 'Strouhanka', category: 'obiloviny', allergens: [1] },
    { name: 'Kroupy', category: 'obiloviny', allergens: [1] },
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
    // Nové ingredience
    { name: 'Nové koření', category: 'koření' },
    { name: 'Rajčatový protlak', category: 'ostatní' },
    { name: 'Párek', category: 'maso' },
    { name: 'Hořčice', category: 'ostatní', allergens: [10] },
    { name: 'Kopr', category: 'zelenina' },
    { name: 'Ocet', category: 'ostatní' },
    { name: 'Droždí', category: 'ostatní' },
    { name: 'Jahody', category: 'ovoce' },
    { name: 'Třešně', category: 'ovoce' },
    { name: 'Prášek do pečiva', category: 'ostatní' },
    { name: 'Kakao', category: 'ostatní' },
    { name: 'Marmeláda', category: 'ostatní' },
    { name: 'Celer', category: 'zelenina', allergens: [9] },
    { name: 'Petržel', category: 'zelenina' },
    { name: 'Majonéza', category: 'ostatní', allergens: [3] },
    { name: 'Čočka', category: 'zelenina' },
    { name: 'Rohlík', category: 'obiloviny', allergens: [1] },
    { name: 'Rozinky', category: 'ovoce' },
    { name: 'Hrách', category: 'zelenina' },
    { name: 'Celé kuře', category: 'maso' },
    { name: 'Hlíva ústřičná', category: 'zelenina' },
    { name: 'Vývar', category: 'ostatní' },
    // Mezinárodní ingredience
    { name: 'Mozzarella', category: 'mléčné výrobky', allergens: [7] },
    { name: 'Bazalka', category: 'zelenina' },
    { name: 'Rýže na sushi', category: 'obiloviny' },
    { name: 'Řasa Nori', category: 'ostatní' },
    { name: 'Losos', category: 'maso', allergens: [4] },
    { name: 'Rýžový ocet', category: 'ostatní' },
    { name: 'Wasabi', category: 'ostatní' },
    { name: 'Sójová omáčka', category: 'ostatní', allergens: [6, 1] },
    { name: 'Tortilly', category: 'obiloviny', allergens: [1] },
    { name: 'Fazole', category: 'zelenina' },
    { name: 'Kukuřice', category: 'zelenina' },
    { name: 'Avokádo', category: 'zelenina' },
    { name: 'Limetka', category: 'ovoce' },
    { name: 'Koriandr', category: 'zelenina' },
    { name: 'Chilli paprička', category: 'zelenina' },
    { name: 'Kokosové mléko', category: 'ostatní' },
    { name: 'Kari', category: 'koření' },
    { name: 'Zázvor', category: 'zelenina' },
    { name: 'Špagety', category: 'obiloviny', allergens: [1] },
    { name: 'Parmazán', category: 'mléčné výrobky', allergens: [7] },
    { name: 'Bulka na hamburger', category: 'obiloviny', allergens: [1, 11] },
    { name: 'Ledový salát', category: 'zelenina' },
    { name: 'Čedar', category: 'mléčné výrobky', allergens: [7] },
    { name: 'Kečup', category: 'ostatní' },
    { name: 'Lasagne těstoviny', category: 'obiloviny', allergens: [1] },
    { name: 'Šafrán', category: 'koření' },
    { name: 'Mořské plody', category: 'maso', allergens: [2, 14] },
    { name: 'Citrón', category: 'ovoce' },
    { name: 'Ramen nudle', category: 'obiloviny', allergens: [1] },
    { name: 'Jarní cibulka', category: 'zelenina' },
    { name: 'Cizrna', category: 'zelenina' },
    { name: 'Pita chléb', category: 'obiloviny', allergens: [1] },
    { name: 'Cuketa', category: 'zelenina' },
    { name: 'Lilek', category: 'zelenina' },
    { name: 'Tymián', category: 'koření' },
    { name: 'Treska', category: 'maso', allergens: [4] },
    { name: 'Pivo', category: 'ostatní', allergens: [1] },
    { name: 'Tatarská omáčka', category: 'ostatní', allergens: [3] },
    { name: 'Olivy', category: 'zelenina' },
    { name: 'Feta sýr', category: 'mléčné výrobky', allergens: [7] },
    { name: 'Oregano', category: 'koření' },
    { name: 'Rýžové nudle', category: 'obiloviny' },
    { name: 'Tofu', category: 'ostatní', allergens: [6] },
    { name: 'Krevety', category: 'maso', allergens: [2] },
    { name: 'Arašídy', category: 'ostatní', allergens: [5] },
    { name: 'Telecí maso', category: 'maso' },
    { name: 'Červená řepa', category: 'zelenina' },
    { name: 'Římský salát', category: 'zelenina' },
    { name: 'Ančovičky', category: 'maso', allergens: [4] },
    { name: 'Rýže na rizoto', category: 'obiloviny' },
    { name: 'Bílé víno', category: 'ostatní', allergens: [12] },
    { name: 'Badyán', category: 'koření' },
    { name: 'Rybí omáčka', category: 'ostatní', allergens: [4] },
    { name: 'Hovězí kosti', category: 'maso' },
    { name: 'Jehněčí maso', category: 'maso' },
    { name: 'Jogurt', category: 'mléčné výrobky', allergens: [7] },
    { name: 'Římský kmín', category: 'koření' },
    { name: 'Olivový olej', category: 'oleje a tuky' },
    { name: 'Tahini', category: 'ostatní', allergens: [11] },
    { name: 'Mascarpone', category: 'mléčné výrobky', allergens: [7] },
    { name: 'Cukrářské piškoty', category: 'ostatní', allergens: [1, 3] },
    { name: 'Káva', category: 'ostatní' },
    { name: 'Amaretto', category: 'ostatní', allergens: [8] },
    { name: 'Sušenky', category: 'ostatní', allergens: [1] },
    { name: 'Krémový sýr', category: 'mléčné výrobky', allergens: [7] },
    { name: 'Vanilkový extrakt', category: 'ostatní' },
    { name: 'Čokoláda na vaření', category: 'ostatní', allergens: [7] },
    { name: 'Vlašské ořechy', category: 'ostatní', allergens: [8] },
    { name: 'Muškátový oříšek', category: 'koření' },
  ];

  const ingredientMap: Record<string, number> = {};

  for (const ing of ingredients) {
    const existing = await payload.find({
      collection: 'ingredients',
      where: { name: { equals: ing.name } },
    });

    const ingredientData = {
      name: ing.name,
      name_search: normalizeText(ing.name),
      category: categoryMap[ing.category],
      allergens: ing.allergens?.map((n) => allergenMap[n]),
    };

    if (existing.docs.length > 0) {
      const existingId = existing.docs[0].id;
      await payload.update({
        collection: 'ingredients',
        id: existingId,
        data: ingredientData,
      });
      ingredientMap[ing.name] = existingId;
      console.log(`Updated ingredient: ${ing.name}`);
    } else {
      const created = await payload.create({
        collection: 'ingredients',
        data: ingredientData,
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
    {
      name: 'Česnečka',
      difficulty: 'easy' as const,
      instructions: `1. Brambory nakrájejte na kostičky a uvařte ve vodě.
2. Přidejte sůl, kmín a majoránku.
3. Ke konci varu přidejte prolisovaný česnek.
4. Podávejte s opečeným chlebem a nastrouhaným sýrem.`,
      prep_time_mins: 30,
      ingredients: [
        { name: 'Brambory', amount: '4 ks', is_main: true },
        { name: 'Česnek', amount: '6 stroužků', is_main: true },
        { name: 'Chléb', amount: '2 krajíce', is_main: false },
        { name: 'Sýr', amount: '100 g', is_main: false },
        { name: 'Sádlo', amount: '1 lžíce', is_main: false },
        { name: 'Majoránka', amount: '1 lžíce', is_main: false },
        { name: 'Kmín', amount: '1 lžička', is_main: false },
      ],
    },
    {
      name: 'Rajská omáčka',
      difficulty: 'medium' as const,
      instructions: `1. Na sádle orestujte cibuli a kořenovou zeleninu.
2. Přidejte koření (nové koření, bobkový list, skořici) a rajský protlak.
3. Zalijte vývarem a povařte.
4. Omáčku propasírujte a zahustěte jíškou.
5. Dochutíme cukrem, solí a octem.
6. Podávejte s hovězím masem a knedlíkem nebo těstovinami.`,
      prep_time_mins: 90,
      ingredients: [
        { name: 'Hovězí maso', amount: '500 g', is_main: true },
        { name: 'Rajčatový protlak', amount: '200 g', is_main: true },
        { name: 'Cibule', amount: '1 ks', is_main: false },
        { name: 'Mrkev', amount: '1 ks', is_main: false },
        { name: 'Celer', amount: '1/4 ks', is_main: false },
        { name: 'Petržel', amount: '1 ks', is_main: false },
        { name: 'Skořice', amount: '1 celá', is_main: false },
        { name: 'Nové koření', amount: '5 kuliček', is_main: false },
        { name: 'Bobkový list', amount: '3 ks', is_main: false },
        { name: 'Cukr', amount: 'podle chuti', is_main: false },
        { name: 'Ocet', amount: 'podle chuti', is_main: false },
        { name: 'Mouka', amount: '2 lžíce', is_main: false },
        { name: 'Sádlo', amount: '2 lžíce', is_main: false },
      ],
    },
    {
      name: 'Buřtguláš',
      difficulty: 'easy' as const,
      instructions: `1. Na sádle orestujte cibuli.
2. Přidejte nakrájené buřty (párky) a opečte.
3. Zasypte paprikou, přidejte brambory a zalijte vodou.
4. Vařte do změknutí brambor.
5. Zahustěte moukou rozmíchanou ve vodě, přidejte česnek a majoránku.`,
      prep_time_mins: 45,
      ingredients: [
        { name: 'Párek', amount: '4 ks', is_main: true },
        { name: 'Brambory', amount: '500 g', is_main: true },
        { name: 'Cibule', amount: '2 ks', is_main: false },
        { name: 'Paprika mletá', amount: '1 lžíce', is_main: false },
        { name: 'Česnek', amount: '2 stroužky', is_main: false },
        { name: 'Majoránka', amount: '1 lžíce', is_main: false },
        { name: 'Mouka', amount: '1 lžíce', is_main: false },
        { name: 'Sádlo', amount: '1 lžíce', is_main: false },
      ],
    },
    {
      name: 'Koprová omáčka',
      difficulty: 'medium' as const,
      instructions: `1. Z másla a mouky připravte světlou jíšku.
2. Zalijte vývarem a mlékem, povařte.
3. Přidejte nasekaný kopr, smetanu a dochuťte octem a cukrem.
4. Podávejte s vařeným vejcem a bramborem nebo knedlíkem.`,
      prep_time_mins: 40,
      ingredients: [
        { name: 'Kopr', amount: '1 svazek', is_main: true },
        { name: 'Smetana', amount: '200 ml', is_main: true },
        { name: 'Mléko', amount: '300 ml', is_main: false },
        { name: 'Vejce', amount: '4 ks', is_main: false },
        { name: 'Brambory', amount: '600 g', is_main: false },
        { name: 'Máslo', amount: '50 g', is_main: false },
        { name: 'Mouka', amount: '2 lžíce', is_main: false },
        { name: 'Ocet', amount: 'podle chuti', is_main: false },
        { name: 'Cukr', amount: 'podle chuti', is_main: false },
      ],
    },
    {
      name: 'Ovocné knedlíky',
      difficulty: 'medium' as const,
      instructions: `1. Z mouky, droždí, mléka, cukru a vejce vypracujte kynuté těsto.
2. Nechte vykynout.
3. Těsto rozdělte na kousky, naplňte ovocem (jahody, švestky, meruňky) a zabalte.
4. Vařte v páře nebo ve vodě cca 10-15 minut.
5. Podávejte s tvarohem, cukrem a rozpuštěným máslem.`,
      prep_time_mins: 90,
      ingredients: [
        { name: 'Mouka', amount: '500 g', is_main: true },
        { name: 'Mléko', amount: '250 ml', is_main: false },
        { name: 'Droždí', amount: '20 g', is_main: false },
        { name: 'Vejce', amount: '1 ks', is_main: false },
        { name: 'Cukr', amount: '1 lžíce', is_main: false },
        { name: 'Jahody', amount: '500 g', is_main: true },
        { name: 'Tvaroh', amount: '250 g', is_main: false },
        { name: 'Máslo', amount: '100 g', is_main: false },
      ],
    },
    {
      name: 'Bublanina',
      difficulty: 'easy' as const,
      instructions: `1. Vejce vyšlehejte s cukrem.
2. Přidejte mouku, prášek do pečiva, mléko a olej.
3. Těsto nalijte na plech.
4. Poklaďte ovocem (třešně, jahody, rybíz).
5. Pečte při 180°C cca 30 minut.`,
      prep_time_mins: 45,
      ingredients: [
        { name: 'Mouka', amount: '300 g', is_main: true },
        { name: 'Cukr', amount: '150 g', is_main: false },
        { name: 'Vejce', amount: '3 ks', is_main: false },
        { name: 'Mléko', amount: '150 ml', is_main: false },
        { name: 'Olej', amount: '100 ml', is_main: false },
        { name: 'Prášek do pečiva', amount: '1 balíček', is_main: false },
        { name: 'Třešně', amount: '500 g', is_main: true },
      ],
    },
    {
      name: 'Palačinky',
      difficulty: 'easy' as const,
      instructions: `1. Z mléka, mouky, vajec a špetky soli vymíchejte hladké těsto.
2. Na pánvi smažte tenké palačinky z obou stran.
3. Potřete marmeládou nebo naplňte tvarohem či ovocem.`,
      prep_time_mins: 30,
      ingredients: [
        { name: 'Mléko', amount: '500 ml', is_main: true },
        { name: 'Mouka', amount: '200 g', is_main: true },
        { name: 'Vejce', amount: '2 ks', is_main: false },
        { name: 'Olej', amount: 'na smažení', is_main: false },
        { name: 'Marmeláda', amount: 'podle chuti', is_main: false },
      ],
    },
    {
      name: 'Bábovka',
      difficulty: 'medium' as const,
      instructions: `1. Vejce vyšlehejte s cukrem do pěny.
2. Přidejte olej, mléko a mouku s práškem do pečiva.
3. Část těsta obarvěte kakaem.
4. Do vymazané formy střídavě lijte světlé a tmavé těsto.
5. Pečte při 180°C cca 45-50 minut.`,
      prep_time_mins: 60,
      ingredients: [
        { name: 'Mouka', amount: '300 g', is_main: true },
        { name: 'Cukr', amount: '200 g', is_main: false },
        { name: 'Vejce', amount: '4 ks', is_main: false },
        { name: 'Olej', amount: '150 ml', is_main: false },
        { name: 'Mléko', amount: '150 ml', is_main: false },
        { name: 'Prášek do pečiva', amount: '1 balíček', is_main: false },
        { name: 'Kakao', amount: '2 lžíce', is_main: false },
      ],
    },
    {
      name: 'Bramborový salát',
      difficulty: 'medium' as const,
      instructions: `1. Brambory uvařte ve slupce, oloupejte a nakrájejte na kostičky.
2. Přidejte nakrájenou vařenou zeleninu (mrkev, celer, petržel), kyselou okurku, cibuli a vejce.
3. Smíchejte s majonézou, hořčicí, solí a pepřem.
4. Nechte odležet v chladu.`,
      prep_time_mins: 60,
      ingredients: [
        { name: 'Brambory', amount: '1 kg', is_main: true },
        { name: 'Mrkev', amount: '2 ks', is_main: false },
        { name: 'Celer', amount: '1/4 ks', is_main: false },
        { name: 'Petržel', amount: '1 ks', is_main: false },
        { name: 'Okurka', amount: '4 ks', is_main: false },
        { name: 'Cibule', amount: '1 ks', is_main: false },
        { name: 'Vejce', amount: '3 ks', is_main: false },
        { name: 'Majonéza', amount: '200 g', is_main: false },
        { name: 'Hořčice', amount: '1 lžíce', is_main: false },
      ],
    },
    {
      name: 'Čočka na kyselo',
      difficulty: 'easy' as const,
      instructions: `1. Čočku namočte a uvařte do měkka.
2. Na sádle orestujte cibuli, přidejte mouku a udělejte jíšku.
3. Vmíchejte do čočky, povařte.
4. Dochuťte octem, solí a pepřem.
5. Podávejte s párkem, vejcem a kyselou okurkou.`,
      prep_time_mins: 45,
      ingredients: [
        { name: 'Čočka', amount: '500 g', is_main: true },
        { name: 'Cibule', amount: '1 ks', is_main: false },
        { name: 'Sádlo', amount: '2 lžíce', is_main: false },
        { name: 'Mouka', amount: '1 lžíce', is_main: false },
        { name: 'Ocet', amount: 'podle chuti', is_main: false },
        { name: 'Párek', amount: '2 ks', is_main: false },
        { name: 'Vejce', amount: '2 ks', is_main: false },
        { name: 'Okurka', amount: '2 ks', is_main: false },
      ],
    },
    {
      name: 'Žemlovka',
      difficulty: 'easy' as const,
      instructions: `1. Rohlíky nakrájejte a namočte v mléce s vejci a cukrem.
2. Do vymazané formy klaďte vrstvu rohlíků, vrstvu nastrouhaných jablek se skořicí a rozinkami, a opět rohlíky.
3. Navrch dejte kousky másla.
4. Pečte při 180°C do zlatova.`,
      prep_time_mins: 50,
      ingredients: [
        { name: 'Rohlík', amount: '6 ks', is_main: true },
        { name: 'Jablka', amount: '500 g', is_main: true },
        { name: 'Mléko', amount: '300 ml', is_main: false },
        { name: 'Vejce', amount: '2 ks', is_main: false },
        { name: 'Cukr', amount: '100 g', is_main: false },
        { name: 'Skořice', amount: '1 lžička', is_main: false },
        { name: 'Rozinky', amount: '50 g', is_main: false },
        { name: 'Máslo', amount: '50 g', is_main: false },
        { name: 'Tvaroh', amount: '250 g', is_main: false },
      ],
    },
    {
      name: 'Hrachová kaše',
      difficulty: 'easy' as const,
      instructions: `1. Hrách namočte a uvařte do měkka.
2. Rozmixujte na kaši.
3. Na sádle orestujte cibulku a vmíchejte do kaše.
4. Dochuťte česnekem, solí a majoránkou.
5. Podávejte s uzeným masem nebo klobásou a okurkou.`,
      prep_time_mins: 60,
      ingredients: [
        { name: 'Hrách', amount: '500 g', is_main: true },
        { name: 'Cibule', amount: '1 ks', is_main: false },
        { name: 'Česnek', amount: '3 stroužky', is_main: false },
        { name: 'Sádlo', amount: '2 lžíce', is_main: false },
        { name: 'Majoránka', amount: '1 lžíce', is_main: false },
        { name: 'Uzené maso', amount: '200 g', is_main: false },
        { name: 'Okurka', amount: '2 ks', is_main: false },
      ],
    },
    {
      name: 'Pečené kuře',
      difficulty: 'easy' as const,
      instructions: `1. Kuře omyjte, osolte a okmínujte (i zevnitř).
2. Dovnitř vložte kousek másla.
3. Pečte v pekáči s trochou vody a máslem při 180-200°C cca 1,5 hodiny.
4. Během pečení polévejte výpekem.
5. Podávejte s bramborem nebo rýží.`,
      prep_time_mins: 100,
      ingredients: [
        { name: 'Celé kuře', amount: '1 ks', is_main: true },
        { name: 'Máslo', amount: '100 g', is_main: false },
        { name: 'Kmín', amount: '1 lžíce', is_main: false },
      ],
    },
    {
      name: 'Dršťková polévka z hlívy',
      difficulty: 'medium' as const,
      instructions: `1. Hlívu nakrájejte na proužky.
2. Na sádle orestujte cibuli, přidejte papriku a hlívu.
3. Zalijte vývarem a vařte do měkka.
4. Zahustěte jíškou, přidejte česnek a majoránku.
5. Podávejte s pečivem.`,
      prep_time_mins: 45,
      ingredients: [
        { name: 'Hlíva ústřičná', amount: '400 g', is_main: true },
        { name: 'Cibule', amount: '1 ks', is_main: false },
        { name: 'Paprika mletá', amount: '1 lžíce', is_main: false },
        { name: 'Sádlo', amount: '2 lžíce', is_main: false },
        { name: 'Mouka', amount: '2 lžíce', is_main: false },
        { name: 'Česnek', amount: '3 stroužky', is_main: false },
        { name: 'Majoránka', amount: '1 lžíce', is_main: false },
        { name: 'Vývar', amount: '1 l', is_main: false },
      ],
    },
    {
      name: 'Rizoto',
      difficulty: 'easy' as const,
      instructions: `1. Na oleji orestujte cibuli a nakrájené maso.
2. Přidejte zeleninu (hrášek, mrkev, kukuřici) a rýži.
3. Zalijte vodou nebo vývarem a duste do měkka.
4. Vmíchejte nastrouhaný sýr.
5. Podávejte s kyselou okurkou.`,
      prep_time_mins: 40,
      ingredients: [
        { name: 'Rýže', amount: '400 g', is_main: true },
        { name: 'Kuřecí prsa', amount: '300 g', is_main: true },
        { name: 'Hrášek', amount: '100 g', is_main: false },
        { name: 'Mrkev', amount: '1 ks', is_main: false },
        { name: 'Cibule', amount: '1 ks', is_main: false },
        { name: 'Olej', amount: '3 lžíce', is_main: false },
        { name: 'Sýr', amount: '100 g', is_main: false },
        { name: 'Okurka', amount: '2 ks', is_main: false },
      ],
    },
    {
      name: 'Lečo',
      difficulty: 'easy' as const,
      instructions: `1. Na oleji orestujte cibuli.
2. Přidejte nakrájenou papriku a rajčata.
3. Duste do měkka.
4. Vmíchejte vejce a nechte srazit.
5. Přidejte nakrájenou klobásu.
6. Podávejte s chlebem nebo bramborem.`,
      prep_time_mins: 30,
      ingredients: [
        { name: 'Paprika', amount: '4 ks', is_main: true },
        { name: 'Rajčata', amount: '4 ks', is_main: true },
        { name: 'Cibule', amount: '2 ks', is_main: false },
        { name: 'Vejce', amount: '3 ks', is_main: false },
        { name: 'Klobása', amount: '2 ks', is_main: false },
        { name: 'Olej', amount: '2 lžíce', is_main: false },
      ],
    },
    {
      name: 'Francouzské brambory',
      difficulty: 'easy' as const,
      instructions: `1. Brambory uvařte ve slupce, oloupejte a nakrájejte na plátky.
2. Do pekáče vrstvěte brambory, nakrájené uzené maso, cibuli a vejce natvrdo.
3. Zalijte smetanou rozšlehanou s vejci.
4. Pečte při 180°C do zlatova.`,
      prep_time_mins: 60,
      ingredients: [
        { name: 'Brambory', amount: '1 kg', is_main: true },
        { name: 'Uzené maso', amount: '300 g', is_main: true },
        { name: 'Vejce', amount: '4 ks', is_main: false },
        { name: 'Cibule', amount: '1 ks', is_main: false },
        { name: 'Smetana', amount: '200 ml', is_main: false },
        { name: 'Olej', amount: 'na vymazání', is_main: false },
      ],
    },
    {
      name: 'Kuře na paprice',
      difficulty: 'medium' as const,
      instructions: `1. Na másle orestujte cibuli, přidejte papriku a kuřecí maso.
2. Zalijte vývarem a duste do měkka.
3. Maso vyjměte, omáčku zahustěte smetanou s trochou mouky.
4. Rozmixujte do hladka.
5. Podávejte s těstovinami nebo knedlíkem.`,
      prep_time_mins: 60,
      ingredients: [
        { name: 'Kuřecí prsa', amount: '600 g', is_main: true },
        { name: 'Smetana', amount: '250 ml', is_main: true },
        { name: 'Cibule', amount: '1 ks', is_main: false },
        { name: 'Paprika mletá', amount: '2 lžíce', is_main: false },
        { name: 'Máslo', amount: '50 g', is_main: false },
        { name: 'Mouka', amount: '1 lžíce', is_main: false },
        { name: 'Vývar', amount: '500 ml', is_main: false },
      ],
    },
    {
      name: 'Houbová omáčka',
      difficulty: 'medium' as const,
      instructions: `1. Houby nakrájejte a poduste na másle s cibulí a kmínem.
2. Zalijte smetanou, povařte.
3. Zahustěte moukou rozmíchanou v mléce.
4. Dochuťte octem nebo citronem.
5. Podávejte s knedlíkem.`,
      prep_time_mins: 40,
      ingredients: [
        { name: 'Houby', amount: '400 g', is_main: true },
        { name: 'Smetana', amount: '200 ml', is_main: true },
        { name: 'Cibule', amount: '1 ks', is_main: false },
        { name: 'Máslo', amount: '50 g', is_main: false },
        { name: 'Kmín', amount: '1 lžička', is_main: false },
        { name: 'Mouka', amount: '1 lžíce', is_main: false },
        { name: 'Mléko', amount: '100 ml', is_main: false },
      ],
    },
    {
      name: 'Plněné papriky',
      difficulty: 'medium' as const,
      instructions: `1. Papriky očistěte a vydlabejte.
2. Mleté maso smíchejte s rýží (polouvařenou), vejcem, cibulí a kořením.
3. Naplňte papriky.
4. Vložte do rajské omáčky (viz recept na Rajskou omáčku) a vařte do měkka.
5. Podávejte s knedlíkem nebo rýží.`,
      prep_time_mins: 90,
      ingredients: [
        { name: 'Paprika', amount: '6 ks', is_main: true },
        { name: 'Mleté maso', amount: '500 g', is_main: true },
        { name: 'Rýže', amount: '100 g', is_main: false },
        { name: 'Vejce', amount: '1 ks', is_main: false },
        { name: 'Cibule', amount: '1 ks', is_main: false },
        { name: 'Rajčatový protlak', amount: '200 g', is_main: false },
        { name: 'Vývar', amount: '500 ml', is_main: false },
      ],
    },
    {
      name: 'Pizza Margherita',
      difficulty: 'medium' as const,
      instructions: `1. Připravte těsto z mouky, droždí, vody a oleje. Nechte vykynout.
2. Těsto rozválejte na placku.
3. Potřete rajčatovým protlakem, osolte a opepřete.
4. Poklaďte plátky mozzarelly a pečte v troubě na 220°C asi 10-15 minut.
5. Po upečení ozdobte čerstvou bazalkou.`,
      prep_time_mins: 60,
      ingredients: [
        { name: 'Mouka', amount: '300g', is_main: true },
        { name: 'Droždí', amount: '1/2 kostky', is_main: false },
        { name: 'Olej', amount: '2 lžíce', is_main: false },
        { name: 'Rajčatový protlak', amount: '100g', is_main: true },
        { name: 'Mozzarella', amount: '150g', is_main: true },
        { name: 'Bazalka', amount: 'hrst', is_main: false },
      ],
    },
    {
      name: 'Sushi Maki',
      difficulty: 'hard' as const,
      instructions: `1. Uvařte rýži na sushi a dochuťte ji rýžovým octem, cukrem a solí.
2. Na bambusovou podložku položte řasu Nori.
3. Rozprostřete rýži na řasu, nechte volný okraj.
4. Doprostřed dejte proužek lososa a okurky.
5. Zabalte pomocí podložky do pevné rolky.
6. Nakrájejte na kousky a podávejte se sójovou omáčkou a wasabi.`,
      prep_time_mins: 45,
      ingredients: [
        { name: 'Rýže na sushi', amount: '250g', is_main: true },
        { name: 'Řasa Nori', amount: '3 pláty', is_main: true },
        { name: 'Losos', amount: '100g', is_main: true },
        { name: 'Okurka', amount: '1/2 ks', is_main: false },
        { name: 'Rýžový ocet', amount: '3 lžíce', is_main: false },
        { name: 'Wasabi', amount: 'dle chuti', is_main: false },
        { name: 'Sójová omáčka', amount: 'k podávání', is_main: false },
      ],
    },
    {
      name: 'Hovězí Tacos',
      difficulty: 'easy' as const,
      instructions: `1. Na pánvi osmahněte mleté maso s cibulí.
2. Přidejte nakrájenou chilli papričku, fazole a kukuřici.
3. Dochuťte solí, pepřem a limetkovou šťávou.
4. Směsí naplňte tortilly.
5. Ozdobte koriandrem a kousky avokáda.`,
      prep_time_mins: 20,
      ingredients: [
        { name: 'Tortilly', amount: '4 ks', is_main: true },
        { name: 'Mleté maso', amount: '300g', is_main: true },
        { name: 'Fazole', amount: '100g', is_main: false },
        { name: 'Kukuřice', amount: '50g', is_main: false },
        { name: 'Cibule', amount: '1 ks', is_main: false },
        { name: 'Chilli paprička', amount: '1 ks', is_main: false },
        { name: 'Avokádo', amount: '1 ks', is_main: false },
        { name: 'Limetka', amount: '1 ks', is_main: false },
        { name: 'Koriandr', amount: 'hrst', is_main: false },
      ],
    },
    {
      name: 'Kuřecí Kari',
      difficulty: 'medium' as const,
      instructions: `1. Kuřecí prsa nakrájejte na kostky, osolte a opepřete.
2. Na oleji osmahněte cibuli, česnek a zázvor.
3. Přidejte kari koření a krátce orestujte.
4. Vložte maso a opečte ze všech stran.
5. Zalijte kokosovým mlékem a vařte do měkka.
6. Podávejte s rýží.`,
      prep_time_mins: 35,
      ingredients: [
        { name: 'Kuřecí prsa', amount: '400g', is_main: true },
        { name: 'Kokosové mléko', amount: '400ml', is_main: true },
        { name: 'Kari', amount: '2 lžíce', is_main: true },
        { name: 'Cibule', amount: '1 ks', is_main: false },
        { name: 'Česnek', amount: '2 stroužky', is_main: false },
        { name: 'Zázvor', amount: 'kousek', is_main: false },
        { name: 'Rýže', amount: '200g', is_main: false },
      ],
    },
    {
      name: 'Špagety Carbonara',
      difficulty: 'medium' as const,
      instructions: `1. Uvařte špagety v osolené vodě al dente.
2. Slaninu nakrájejte na kostičky a opečte dokřupava.
3. V misce smíchejte žloutky, nastrouhaný parmazán a hodně pepře.
4. Scezené horké těstoviny smíchejte se slaninou.
5. Odstavte z plamene a vmíchejte vaječnou směs, aby vznikla krémová omáčka (nesmí se srazit).`,
      prep_time_mins: 20,
      ingredients: [
        { name: 'Špagety', amount: '300g', is_main: true },
        { name: 'Slanina', amount: '150g', is_main: true },
        { name: 'Vejce', amount: '3 žloutky', is_main: true },
        { name: 'Parmazán', amount: '50g', is_main: true },
      ],
    },
    {
      name: 'Klasický Hamburger',
      difficulty: 'medium' as const,
      instructions: `1. Mleté maso vytvarujte do placek, osolte a opepřete.
2. Opečte na grilu nebo pánvi z obou stran.
3. Ke konci pečení položte na maso plátek čedaru, aby se rozpustil.
4. Bulky rozkrojte a opečte.
5. Sestavte burger: bulka, kečup, ledový salát, maso se sýrem, rajče, cibule, bulka.`,
      prep_time_mins: 30,
      ingredients: [
        { name: 'Mleté maso', amount: '400g', is_main: true },
        { name: 'Bulka na hamburger', amount: '4 ks', is_main: true },
        { name: 'Čedar', amount: '4 plátky', is_main: true },
        { name: 'Ledový salát', amount: '4 listy', is_main: false },
        { name: 'Rajčata', amount: '1 ks', is_main: false },
        { name: 'Cibule', amount: '1 ks', is_main: false },
        { name: 'Kečup', amount: 'dle chuti', is_main: false },
      ],
    },
    {
      name: 'Lasagne Bolognese',
      difficulty: 'hard' as const,
      instructions: `1. Připravte masovou směs z mletého masa, cibule, mrkve a rajčatového protlaku. Osolte, opepřete a duste.
2. Připravte bešamel z másla, mouky a mléka.
3. Do pekáče vrstvěte: masovou směs, lasagne těstoviny, bešamel.
4. Opakujte vrstvy, končete bešamelem a posypte parmazánem.
5. Pečte v troubě na 180°C asi 40 minut.`,
      prep_time_mins: 90,
      ingredients: [
        { name: 'Lasagne těstoviny', amount: '250g', is_main: true },
        { name: 'Mleté maso', amount: '400g', is_main: true },
        { name: 'Rajčatový protlak', amount: '400g', is_main: true },
        { name: 'Mléko', amount: '500ml', is_main: false },
        { name: 'Máslo', amount: '50g', is_main: false },
        { name: 'Mouka', amount: '50g', is_main: false },
        { name: 'Parmazán', amount: '50g', is_main: false },
        { name: 'Mrkev', amount: '1 ks', is_main: false },
        { name: 'Cibule', amount: '1 ks', is_main: false },
      ],
    },
    {
      name: 'Španělská Paella',
      difficulty: 'hard' as const,
      instructions: `1. Na pánvi orestujte kuřecí maso a mořské plody.
2. Přidejte nakrájenou papriku, rajčata a hrášek.
3. Vmíchejte rýži a šafrán.
4. Zalijte vývarem, osolte a opepřete.
5. Vařte bez míchání, dokud se tekutina nevsákne a rýže nezměkne.
6. Podávejte s citrónem.`,
      prep_time_mins: 50,
      ingredients: [
        { name: 'Rýže', amount: '300g', is_main: true },
        { name: 'Mořské plody', amount: '200g', is_main: true },
        { name: 'Kuřecí prsa', amount: '150g', is_main: true },
        { name: 'Šafrán', amount: 'špetka', is_main: true },
        { name: 'Hrášek', amount: '50g', is_main: false },
        { name: 'Paprika', amount: '1 ks', is_main: false },
        { name: 'Rajčata', amount: '2 ks', is_main: false },
        { name: 'Vývar', amount: '700ml', is_main: false },
        { name: 'Citrón', amount: '1 ks', is_main: false },
      ],
    },
    {
      name: 'Ramen s Vepřovým Masem',
      difficulty: 'hard' as const,
      instructions: `1. Připravte silný vývar z vepřového masa, zázvoru a česneku.
2. Maso uvařte doměkka a nakrájejte na plátky.
3. Uvařte ramen nudle.
4. Vejce uvařte naměkko.
5. Do misky dejte nudle, zalijte horkým vývarem, přidejte maso, půlku vejce a nasekanou jarní cibulku.
6. Dochutťe sójovou omáčkou, solí a pepřem.`,
      prep_time_mins: 120,
      ingredients: [
        { name: 'Ramen nudle', amount: '200g', is_main: true },
        { name: 'Vepřové maso', amount: '300g', is_main: true },
        { name: 'Vývar', amount: '1l', is_main: true },
        { name: 'Vejce', amount: '2 ks', is_main: false },
        { name: 'Jarní cibulka', amount: '2 ks', is_main: false },
        { name: 'Sójová omáčka', amount: '2 lžíce', is_main: false },
        { name: 'Zázvor', amount: 'kousek', is_main: false },
      ],
    },
    {
      name: 'Falafel v Pita Chlebu',
      difficulty: 'medium' as const,
      instructions: `1. Cizrnu namočte přes noc a poté rozmixujte s cibulí, česnekem a petrželí.
2. Přidejte kmín, sůl, pepř a trochu mouky.
3. Tvarujte kuličky a smažte v oleji dozlatova.
4. Pita chléb rozpečte a naplňte falafelem a zeleninou (rajče, okurka).
5. Můžete přidat jogurtový dresing.`,
      prep_time_mins: 40,
      ingredients: [
        { name: 'Cizrna', amount: '250g', is_main: true },
        { name: 'Pita chléb', amount: '4 ks', is_main: true },
        { name: 'Cibule', amount: '1 ks', is_main: false },
        { name: 'Česnek', amount: '2 stroužky', is_main: false },
        { name: 'Petržel', amount: 'hrst', is_main: false },
        { name: 'Kmín', amount: '1 lžička', is_main: false },
        { name: 'Olej', amount: 'na smažení', is_main: false },
      ],
    },
    {
      name: 'Ratatouille',
      difficulty: 'medium' as const,
      instructions: `1. Zeleninu (lilek, cuketu, papriku, rajčata, cibuli) nakrájejte na kolečka nebo kostky.
2. Na oleji orestujte cibuli a česnek.
3. Přidejte ostatní zeleninu a tymián.
4. Osolte, opepřete a duste pod pokličkou do změknutí.
5. Podávejte s chlebem.`,
      prep_time_mins: 45,
      ingredients: [
        { name: 'Lilek', amount: '1 ks', is_main: true },
        { name: 'Cuketa', amount: '1 ks', is_main: true },
        { name: 'Paprika', amount: '2 ks', is_main: true },
        { name: 'Rajčata', amount: '4 ks', is_main: true },
        { name: 'Cibule', amount: '1 ks', is_main: false },
        { name: 'Tymián', amount: 'snítka', is_main: false },
        { name: 'Olej', amount: '3 lžíce', is_main: false },
      ],
    },
    {
      name: 'Fish and Chips',
      difficulty: 'medium' as const,
      instructions: `1. Brambory nakrájejte na hranolky a usmažte v oleji.
2. Z mouky, piva, soli a pepře vymíchejte těstíčko.
3. Rybu obalte v mouce a poté v těstíčku.
4. Smažte v rozpáleném oleji dozlatova.
5. Podávejte s hranolky a tatarskou omáčkou.`,
      prep_time_mins: 40,
      ingredients: [
        { name: 'Treska', amount: '400g', is_main: true },
        { name: 'Brambory', amount: '600g', is_main: true },
        { name: 'Mouka', amount: '200g', is_main: false },
        { name: 'Pivo', amount: '200ml', is_main: false },
        { name: 'Olej', amount: 'na smažení', is_main: false },
        { name: 'Tatarská omáčka', amount: 'k podávání', is_main: false },
      ],
    },
    {
      name: 'Chilli con Carne',
      difficulty: 'medium' as const,
      instructions: `1. Na oleji osmahněte cibuli a mleté maso.
2. Přidejte nakrájená rajčata, fazole a chilli papričku.
3. Dochuťte kmínem, solí a pepřem.
4. Duste na mírném ohni asi 30 minut, aby se chutě propojily.
5. Podávejte s rýží nebo chlebem.`,
      prep_time_mins: 45,
      ingredients: [
        { name: 'Mleté maso', amount: '500g', is_main: true },
        { name: 'Fazole', amount: '400g', is_main: true },
        { name: 'Rajčata', amount: '400g', is_main: true },
        { name: 'Chilli paprička', amount: '1-2 ks', is_main: true },
        { name: 'Cibule', amount: '1 ks', is_main: false },
        { name: 'Kmín', amount: '1 lžička', is_main: false },
      ],
    },
    {
      name: 'Řecký Salát',
      difficulty: 'easy' as const,
      instructions: `1. Okurku, rajčata a papriku nakrájejte na větší kusy.
2. Cibuli nakrájejte na kolečka.
3. Smíchejte zeleninu s olivami v míse.
4. Navrch položte plátek sýru Feta.
5. Posypte oreganem, osolte, opepřete a zalijte olivovým olejem.`,
      prep_time_mins: 15,
      ingredients: [
        { name: 'Rajčata', amount: '4 ks', is_main: true },
        { name: 'Okurka', amount: '1 ks', is_main: true },
        { name: 'Paprika', amount: '1 ks', is_main: false },
        { name: 'Olivy', amount: 'hrst', is_main: true },
        { name: 'Feta sýr', amount: '200g', is_main: true },
        { name: 'Cibule', amount: '1 ks', is_main: false },
        { name: 'Oregano', amount: '1 lžička', is_main: false },
        { name: 'Olej', amount: '3 lžíce', is_main: false },
      ],
    },
    {
      name: 'Pad Thai',
      difficulty: 'medium' as const,
      instructions: `1. Rýžové nudle namočte do vlažné vody.
2. Na pánvi orestujte krevety a tofu.
3. Přidejte nudle a vajíčko, míchejte.
4. Dochuťte rybí omáčkou (nebo solí), cukrem a limetkou.
5. Vmíchejte klíčky (pokud máte) a nasekané arašídy.
6. Podávejte s kouskem limetky.`,
      prep_time_mins: 30,
      ingredients: [
        { name: 'Rýžové nudle', amount: '200g', is_main: true },
        { name: 'Krevety', amount: '150g', is_main: true },
        { name: 'Tofu', amount: '100g', is_main: false },
        { name: 'Vejce', amount: '2 ks', is_main: false },
        { name: 'Arašídy', amount: 'hrst', is_main: false },
        { name: 'Limetka', amount: '1 ks', is_main: false },
      ],
    },
    {
      name: 'Vídeňský řízek',
      difficulty: 'medium' as const,
      instructions: `1. Telecí maso naklepejte na tenké plátky.
2. Osolte a opepřete.
3. Obalte v trojobalu: mouka, rozšlehaném vejci, strouhanka.
4. Smažte na sádle nebo oleji dozlatova z obou stran.
5. Podávejte s bramborovým salátem nebo bramborem a citrónem.`,
      prep_time_mins: 40,
      ingredients: [
        { name: 'Telecí maso', amount: '400g', is_main: true },
        { name: 'Strouhanka', amount: '100g', is_main: true },
        { name: 'Mouka', amount: '50g', is_main: true },
        { name: 'Vejce', amount: '2 ks', is_main: true },
        { name: 'Sádlo', amount: 'na smažení', is_main: false },
        { name: 'Citrón', amount: '1 ks', is_main: false },
      ],
    },
    {
      name: 'Ukrajinský Boršč',
      difficulty: 'hard' as const,
      instructions: `1. Připravte vývar z hovězího masa.
2. Červenou řepu, mrkev a cibuli nakrájejte a orestujte na pánvi.
3. Do vývaru přidejte nakrájené brambory a zelí, vařte 15 minut.
4. Přidejte orestovanou zeleninu a vařte do měkka.
5. Dochuťte octem, cukrem, solí a pepřem.
6. Podávejte se zakysanou smetanou.`,
      prep_time_mins: 120,
      ingredients: [
        { name: 'Hovězí maso', amount: '300g', is_main: true },
        { name: 'Červená řepa', amount: '2 ks', is_main: true },
        { name: 'Zelí', amount: '1/4 hlávky', is_main: true },
        { name: 'Brambory', amount: '3 ks', is_main: false },
        { name: 'Mrkev', amount: '1 ks', is_main: false },
        { name: 'Cibule', amount: '1 ks', is_main: false },
        { name: 'Zakysaná smetana', amount: 'k podávání', is_main: false },
        { name: 'Ocet', amount: '1 lžíce', is_main: false },
      ],
    },
    {
      name: 'Salát Caesar',
      difficulty: 'medium' as const,
      instructions: `1. Římský salát natrhejte na kousky.
2. Kuřecí prsa orestujte na pánvi, osolte a opepřete.
3. Chléb nakrájejte na kostičky a opečte (krutony).
4. Smíchejte majonézu s nasekanými ančovičkami, parmazánem a česnekem (dresing).
5. Salát promíchejte s dresingem, posypte krutony, masem a hoblinami parmazánu.`,
      prep_time_mins: 30,
      ingredients: [
        { name: 'Římský salát', amount: '1 ks', is_main: true },
        { name: 'Kuřecí prsa', amount: '200g', is_main: true },
        { name: 'Chléb', amount: '2 plátky', is_main: false },
        { name: 'Parmazán', amount: '50g', is_main: true },
        { name: 'Majonéza', amount: '3 lžíce', is_main: false },
        { name: 'Ančovičky', amount: '3 filety', is_main: false },
        { name: 'Česnek', amount: '1 stroužek', is_main: false },
      ],
    },
    {
      name: 'Houbové Rizoto',
      difficulty: 'medium' as const,
      instructions: `1. Na másle zpěňte cibuli.
2. Přidejte rýži a krátce orestujte.
3. Zalijte vínem a nechte odpařit.
4. Postupně přilévejte horký vývar a míchejte, dokud rýže není krémová a al dente.
5. Vmíchejte nakrájené houby (předem orestované), máslo a parmazán.
6. Osolte a opepřete.`,
      prep_time_mins: 40,
      ingredients: [
        { name: 'Rýže na rizoto', amount: '300g', is_main: true },
        { name: 'Houby', amount: '200g', is_main: true },
        { name: 'Vývar', amount: '1l', is_main: false },
        { name: 'Bílé víno', amount: '100ml', is_main: false },
        { name: 'Máslo', amount: '50g', is_main: false },
        { name: 'Parmazán', amount: '50g', is_main: false },
        { name: 'Cibule', amount: '1 ks', is_main: false },
      ],
    },
    {
      name: 'Guacamole s Nachos',
      difficulty: 'easy' as const,
      instructions: `1. Zralá avokáda rozmačkejte vidličkou.
2. Přidejte nadrobno nakrájenou cibuli a rajče.
3. Vmíchejte nasekaný koriandr a šťávu z limetky.
4. Osolte a opepřete dle chuti.
5. Podávejte s kukuřičnými lupínky (nachos) nebo tortillou.`,
      prep_time_mins: 10,
      ingredients: [
        { name: 'Avokádo', amount: '3 ks', is_main: true },
        { name: 'Rajčata', amount: '1 ks', is_main: false },
        { name: 'Cibule', amount: '1/2 ks', is_main: false },
        { name: 'Limetka', amount: '1 ks', is_main: false },
        { name: 'Koriandr', amount: 'hrst', is_main: false },
      ],
    },
    {
      name: 'Pho Bo',
      difficulty: 'hard' as const,
      instructions: `1. Hovězí kosti a maso dejte do hrnce, zalijte vodou a přiveďte k varu.
2. Přidejte opálenou cibuli, zázvor, badyán, skořici a vařte vývar alespoň 3 hodiny.
3. Dochuťte rybí omáčkou, solí a cukrem.
4. Rýžové nudle uvařte podle návodu.
5. Do misky dejte nudle, nakrájené maso, zalijte horkým vývarem.
6. Podávejte s jarní cibulkou, koriandrem, chilli a limetkou.`,
      prep_time_mins: 240,
      ingredients: [
        { name: 'Hovězí kosti', amount: '1 kg', is_main: true },
        { name: 'Hovězí maso', amount: '500 g', is_main: true },
        { name: 'Rýžové nudle', amount: '400 g', is_main: true },
        { name: 'Cibule', amount: '2 ks', is_main: false },
        { name: 'Zázvor', amount: '50 g', is_main: false },
        { name: 'Badyán', amount: '3 ks', is_main: false },
        { name: 'Skořice', amount: '1 ks', is_main: false },
        { name: 'Rybí omáčka', amount: '3 lžíce', is_main: false },
        { name: 'Cukr', amount: '1 lžíce', is_main: false },
        { name: 'Jarní cibulka', amount: '1 svazek', is_main: false },
        { name: 'Koriandr', amount: '1 svazek', is_main: false },
        { name: 'Chilli paprička', amount: '1 ks', is_main: false },
        { name: 'Limetka', amount: '1 ks', is_main: false },
      ],
    },
    {
      name: 'Kebab',
      difficulty: 'medium' as const,
      instructions: `1. Jehněčí maso nakrájejte na tenké plátky, osolte, opepřete a okořeňte římským kmínem a česnekem.
2. Maso orestujte na pánvi nebo grilu do zlatova.
3. Pita chléb rozpečte a naplňte masem.
4. Přidejte nakrájenou zeleninu (rajče, okurka, cibule).
5. Zalijte jogurtovým dresinkem s česnekem.`,
      prep_time_mins: 45,
      ingredients: [
        { name: 'Jehněčí maso', amount: '500 g', is_main: true },
        { name: 'Pita chléb', amount: '4 ks', is_main: true },
        { name: 'Jogurt', amount: '200 ml', is_main: false },
        { name: 'Římský kmín', amount: '1 lžička', is_main: false },
        { name: 'Česnek', amount: '2 stroužky', is_main: false },
        { name: 'Rajčata', amount: '2 ks', is_main: false },
        { name: 'Okurka', amount: '1 ks', is_main: false },
        { name: 'Cibule', amount: '1 ks', is_main: false },
      ],
    },
    {
      name: 'Shakshuka',
      difficulty: 'easy' as const,
      instructions: `1. Na olivovém oleji orestujte cibuli a papriku.
2. Přidejte česnek, římský kmín a mletou papriku.
3. Vmíchejte rajčata a rajčatový protlak, osolte a opepřete.
4. Do směsi udělejte důlky a vyklepněte do nich vejce.
5. Duste pod pokličkou, dokud bílky neztuhnou, ale žloutky zůstanou tekuté.
6. Podávejte s chlebem.`,
      prep_time_mins: 30,
      ingredients: [
        { name: 'Vejce', amount: '4 ks', is_main: true },
        { name: 'Rajčata', amount: '400 g', is_main: true },
        { name: 'Paprika', amount: '1 ks', is_main: false },
        { name: 'Cibule', amount: '1 ks', is_main: false },
        { name: 'Česnek', amount: '2 stroužky', is_main: false },
        { name: 'Olivový olej', amount: '2 lžíce', is_main: false },
        { name: 'Římský kmín', amount: '1 lžička', is_main: false },
        { name: 'Paprika mletá', amount: '1 lžička', is_main: false },
        { name: 'Rajčatový protlak', amount: '1 lžíce', is_main: false },
        { name: 'Chléb', amount: '4 plátky', is_main: false },
      ],
    },
    {
      name: 'Hummus',
      difficulty: 'easy' as const,
      instructions: `1. Cizrnu rozmixujte s tahini, česnekem a citronovou šťávou.
2. Přilévejte olivový olej a vodu, dokud nedosáhnete hladké konzistence.
3. Dochutťe solí a římským kmínem.
4. Podávejte s pita chlebem a zeleninou.`,
      prep_time_mins: 15,
      ingredients: [
        { name: 'Cizrna', amount: '400 g', is_main: true },
        { name: 'Tahini', amount: '2 lžíce', is_main: true },
        { name: 'Olivový olej', amount: '3 lžíce', is_main: false },
        { name: 'Citrón', amount: '1 ks', is_main: false },
        { name: 'Česnek', amount: '1 stroužek', is_main: false },
        { name: 'Římský kmín', amount: 'špetka', is_main: false },
        { name: 'Pita chléb', amount: '2 ks', is_main: false },
      ],
    },
    {
      name: 'Tiramisu',
      difficulty: 'medium' as const,
      instructions: `1. Žloutky vyšlehejte s cukrem do pěny, přidejte mascarpone.
2. Z bílků ušlehejte sníh a opatrně vmíchejte do krému.
3. Piškoty namáčejte v silné kávě s amarettem a skládejte do formy.
4. Střídejte vrstvy piškotů a krému.
5. Nechte vychladit v lednici a před podáváním posypte kakaem.`,
      prep_time_mins: 40,
      ingredients: [
        { name: 'Mascarpone', amount: '500 g', is_main: true },
        { name: 'Cukrářské piškoty', amount: '300 g', is_main: true },
        { name: 'Káva', amount: '200 ml', is_main: true },
        { name: 'Vejce', amount: '4 ks', is_main: false },
        { name: 'Cukr', amount: '100 g', is_main: false },
        { name: 'Amaretto', amount: '40 ml', is_main: false },
        { name: 'Kakao', amount: 'na posypání', is_main: false },
      ],
    },
    {
      name: 'Cheesecake',
      difficulty: 'medium' as const,
      instructions: `1. Sušenky rozdrťte a smíchejte s rozpuštěným máslem.
2. Směs natlačte na dno dortové formy a dejte chladit.
3. Krémový sýr vyšlehejte s cukrem, vejci, vanilkovým extraktem a zakysanou smetanou.
4. Krém nalijte na sušenkový základ.
5. Pečte ve vodní lázni při 160°C asi 50 minut.`,
      prep_time_mins: 70,
      ingredients: [
        { name: 'Krémový sýr', amount: '600 g', is_main: true },
        { name: 'Sušenky', amount: '200 g', is_main: true },
        { name: 'Máslo', amount: '100 g', is_main: false },
        { name: 'Cukr', amount: '150 g', is_main: false },
        { name: 'Vejce', amount: '3 ks', is_main: false },
        { name: 'Zakysaná smetana', amount: '200 ml', is_main: false },
        { name: 'Vanilkový extrakt', amount: '1 lžička', is_main: false },
      ],
    },
    {
      name: 'Brownies',
      difficulty: 'easy' as const,
      instructions: `1. Čokoládu a máslo rozpusťte ve vodní lázni.
2. Vejce vyšlehejte s cukrem do pěny.
3. Vmíchejte čokoládovou směs, mouku, kakao a nasekané ořechy.
4. Těsto nalijte na plech a pečte při 180°C asi 25 minut.
5. Nechte vychladnout a nakrájejte na čtverce.`,
      prep_time_mins: 40,
      ingredients: [
        { name: 'Čokoláda na vaření', amount: '200 g', is_main: true },
        { name: 'Máslo', amount: '150 g', is_main: true },
        { name: 'Cukr', amount: '200 g', is_main: false },
        { name: 'Vejce', amount: '3 ks', is_main: false },
        { name: 'Mouka', amount: '100 g', is_main: false },
        { name: 'Kakao', amount: '30 g', is_main: false },
        { name: 'Vlašské ořechy', amount: '100 g', is_main: false },
      ],
    },
    {
      name: 'Gazpacho',
      difficulty: 'easy' as const,
      instructions: `1. Rajčata, papriku, okurku, cibuli a česnek nakrájejte na kousky.
2. Vše rozmixujte s olivovým olejem a octem do hladka.
3. Dochutťe solí a pepřem.
4. Polévku nechte důkladně vychladit v lednici.
5. Podávejte s krutony z chleba.`,
      prep_time_mins: 20,
      ingredients: [
        { name: 'Rajčata', amount: '1 kg', is_main: true },
        { name: 'Paprika', amount: '1 ks', is_main: false },
        { name: 'Okurka', amount: '1 ks', is_main: false },
        { name: 'Cibule', amount: '1 ks', is_main: false },
        { name: 'Česnek', amount: '2 stroužky', is_main: false },
        { name: 'Olivový olej', amount: '50 ml', is_main: false },
        { name: 'Ocet', amount: '2 lžíce', is_main: false },
        { name: 'Chléb', amount: '2 plátky', is_main: false },
      ],
    },
    {
      name: 'Moussaka',
      difficulty: 'hard' as const,
      instructions: `1. Lilek a brambory nakrájejte na plátky a opečte na oleji.
2. Mleté maso orestujte s cibulí, česnekem a rajčaty, dochuťte skořicí, solí a pepřem.
3. Připravte bešamel z másla, mouky, mléka a muškátového oříšku.
4. Do pekáče vrstvěte brambory, lilek, masovou směs a zalijte bešamelem.
5. Pečte v troubě při 180°C asi 45 minut.`,
      prep_time_mins: 90,
      ingredients: [
        { name: 'Lilek', amount: '2 ks', is_main: true },
        { name: 'Mleté maso', amount: '500 g', is_main: true },
        { name: 'Brambory', amount: '4 ks', is_main: false },
        { name: 'Rajčata', amount: '400 g', is_main: false },
        { name: 'Cibule', amount: '1 ks', is_main: false },
        { name: 'Česnek', amount: '2 stroužky', is_main: false },
        { name: 'Mléko', amount: '500 ml', is_main: false },
        { name: 'Máslo', amount: '50 g', is_main: false },
        { name: 'Mouka', amount: '50 g', is_main: false },
        { name: 'Skořice', amount: '1 lžička', is_main: false },
        { name: 'Muškátový oříšek', amount: 'špetka', is_main: false },
      ],
    },
    {
      name: 'Gnocchi s rajčatovou omáčkou',
      difficulty: 'medium' as const,
      instructions: `1. Brambory uvařte ve slupce, oloupejte a prolisujte.
2. Smíchejte s moukou a vejcem, vypracujte těsto a vytvarujte noky.
3. Noky vařte v osolené vodě, dokud nevyplavou.
4. Na olivovém oleji orestujte česnek, přidejte rajčata a bazalku.
5. Omáčku smíchejte s uvařenými noky a posypte parmazánem.`,
      prep_time_mins: 60,
      ingredients: [
        { name: 'Brambory', amount: '800 g', is_main: true },
        { name: 'Mouka', amount: '250 g', is_main: true },
        { name: 'Rajčata', amount: '400 g', is_main: true },
        { name: 'Vejce', amount: '1 ks', is_main: false },
        { name: 'Olivový olej', amount: '2 lžíce', is_main: false },
        { name: 'Česnek', amount: '2 stroužky', is_main: false },
        { name: 'Bazalka', amount: 'hrst', is_main: false },
        { name: 'Parmazán', amount: '50 g', is_main: false },
      ],
    },
  ];

  for (const recipe of recipes) {
    const existing = await payload.find({
      collection: 'recipes',
      where: { name: { equals: recipe.name } },
    });

    const recipeData = {
      name: recipe.name,
      name_search: normalizeText(recipe.name),
      instructions: recipe.instructions,
      prep_time_mins: recipe.prep_time_mins,
      difficulty: recipe.difficulty,
    };

    let recipeId: number;

    if (existing.docs.length > 0) {
      recipeId = existing.docs[0].id;
      await payload.update({
        collection: 'recipes',
        id: recipeId,
        data: recipeData,
        context: { skipIngredientSync: true },
      });
      console.log(`Updated recipe: ${recipe.name}`);

      // Delete existing recipe-ingredients
      const existingIngredients = await payload.find({
        collection: 'recipe-ingredients',
        where: { recipe: { equals: recipeId } },
        limit: 100,
      });
      for (const ri of existingIngredients.docs) {
        await payload.delete({
          collection: 'recipe-ingredients',
          id: ri.id,
        });
      }
    } else {
      const created = await payload.create({
        collection: 'recipes',
        data: recipeData,
        context: { skipIngredientSync: true },
      });
      recipeId = created.id;
      console.log(`Created recipe: ${recipe.name}`);
    }

    // Create recipe ingredients
    for (const ing of recipe.ingredients) {
      const ingredientId = ingredientMap[ing.name];
      if (!ingredientId) {
        console.warn(`Ingredient "${ing.name}" not found, skipping`);
        continue;
      }

      await payload.create({
        collection: 'recipe-ingredients',
        data: {
          recipe: recipeId,
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
