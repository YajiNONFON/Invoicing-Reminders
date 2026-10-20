import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.email().trim().toLowerCase().max(254),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
