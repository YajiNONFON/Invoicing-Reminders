import { Router } from 'express';
import { clientController } from './client.controller';

export const clientsRouter = Router();

clientsRouter.post('/', clientController.create);
