import dotenv from 'dotenv';

dotenv.config();

const defaultFrontendUrl = 'http://localhost:5317';
const frontendUrls = parseCsv(process.env.FRONTEND_URLS ?? process.env.FRONTEND_URL ?? defaultFrontendUrl);

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5318),
  frontendUrl: frontendUrls[0] ?? defaultFrontendUrl,
  frontendUrls,
  databaseUrl: process.env.DATABASE_URL,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  cookieSecret: process.env.COOKIE_SECRET,
  cookieSameSite: normalizeCookieSameSite(process.env.COOKIE_SAME_SITE),
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM ?? 'PayTrack <no-reply@paytrack.local>',
  },
};

function normalizeCookieSameSite(value) {
  const sameSite = value?.trim().toLowerCase();
  if (['lax', 'strict', 'none'].includes(sameSite)) return sameSite;
  return 'lax';
}

function parseCsv(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
