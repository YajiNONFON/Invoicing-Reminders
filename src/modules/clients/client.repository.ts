import { prisma } from '../../shared/db';
import type { CreateClientInput } from './client.dto';

const clientSelect = { id: true, name: true, email: true } as const;

export const clientRepository = {
  create(data: CreateClientInput) {
    return prisma.client.create({ data, select: clientSelect });
  },
};
