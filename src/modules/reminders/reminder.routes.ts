import { Router } from 'express';
import { reminderController } from './reminder.controller';

export const remindersRouter = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Reminder:
 *       type: object
 *       required: [id, invoiceId, number, to, date, subject]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         invoiceId:
 *           type: string
 *           format: uuid
 *         number:
 *           type: string
 *           example: FAC-0001
 *         to:
 *           type: string
 *           format: email
 *           example: ada@example.com
 *         date:
 *           type: string
 *           format: date
 *           example: '2026-10-23'
 *         subject:
 *           type: string
 *           example: 'Reminder: invoice FAC-0001 is overdue'
 */

/**
 * @openapi
 * /reminders:
 *   get:
 *     tags: [Reminders]
 *     summary: List recorded reminders
 *     description: Most recent first.
 *     responses:
 *       200:
 *         description: All reminders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reminder'
 */
remindersRouter.get('/', reminderController.list);
