import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema',
  driver: "pg",
  dbCredentials: {
    connectionString: `${process.env.DB_URL}`,
  },
  out: './drizzle',
} satisfies Config;
