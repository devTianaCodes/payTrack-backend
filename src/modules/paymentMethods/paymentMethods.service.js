import { prisma } from '../../prisma/client.js';
import { createHttpError } from '../../utils/httpError.js';

export function listPaymentMethods(userId) {
  return prisma.paymentMethod.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  });
}

export function createPaymentMethod(userId, data) {
  return prisma.paymentMethod.create({
    data: {
      userId,
      name: data.name,
      type: data.type,
      lastFour: data.lastFour,
      color: data.color ?? '#101828',
      notes: data.notes,
    },
  });
}

export async function updatePaymentMethod(userId, paymentMethodId, data) {
  await ensurePaymentMethodOwner(userId, paymentMethodId);

  return prisma.paymentMethod.update({
    where: { id: paymentMethodId },
    data,
  });
}

export async function deletePaymentMethod(userId, paymentMethodId) {
  await ensurePaymentMethodOwner(userId, paymentMethodId);
  await prisma.paymentMethod.delete({ where: { id: paymentMethodId } });
}

async function ensurePaymentMethodOwner(userId, paymentMethodId) {
  const paymentMethod = await prisma.paymentMethod.findUnique({
    where: { id: paymentMethodId },
    select: { id: true, userId: true },
  });

  if (!paymentMethod || paymentMethod.userId !== userId) {
    throw createHttpError(404, 'Payment method not found');
  }
}
