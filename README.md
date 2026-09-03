# Sepehr Sarlak Academy

The public academy site runs as a persistent Next.js Node.js application backed
by PostgreSQL through Drizzle ORM.

## Requirements

- Node.js `>=22.13.0`
- PostgreSQL

Copy `.env.example` to `.env.local` and set `DATABASE_URL`, `BETTER_AUTH_SECRET`,
and `BETTER_AUTH_URL`. Server environment values are validated before a database
connection is created. Setting both `AUTH_FAKE_OTP_ENABLED=true` and
`AUTH_FAKE_OTP_PREVIEW_ENABLED=true` shows generated OTP codes in the login
screen for local/test use; keep both disabled when real email delivery is configured.

Production signup verification and password-recovery OTP delivery use authenticated SMTP through Nodemailer. Set
`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and
`SMTP_FROM`; fake OTP previews are unavailable when `NODE_ENV=production` even
if fake delivery is accidentally enabled. Normal login uses email and password;
OTP is required only to verify a new account or recover a password. Authentication
routes use PostgreSQL-backed per-IP and per-email rate limits. Signup and signup
resends have a 60-second email cooldown and a five-per-15-minute ceiling;
password recovery has a 60-second cooldown and a three-per-hour email ceiling.

Comma-separated `AUTH_ADMIN_EMAILS` and `AUTH_ADMIN_PHONES` values bootstrap the
admin role when a matching user creates their account. Phone authentication is
currently disabled, while the optional phone fields remain available for a future
provider. An admin can grant or revoke course
access at `/admin/enrollments`; students see active courses at `/dashboard`.

The learning workspace includes per-course progress, ordered previous/next lesson
navigation, private student notes, enrollment-relative content drip, and moderated
lesson comments. Instructors and admins manage lesson content, publishing, drip
delays, and the moderation queue at `/admin/learning`; only admins can grant the
instructor role or change enrollments. Learner actions always re-check the active
enrollment, published state, and release date on the server.

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
build, and verifies database health, verified-email signup, password login and
recovery, sessions, enrollment, the dashboard, and protected lesson access:

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
manager's environment. Keep `AUTH_FAKE_OTP_ENABLED=false` in production so codes
are delivered through SMTP and can never be previewed in the browser. Terminate
TLS at Nginx or an upstream load balancer.
