import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      // Creating the Prisma client does not open a connection, so most tests need no database.
      // In CI the real URL is provided and the database tests run (RUN_DB_TESTS=true).
      DATABASE_URL:
        process.env.DATABASE_URL ?? 'postgresql://invoicing:invoicing@localhost:5433/invoicing',
    },
  },
});
