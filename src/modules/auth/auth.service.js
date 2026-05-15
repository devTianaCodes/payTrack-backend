import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';
import { prisma } from '../../prisma/client.js';
import { createHttpError } from '../../utils/httpError.js';

const passwordSaltRounds = 12;
const passwordResetTokenHours = 1;
let transporter;

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

export async function requestPasswordReset(data) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    return genericPasswordResetResponse();
  }

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashPasswordResetToken(token);
  const expiresAt = new Date(Date.now() + passwordResetTokenHours * 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const resetUrl = `${env.frontendUrl}/reset-password?token=${token}`;
  const emailResult = await safelySendPasswordResetEmail({ user, resetUrl });

  return {
    ...genericPasswordResetResponse(),
    resetUrl: emailResult.skipped && env.nodeEnv === 'development' ? resetUrl : undefined,
  };
}

export async function confirmPasswordReset(data) {
  const tokenHash = hashPasswordResetToken(data.token);
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      expiresAt: true,
      usedAt: true,
      userId: true,
    },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= new Date()) {
    throw createHttpError(400, 'Password reset link is invalid or expired');
  }

  const passwordHash = await bcrypt.hash(data.password, passwordSaltRounds);
  const user = await prisma.$transaction(async (transaction) => {
    await transaction.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });

    await transaction.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    return transaction.user.findUniqueOrThrow({
      where: { id: resetToken.userId },
      select: publicUserSelect,
    });
  });

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

function hashPasswordResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function genericPasswordResetResponse() {
  return {
    message: 'If an account exists for that email, a reset link has been sent.',
  };
}

async function sendPasswordResetEmail({ user, resetUrl }) {
  if (!env.smtp.host) {
    return { skipped: true, reason: 'SMTP is not configured' };
  }

  transporter ??= nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: env.smtp.user
      ? {
          user: env.smtp.user,
          pass: env.smtp.pass,
        }
      : undefined,
  });

  await transporter.sendMail({
    from: env.smtp.from,
    to: user.email,
    subject: 'Reset your PayTrack password',
    text: [
      `Hi ${user.name ?? 'there'},`,
      '',
      'Use this link to reset your PayTrack password:',
      resetUrl,
      '',
      `This link expires in ${passwordResetTokenHours} hour.`,
      'If you did not request this, you can ignore this email.',
      '',
      'PayTrack',
    ].join('\n'),
  });

  return { skipped: false };
}

async function safelySendPasswordResetEmail({ user, resetUrl }) {
  try {
    return await sendPasswordResetEmail({ user, resetUrl });
  } catch (error) {
    if (env.nodeEnv === 'development') {
      return { skipped: true, reason: error.message };
    }

    throw error;
  }
}
