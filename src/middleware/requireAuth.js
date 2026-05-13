import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../prisma/client.js';
import { asyncRoute } from '../utils/asyncRoute.js';
import { createHttpError } from '../utils/httpError.js';

export const requireAuth = asyncRoute(async (request, _response, next) => {
  const token = request.signedCookies?.accessToken ?? request.cookies?.accessToken;

  if (!token) {
    throw createHttpError(401, 'Authentication required');
  }

  if (!env.jwtAccessSecret) {
    throw createHttpError(500, 'JWT access secret is not configured');
  }

  let payload;

  try {
    payload = jwt.verify(token, env.jwtAccessSecret);
  } catch {
    throw createHttpError(401, 'Invalid or expired session');
  }

  const userId = payload.sub;
  if (!userId) {
    throw createHttpError(401, 'Invalid session payload');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      defaultCurrency: true,
      locale: true,
      timezone: true,
    },
  });

  if (!user) {
    throw createHttpError(401, 'User not found for session');
  }

  request.user = user;
  return next();
});
