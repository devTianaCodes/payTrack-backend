import { env } from '../../config/env.js';

const sessionCookieName = 'accessToken';
const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000;

export function setSessionCookie(response, token) {
  response.cookie(sessionCookieName, token, getSessionCookieOptions({ includeMaxAge: true }));
}

export function clearSessionCookie(response) {
  response.clearCookie(sessionCookieName, getSessionCookieOptions());
}

export function getSessionCookieOptions({ includeMaxAge = false } = {}) {
  const options = {
    httpOnly: true,
    sameSite: env.cookieSameSite,
    secure: env.nodeEnv === 'production' || env.cookieSameSite === 'none',
    signed: Boolean(env.cookieSecret),
    path: '/',
  };

  if (includeMaxAge) {
    options.maxAge = oneWeekInMilliseconds;
  }

  return options;
}
