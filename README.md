# Invoicing-Reminders

Invoicing API: invoices in cents, PDF generation, statuses and automatic reminders for unpaid invoices.

**Status:** under construction.

## Goal

An overdue invoice automatically triggers a recorded reminder, with no manual action.

## Planned features

- Create clients and invoices (totals computed by the server, in cents)
- Statuses `draft`, `sent`, `paid`, `overdue` with controlled transitions
- Invoice PDF generation
- Daily detection of overdue invoices and reminder creation (at most one reminder per invoice per day)

## Stack

Node.js, TypeScript, Express, Prisma, PostgreSQL, Swagger (OpenAPI), Vitest, Docker Compose, GitHub Actions.

## Documentation

- [`docs/API.md`](docs/API.md): API contract

## Note on the front end

A demo interface exists but is not included in this repository. The API contract is described in `docs/API.md`.

## Getting started

## Getting started

Requirements: Node.js 20 or later and Docker.

```bash
git clone https://github.com/YajiNONFON/Invoicing-Reminders.git
cd Invoicing-Reminders
npm install
cp .env.example .env
docker compose up -d
npm run db:deploy
npm run dev
```

The API listens on http://localhost:5000.

- Interactive documentation: http://localhost:5000/docs
- Health check: http://localhost:5000/health

### Scripts

| Script               | What it does                               |
| -------------------- | ------------------------------------------ |
| `npm run dev`        | Start the API with auto-reload             |
| `npm run build`      | Compile TypeScript to `dist/`              |
| `npm start`          | Run the compiled API                       |
| `npm test`           | Run the test suite                         |
| `npm run lint`       | Check the code with ESLint                 |
| `npm run format`     | Format the code with Prettier              |
| `npm run db:migrate` | Create and apply a migration (development) |
| `npm run db:deploy`  | Apply existing migrations                  |

## License

[MIT](LICENSE)
