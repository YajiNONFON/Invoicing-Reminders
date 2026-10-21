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

/**
 * @openapi
 * /invoices:
 *   get:
 *     tags: [Invoices]
 *     summary: List invoices
 *     description: Most recent first.
 *     responses:
 *       200:
 *         description: All invoices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Invoice'
 */
invoicesRouter.get('/', invoiceController.list);

/**
 * @openapi
 * /invoices/{id}:
 *   get:
 *     tags: [Invoices]
 *     summary: Get an invoice with its reminders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: The invoice, with a reminders array
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Invoice'
 *                 - type: object
 *                   required: [reminders]
 *                   properties:
 *                     reminders:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: The id is not a valid UUID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Invoice not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
invoicesRouter.get('/:id', invoiceController.getById);

/**
 * @openapi
 * /invoices/{id}/send:
 *   post:
 *     tags: [Invoices]
 *     summary: Mark an invoice as sent
 *     description: Allowed from draft only.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Invoice, now sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: The id is not a valid UUID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Invoice not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: The invoice is not in a status that allows this change
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
invoicesRouter.post('/:id/send', invoiceController.send);

/**
 * @openapi
 * /invoices/{id}/pay:
 *   post:
 *     tags: [Invoices]
 *     summary: Mark an invoice as paid
 *     description: Allowed from sent or overdue. Records a payment for the full total.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Invoice, now paid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: The id is not a valid UUID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Invoice not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: The invoice is not in a status that allows this change
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
invoicesRouter.post('/:id/pay', invoiceController.pay);
