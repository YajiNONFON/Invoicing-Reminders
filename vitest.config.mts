import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Creating the Prisma client does not open a connection, so tests need no running database.
    env: { DATABASE_URL: 'postgresql://invoicing:invoicing@localhost:5433/invoicing' },
  },
});
