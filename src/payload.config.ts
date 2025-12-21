import { Users } from './collections/users';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { Categories, Ingredients } from './collections/ingredients';
import { Recipes } from './collections/recipes';
import { RecipeIngredients } from './collections/recipe-ingredients';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// https://stackoverflow.com/questions/72466834/nestjs-logs-have-weird-characters-in-log-management-tools
process.env.NO_COLOR = 'true';

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Categories, Ingredients, Recipes, RecipeIngredients],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
});
