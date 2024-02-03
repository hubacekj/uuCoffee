import 'dotenv/config';
import { Pool } from 'pg';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

const main = (async () => {
  const pool = new Pool({
    connectionString: `${process.env.DATABASE_URL}`
  });

  const db = drizzle(pool, { schema });

  // This will run migrations on the database, skipping the ones already applied
  await migrate(db, { migrationsFolder: './drizzle' });

  await pool.end();
})();
