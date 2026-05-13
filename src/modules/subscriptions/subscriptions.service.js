import { prisma } from '../../prisma/client.js';
import { createHttpError } from '../../utils/httpError.js';

const subscriptionInclude = {
  category: true,
  paymentMethod: true,
};

export function listSubscriptions(userId, filters) {
  return prisma.subscription.findMany({
    where: buildSubscriptionFilters(userId, filters),
    include: subscriptionInclude,
    orderBy: [{ nextRenewalDate: 'asc' }, { name: 'asc' }],
  });
}

export async function createSubscription(user, data) {
  await validateRelations(user.id, data);

  return prisma.subscription.create({
    data: {
      userId: user.id,
      name: data.name,
      price: data.price,
      currency: data.currency ?? user.defaultCurrency,
      billingFrequency: data.billingFrequency,
      nextRenewalDate: data.nextRenewalDate,
      categoryId: data.categoryId ?? null,
      paymentMethodId: data.paymentMethodId ?? null,
      notes: data.notes,
    },
    include: subscriptionInclude,
  });
}

export async function getSubscription(userId, subscriptionId) {
  const subscription = await prisma.subscription.findFirst({
    where: { id: subscriptionId, userId },
    include: subscriptionInclude,
  });

  if (!subscription) {
    throw createHttpError(404, 'Subscription not found');
  }

  return subscription;
}

export async function updateSubscription(user, subscriptionId, data) {
  await getSubscription(user.id, subscriptionId);
  await validateRelations(user.id, data);

  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: normalizeSubscriptionUpdate(data),
    include: subscriptionInclude,
  });
}

export async function cancelSubscription(userId, subscriptionId) {
  await getSubscription(userId, subscriptionId);

  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: 'cancelled',
      cancelledAt: new Date(),
    },
    include: subscriptionInclude,
  });
}

export async function deleteSubscription(userId, subscriptionId) {
  await getSubscription(userId, subscriptionId);
  await prisma.subscription.delete({ where: { id: subscriptionId } });
}

function buildSubscriptionFilters(userId, filters) {
  const where = { userId };

  if (filters.status) where.status = filters.status;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.paymentMethodId) where.paymentMethodId = filters.paymentMethodId;
  if (filters.minPrice || filters.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price.gte = filters.minPrice;
    if (filters.maxPrice) where.price.lte = filters.maxPrice;
  }

  return where;
}

async function validateRelations(userId, data) {
  if (data.categoryId) {
    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        OR: [{ isDefault: true }, { userId }],
      },
      select: { id: true },
    });

    if (!category) {
      throw createHttpError(400, 'Category is not available');
    }
  }

  if (data.paymentMethodId) {
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: { id: data.paymentMethodId, userId },
      select: { id: true },
    });

    if (!paymentMethod) {
      throw createHttpError(400, 'Payment method is not available');
    }
  }
}

function normalizeSubscriptionUpdate(data) {
  const update = { ...data };

  if (Object.hasOwn(update, 'categoryId')) {
    update.categoryId = update.categoryId ?? null;
  }

  if (Object.hasOwn(update, 'paymentMethodId')) {
    update.paymentMethodId = update.paymentMethodId ?? null;
  }

  if (update.status === 'cancelled' && !update.cancelledAt) {
    update.cancelledAt = new Date();
  }

  if (update.status === 'active') {
    update.cancelledAt = null;
  }

  return update;
}
