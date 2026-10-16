# API contract (v0)

The backend must comply with this contract, and Swagger documents it.

- Amounts are in **cents (integers)**.
- Dates use the `YYYY-MM-DD` format.
- Errors: `{ "message": "..." }` with a 4xx HTTP status code.

## Routes

| Method | Route               | Body                                                                   | Response                                                      |
| ------ | ------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------- |
| POST   | /clients            | `{name, email}`                                                        | `{id, name, email}`                                           |
| POST   | /invoices           | `{clientId, dueDate, lines:[{description, quantity, unitPriceCents}]}` | invoice (status `draft`, `totalCents` computed by the server) |
| GET    | /invoices           |                                                                        | list of invoices                                              |
| GET    | /invoices/:id       |                                                                        | invoice + `reminders[]`                                       |
| POST   | /invoices/:id/send  |                                                                        | invoice (`draft` to `sent`, otherwise 409)                    |
| POST   | /invoices/:id/pay   |                                                                        | invoice (`sent` or `overdue` to `paid`, otherwise 409)        |
| GET    | /invoices/:id/pdf   |                                                                        | PDF file                                                      |
| GET    | /reminders          |                                                                        | `[{id, invoiceId, number, to, date, subject}]`                |
| POST   | /jobs/overdue-check | `{today?}`                                                             | `{overdue, remindersCreated}`                                 |

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

## Statuses and transitions

Statuses: `draft`, `sent`, `paid`, `overdue`.

Allowed transitions: `draft` to `sent`, `sent` to `paid`, `sent` to `overdue`, `overdue` to `paid`. Nothing else.

## Reminder rule

At most one reminder per invoice per day (idempotent).
