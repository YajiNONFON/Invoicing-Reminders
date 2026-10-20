import { conflict, notFound } from '../../shared/errors';
import type { CreateClientInput } from './client.dto';
import { clientRepository } from './client.repository';

// Prisma error code for a violated unique constraint
const UNIQUE_VIOLATION = 'P2002';

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === UNIQUE_VIOLATION
  );
}

export const clientService = {
  async create(input: CreateClientInput) {
    try {
      return await clientRepository.create(input);
    } catch (error) {
      // The database enforces uniqueness, so two simultaneous requests cannot both succeed
      if (isUniqueViolation(error)) {
        throw conflict('A client with this email already exists');
      }
      throw error;
    }
  },

  async getById(id: string) {
    const client = await clientRepository.findById(id);
    if (!client) {
      throw notFound('Client not found');
    }
    return client;
  },
};
