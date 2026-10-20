import type { CreateClientInput } from './client.dto';
import { clientRepository } from './client.repository';

export const clientService = {
  create(input: CreateClientInput) {
    return clientRepository.create(input);
  },
};
