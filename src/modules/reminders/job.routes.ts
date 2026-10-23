import { Router } from 'express';
import { jobController } from './job.controller';

export const jobsRouter = Router();

/**
 * @openapi
 * /jobs/overdue-check:
 *   post:
 *     tags: [Jobs]
 *     summary: Detect overdue invoices and record reminders
 *     description: >
 *       Flags sent invoices whose due date is before today as overdue, then records one reminder
 *       per overdue invoice. At most one reminder per invoice per day, so running it twice the
 *       same day creates nothing new. The optional `today` field is only honored outside
 *       production (demos and tests).
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               today:
 *                 type: string
 *                 format: date
 *                 example: '2026-12-01'
 *     responses:
 *       200:
 *         description: Result of the run
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [overdue, remindersCreated]
 *               properties:
 *                 overdue:
 *                   type: integer
 *                   description: Overdue invoices found
 *                 remindersCreated:
 *                   type: integer
 *                   description: New reminders recorded by this run
 *       400:
 *         description: Invalid date
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
jobsRouter.post('/overdue-check', jobController.overdueCheck);
