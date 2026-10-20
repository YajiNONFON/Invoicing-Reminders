import { notFound } from '../../shared/errors';
import type { CreateClientInput } from './client.dto';
import { clientRepository } from './client.repository';

export const clientService = {
  create(input: CreateClientInput) {
    return clientRepository.create(input);
  },

  async getById(id: string) {
    const client = await clientRepository.findById(id);
    if (!client) {
      throw notFound('Client not found');
    }
    return client;
  },
};
