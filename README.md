# facturation-relances

Invoicing API for freelancers: invoices in cents, PDF generation, statuses and automatic reminders for unpaid invoices.

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

Coming soon.

## License

[MIT](LICENSE)
