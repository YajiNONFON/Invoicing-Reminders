import type { Request, Response } from 'express';
import { createClientSchema } from './client.dto';
import { clientService } from './client.service';

export const clientController = {
  async create(req: Request, res: Response) {
    const input = createClientSchema.parse(req.body);
    const client = await clientService.create(input);
    res.status(201).json(client);
  },
};
