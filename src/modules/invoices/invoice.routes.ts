import { Router } from 'express';
import { invoiceController } from './invoice.controller';

export const invoicesRouter = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     InvoiceLine:
 *       type: object
 *       required: [description, quantity, unitPriceCents]
 *       properties:
 *         description:
 *           type: string
 *           example: Website design
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 3
 *         unitPriceCents:
 *           type: integer
 *           minimum: 0
 *           description: Unit price in cents
 *           example: 1999
 *     Invoice:
 *       type: object
 *       required: [id, number, client, issueDate, dueDate, status, lines, totalCents]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         number:
 *           type: string
 *           example: FAC-0001
 *         client:
 *           $ref: '#/components/schemas/Client'
 *         issueDate:
 *           type: string
 *           format: date
 *           example: '2026-10-20'
 *         dueDate:
 *           type: string
 *           format: date
 *           example: '2026-11-19'
 *         status:
 *           type: string
 *           enum: [draft, sent, paid, overdue]
 *         lines:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/InvoiceLine'
 *         totalCents:
 *           type: integer
 *           description: Computed by the server from the lines
 *           example: 6998
 *     CreateInvoiceInput:
 *       type: object
 *       required: [clientId, dueDate, lines]
 *       properties:
 *         clientId:
 *           type: string
 *           format: uuid
 *         dueDate:
 *           type: string
 *           format: date
 *           example: '2026-11-19'
 *         lines:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/InvoiceLine'
 */

/**
 * @openapi
 * /invoices:
 *   post:
 *     tags: [Invoices]
 *     summary: Create an invoice
 *     description: >
 *       Creates a draft invoice. The number (FAC-0001, FAC-0002...) and the total are computed
 *       by the server. The issue date is today.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInvoiceInput'
 *     responses:
 *       201:
 *         description: Invoice created (status draft)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: Invalid input, due date before the issue date, or total too large
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Client not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
invoicesRouter.post('/', invoiceController.create);
