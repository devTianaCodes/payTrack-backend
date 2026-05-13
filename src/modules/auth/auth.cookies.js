import { env } from '../../config/env.js';

const sessionCookieName = 'accessToken';
const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000;

export function setSessionCookie(response, token) {
  response.cookie(sessionCookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    signed: Boolean(env.cookieSecret),
    maxAge: oneWeekInMilliseconds,
    path: '/',
  });
}

export function clearSessionCookie(response) {
  response.clearCookie(sessionCookieName, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    signed: Boolean(env.cookieSecret),
    path: '/',
  });
}
