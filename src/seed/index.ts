import 'dotenv/config';
import config from '@payload-config';
import { seedData } from './seed-data';
import { getPayload } from 'payload';

async function run() {
  const payload = await getPayload({ config });

  try {
    await seedData(payload);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

run();
