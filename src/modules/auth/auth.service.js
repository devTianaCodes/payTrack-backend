import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { prisma } from '../../prisma/client.js';
import { createHttpError } from '../../utils/httpError.js';

const passwordSaltRounds = 12;

export async function registerUser(data) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true },
  });

  if (existingUser) {
    throw createHttpError(409, 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(data.password, passwordSaltRounds);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      name: data.name,
      defaultCurrency: data.defaultCurrency ?? 'USD',
      locale: data.locale ?? 'en',
      timezone: data.timezone ?? 'UTC',
    },
    select: publicUserSelect,
  });

  return {
    user,
    token: createAccessToken(user.id),
  };
}

export async function loginUser(data) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email: data.email },
    select: {
      ...publicUserSelect,
      passwordHash: true,
    },
  });

  if (!userWithPassword) {
    throw createHttpError(401, 'Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(data.password, userWithPassword.passwordHash);

  if (!passwordMatches) {
    throw createHttpError(401, 'Invalid email or password');
  }

  const { passwordHash: _passwordHash, ...user } = userWithPassword;

  return {
    user,
    token: createAccessToken(user.id),
  };
}

function createAccessToken(userId) {
  if (!env.jwtAccessSecret) {
    throw createHttpError(500, 'JWT access secret is not configured');
  }

  return jwt.sign({}, env.jwtAccessSecret, {
    subject: userId,
    expiresIn: env.jwtAccessExpiresIn,
  });
}

export const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  defaultCurrency: true,
  locale: true,
  timezone: true,
};
