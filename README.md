# Sepehr Sarlak Academy

The public academy site runs as a persistent Next.js Node.js application backed
by PostgreSQL through Drizzle ORM.

## Requirements

- Node.js `>=22.13.0`
- PostgreSQL

Copy `.env.example` to `.env.local` and set `DATABASE_URL`, `BETTER_AUTH_SECRET`,
and `BETTER_AUTH_URL`. Server environment values are validated before a database
connection is created. `AUTH_FAKE_OTP_ENABLED=true` shows generated OTP codes in
the login screen for local/staging use; disable it when real SMS and email
delivery adapters are configured.

Comma-separated `AUTH_ADMIN_EMAILS` and `AUTH_ADMIN_PHONES` values bootstrap the
admin role when a matching user completes their first OTP login. Iranian mobile
numbers are stored in `+989…` format. An admin can then grant or revoke course
access at `/admin/enrollments`; students see active courses at `/dashboard`.

## Development

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Useful checks:

```bash
npm test
npm run lint
npm run build:standalone
```

The seed command imports the public course catalog and creates one protected
welcome lesson per course. Authentication, profile, role, enrollment, progress,
and audit data remains in PostgreSQL.

The database health endpoint is `GET /api/health/db/`. It returns HTTP 200 only
after PostgreSQL answers a query, and HTTP 503 otherwise.

Run the database-backed HTTP integration test with a disposable PostgreSQL
database. The runner applies migrations, seeds courses, creates a standalone
build, and verifies database health, email OTP, phone OTP, sessions, enrollment,
the dashboard, and protected lesson access:

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

Provide the validated database and authentication variables through the process
manager's environment. Keep `AUTH_FAKE_OTP_ENABLED=false` in production until a
real delivery adapter is intentionally configured. Terminate TLS at Nginx or an
upstream load balancer.
