# API contract (v0)

The backend complies with this contract, and Swagger documents it.

- Amounts are in **cents (integers)**.
- Dates use the `YYYY-MM-DD` format.
- Errors: `{ "message": "..." }` with a 4xx HTTP status code (5xx only for unexpected errors).
- Interactive documentation: `/docs` (OpenAPI JSON at `/docs.json`). Health check: `GET /health` (outside `/api`).

## Routes

| Method | Route                   | Body                                                                   | Response                                                          |
| ------ | ----------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------- |
| POST   | /api/clients            | `{name, email}`                                                        | `{id, name, email}` (email must be unique)                        |
| POST   | /api/invoices           | `{clientId, dueDate, lines:[{description, quantity, unitPriceCents}]}` | invoice (status `draft`, `totalCents` computed by the server)     |
| GET    | /api/invoices           |                                                                        | list of invoices, most recent first                               |
| GET    | /api/invoices/:id       |                                                                        | invoice + `reminders[]`                                           |
| POST   | /api/invoices/:id/send  |                                                                        | invoice (`draft` to `sent`, otherwise 409)                        |
| POST   | /api/invoices/:id/pay   |                                                                        | invoice (`sent` or `overdue` to `paid`, otherwise 409)            |
| GET    | /api/invoices/:id/pdf   |                                                                        | PDF file                                                          |
| GET    | /api/reminders          |                                                                        | `[{id, invoiceId, number, to, date, subject}]`, most recent first |
| POST   | /api/jobs/overdue-check | `{today?}`                                                             | `{overdue, remindersCreated}`                                     |

## Status codes

| Code | Meaning                                                                       |
| ---- | ----------------------------------------------------------------------------- |
| 200  | Success (reads, `send`, `pay`, `overdue-check`, `pdf`)                        |
| 201  | Resource created (`POST /api/clients`, `POST /api/invoices`)                  |
| 400  | Invalid input (the message names the faulty field), or a due date in the past |
| 404  | Unknown route, client or invoice                                              |
| 409  | Forbidden status transition, or a client with this email already exists       |
| 500  | Unexpected error: `{ "message": "Internal server error" }`                    |

## Invoice

```json
{
  "id": "...",
  "number": "FAC-0001",
  "client": { "id": "...", "name": "...", "email": "..." },
  "issueDate": "YYYY-MM-DD",
  "dueDate": "YYYY-MM-DD",
  "status": "draft",
  "lines": [{ "description": "...", "quantity": 1, "unitPriceCents": 0 }],
  "totalCents": 0
}
```

`issueDate` is the day the invoice is created. `GET /api/invoices/:id` adds `reminders`, an array of the same objects as `GET /api/reminders`.

## Statuses and transitions

Statuses: `draft`, `sent`, `paid`, `overdue`.

Allowed transitions: `draft` to `sent`, `sent` to `paid`, `sent` to `overdue`, `overdue` to `paid`. Nothing else.

## Reminders

An invoice is overdue when its due date is before today. The overdue check flags sent invoices that are overdue and records one reminder for each overdue invoice. There is at most one reminder per invoice per day (idempotent), and none once the invoice is paid.

The check runs automatically every day (`OVERDUE_CRON`, default 08:00 in `APP_TIMEZONE`). `POST /api/jobs/overdue-check` runs it on demand and returns `{ overdue, remindersCreated }`: the number of overdue invoices found and the number of reminders newly recorded.

In that request, the optional `today` field is only honored outside production (demo and tests). In production the server date is used.
