# Sepehr Sarlak Academy

The public academy site runs as a persistent Next.js Node.js application backed
by PostgreSQL through Drizzle ORM.

## Requirements

- Node.js `>=22.13.0`
- PostgreSQL

Copy `.env.example` to `.env.local` and set `DATABASE_URL`. Server environment
values are validated before a database connection is created.

## Development

```bash
npm install
npm run db:migrate
npm run dev
```

Useful checks:

```bash
npm test
npm run lint
npm run build:standalone
```

The database health endpoint is `GET /api/health/db/`. It returns HTTP 200 only
after PostgreSQL answers a query, and HTTP 503 otherwise.

Run the database-backed HTTP integration test with a disposable PostgreSQL
database:

```bash
TEST_DATABASE_URL=postgresql://academy:password@127.0.0.1:5432/academy_test npm run test:integration
```

## Database changes

Edit `db/schema.ts`, run `npm run db:generate`, review the generated SQL under
`drizzle/`, and commit both the schema and migration metadata. Apply committed
migrations with `npm run db:migrate` during deployment before restarting the
application.

## Standalone deployment behind Nginx

`npm run build:standalone` produces the complete runtime directory at
`.next/standalone`, including `public` and `.next/static`. Copy that directory
to `/opt/sepehr-sarlak-academy`, install `deploy/nginx.conf` as the Nginx site,
and install `deploy/sepehr-sarlak-academy.service` as the systemd unit.

For a direct foreground start:

```bash
cd /opt/sepehr-sarlak-academy
HOSTNAME=127.0.0.1 PORT=3000 NODE_ENV=production node server.js
```

Provide `DATABASE_URL` and optional `DB_POOL_MAX` through the process manager's
environment. Terminate TLS at Nginx or an upstream load balancer.
