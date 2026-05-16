# PayTrack Backend

Express API for the PayTrack subscription manager.

## Stack

- Node.js
- Express
- Prisma
- MySQL
- JWT HTTP-only cookie sessions
- Nodemailer
- node-cron
- Zod

## Architecture Flow

![PayTrack app logic and architecture](docs/paytrack-architecture-flow.png)

## Local Setup

```bash
npm install
cp .env.example .env
docker compose up -d mysql
npm run prisma:migrate
npm run db:seed
npm run prisma:generate
npm run dev
```

The API runs on `http://localhost:5318`.

Health check:

```bash
curl http://localhost:5318/health
```

## Environment Notes

- `FRONTEND_URL` sets the primary frontend origin for local development.
- `FRONTEND_URLS` can be used for comma-separated deployed origins, such as preview and production URLs.
- `COOKIE_SAME_SITE=lax` works for same-site/local setups.
- Use `COOKIE_SAME_SITE=none` only for HTTPS cross-site frontend/backend deployments; cookies are then sent with `Secure`.

## Development Credentials

After running `npm run db:seed`, use:

```text
Email: demo@paytrack.local
Password: PayTrack123!
```
