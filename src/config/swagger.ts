import path from 'node:path';
import swaggerJsdoc from 'swagger-jsdoc';

// swagger-jsdoc reads the "@openapi" comments written in the *.routes files.
// The pattern matches .ts (npm run dev) and .js (npm start, after the build).
// glob patterns need forward slashes, even on Windows.
const routeFiles = path
  .join(__dirname, '..', 'modules', '**', '*.routes.{ts,js}')
  .split(path.sep)
  .join('/');

export const openApiSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Invoicing-Reminders API',
      version: '0.1.0',
      description: 'Invoicing API: invoices in cents, PDF generation, statuses and reminders.',
    },
    servers: [{ url: '/api' }],
    components: {
      schemas: {
        Error: {
          type: 'object',
          required: ['message'],
          properties: { message: { type: 'string', example: 'email: Invalid email address' } },
        },
      },
    },
  },
  apis: [routeFiles],
});
