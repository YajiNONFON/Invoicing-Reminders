import { Router } from 'express';
import { clientsRouter } from './modules/clients/client.routes';
import { invoicesRouter } from './modules/invoices/invoice.routes';

const router = Router();

router.use('/clients', clientsRouter);
router.use('/invoices', invoicesRouter);

export default router;
