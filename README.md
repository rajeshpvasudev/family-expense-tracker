# Family Expense Tracker

Mobile-first family expense tracker being built separately from the temporary Google Sheets / Apps Script SMS ingestion prototype.

## Current V1

- Money Manager-style monthly calendar
- Monthly Income / Expense / Net summary
- Daily transaction list
- Manual transaction entry
- Uttu / Chippa owner selection
- Needs Review category support
- Data access isolated behind `transactionService`
- Local browser storage used temporarily so the UI stays decoupled from Google Sheets

A demo RAKBANK transaction is included:

- 19/09/2026
- Uttu RAK
- Amazon Grocery
- AED 123.46
- Groceries

## Architecture direction

Temporary ingestion test:

```
RAKBANK SMS -> iPhone Shortcut -> Google Apps Script -> Google Sheet
```

Target production architecture:

```
Bank SMS / email / statement
        |
        v
Cloud API
        |
        v
PostgreSQL
        |
        v
Family Expense Web App / PWA
```

The frontend should not depend directly on Google Sheets. When the cloud backend is ready, replace the implementation in `src/data/transactionService.js` with HTTP API calls.

## Run locally

Because the app uses ES modules, use any static web server rather than opening `index.html` directly.

For example:

```bash
python -m http.server 8080
```

Then open:

```
http://localhost:8080
```

## Next planned work

1. Transactions view with search and filters
2. Needs Review workflow
3. Accounts view
4. Edit/delete transactions
5. Cloud API contract
6. ASP.NET Core + PostgreSQL backend
7. PWA install support
