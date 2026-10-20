import { Router } from 'express';
import { clientsRouter } from './modules/clients/client.routes';

const router = Router();

router.use('/clients', clientsRouter);

export default router;
