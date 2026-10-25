# Invoicing-Reminders

![CI](https://github.com/YajiNONFON/Invoicing-Reminders/actions/workflows/ci.yml/badge.svg)

Invoicing API for freelancers: invoices in cents, PDF generation, statuses and automatic reminders for unpaid invoices.

## Goal

An overdue invoice automatically triggers a recorded reminder, with no manual action.

Getting paid is a chain of small steps: create the invoice, produce the PDF, send it, check whether it was paid, chase it if it was not. This project handles the whole chain, and the last step, the reminder nobody remembers to send, runs by itself.

## What it does

- Create clients and invoices. Totals are computed by the server, in cents.
- Statuses `draft`, `sent`, `paid`, `overdue`, with controlled transitions (every forbidden move is rejected and tested).
- Invoice PDF generation.
- A daily job flags overdue invoices and records one reminder for each, at most one per invoice per day.

A reminder is recorded (who, which invoice, when, subject). Sending it by email is deliberately out of scope. See [`docs/DECISIONS.md`](docs/DECISIONS.md).

## Try it in two minutes

After [getting started](#getting-started):

1. Fill the database with demo data (this deletes existing data).
   ```bash
   npm run seed
   ```
2. Open http://localhost:5000/docs.
3. `GET /invoices` shows five invoices. `FAC-0002` and `FAC-0003` are sent and already past their due date.
4. Run `POST /jobs/overdue-check` (or wait for the daily schedule). The response is `{ "overdue": 2, "remindersCreated": 2 }`.
5. Run it again: `remindersCreated` is `0`. One reminder per invoice per day.
6. `GET /reminders` lists the two recorded reminders, and `GET /invoices/{id}/pdf` downloads an invoice.

## Stack

Node.js, TypeScript, Express, Prisma, PostgreSQL, Swagger (OpenAPI), Vitest, Docker Compose, GitHub Actions.

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
| `npm run check`      | Format, lint, build and test in one go     |
| `npm run lint`       | Check the code with ESLint                 |
| `npm run format`     | Format the code with Prettier              |
| `npm run seed`       | Fill the database with demo data           |
| `npm run db:migrate` | Create and apply a migration (development) |
| `npm run db:deploy`  | Apply existing migrations                  |

## Automatic reminders

Once a day (08:00, `Africa/Porto-Novo` by default) the API looks for sent invoices whose due date has passed, flags them as `overdue` and records one reminder for each of them. A reminder is never recorded twice for the same invoice on the same day, even if two runs overlap: the database enforces it with a unique constraint on `(invoiceId, day)`.

- Change the schedule with `OVERDUE_CRON` (cron syntax) and the timezone with `APP_TIMEZONE`. See `.env.example`.
- Trigger a run by hand with `POST /api/jobs/overdue-check`. Outside production you can pass `{ "today": "YYYY-MM-DD" }` to simulate another day.
- List the recorded reminders with `GET /api/reminders`.

## Project structure

```
src/
  modules/
    clients/      routes, controller, service, repository, tests
    invoices/     same layers, plus PDF rendering and the status rules
    reminders/    reminders, the overdue job and its scheduler
  shared/         database client, dates, errors
  config/         Swagger
prisma/           schema and migrations
```

Each module follows the same flow: routes → controller (HTTP only) → service (business rules) → repository (every database query).

## Documentation

- [`docs/API.md`](docs/API.md): API contract
- [`docs/DECISIONS.md`](docs/DECISIONS.md): design decisions, reasons and trade-offs

## Note on the front end

A demo interface exists but is not included in this repository. The API contract is described in `docs/API.md`.

## License

[MIT](LICENSE)
