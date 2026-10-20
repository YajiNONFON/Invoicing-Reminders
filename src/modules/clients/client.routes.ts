import { Router } from 'express';
import { clientController } from './client.controller';

export const clientsRouter = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Client:
 *       type: object
 *       required: [id, name, email]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: Ada Lovelace
 *         email:
 *           type: string
 *           format: email
 *           example: ada@example.com
 *     CreateClientInput:
 *       type: object
 *       required: [name, email]
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *           example: Ada Lovelace
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 254
 *           example: ada@example.com
 */

/**
 * @openapi
 * /clients:
 *   post:
 *     tags: [Clients]
 *     summary: Create a client
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateClientInput'
 *     responses:
 *       201:
 *         description: Client created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
clientsRouter.post('/', clientController.create);
