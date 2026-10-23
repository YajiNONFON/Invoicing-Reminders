import { Router } from 'express';
import { clientsRouter } from './modules/clients/client.routes';
import { invoicesRouter } from './modules/invoices/invoice.routes';
import { jobsRouter } from './modules/reminders/job.routes';
import { remindersRouter } from './modules/reminders/reminder.routes';

const router = Router();

router.use('/clients', clientsRouter);
router.use('/invoices', invoicesRouter);
router.use('/reminders', remindersRouter);
router.use('/jobs', jobsRouter);

export default router;
