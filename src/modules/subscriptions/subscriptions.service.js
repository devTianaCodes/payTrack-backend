import { prisma } from '../../prisma/client.js';
import { createHttpError } from '../../utils/httpError.js';

const subscriptionInclude = {
  category: true,
  paymentMethod: true,
  payments: {
    orderBy: { paidAt: 'desc' },
    take: 3,
  },
  reminderPreferences: {
    orderBy: { kind: 'asc' },
  },
};
const reminderKinds = ['seven_days', 'one_day'];

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
      reminderPreferences: {
        create: getReminderPreferenceRows(reminderKinds),
      },
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

export async function archiveSubscription(userId, subscriptionId) {
  await getSubscription(userId, subscriptionId);

  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: 'archived',
      cancelledAt: new Date(),
    },
    include: subscriptionInclude,
  });
}

export async function restoreSubscription(userId, subscriptionId) {
  await getSubscription(userId, subscriptionId);

  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: 'active',
      cancelledAt: null,
    },
    include: subscriptionInclude,
  });
}

export async function listSubscriptionPayments(userId, subscriptionId) {
  await getSubscription(userId, subscriptionId);

  return prisma.subscriptionPayment.findMany({
    where: { userId, subscriptionId },
    include: { paymentMethod: true },
    orderBy: { paidAt: 'desc' },
    take: 20,
  });
}

export async function recordSubscriptionPayment(user, subscriptionId, data) {
  const subscription = await getSubscription(user.id, subscriptionId);

  if (subscription.status !== 'active') {
    throw createHttpError(400, 'Only active subscriptions can be marked as paid');
  }

  await validateRelations(user.id, { paymentMethodId: data.paymentMethodId });

  const paymentDetails = {
    userId: user.id,
    subscriptionId,
    paymentMethodId: data.paymentMethodId ?? subscription.paymentMethodId,
    amount: data.amount ?? subscription.price,
    currency: data.currency ?? subscription.currency,
    paidAt: data.paidAt ?? new Date(),
    notes: data.notes ?? null,
  };

  return prisma.$transaction(async (tx) => {
    const payment = await tx.subscriptionPayment.create({
      data: paymentDetails,
      include: { paymentMethod: true },
    });

    const updatedSubscription = await tx.subscription.update({
      where: { id: subscriptionId },
      data: { nextRenewalDate: getNextRenewalDate(subscription) },
      include: subscriptionInclude,
    });

    return { payment, subscription: updatedSubscription };
  });
}

export async function updateReminderPreferences(userId, subscriptionId, data) {
  await getSubscription(userId, subscriptionId);

  return prisma.$transaction(async (tx) => {
    await tx.subscriptionReminderPreference.deleteMany({
      where: { subscriptionId },
    });

    await tx.subscriptionReminderPreference.createMany({
      data: getReminderPreferenceRows(data.enabledKinds).map((preference) => ({
        ...preference,
        subscriptionId,
      })),
    });

    return tx.subscription.findUniqueOrThrow({
      where: { id: subscriptionId },
      include: subscriptionInclude,
    });
  });
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

  if ((update.status === 'cancelled' || update.status === 'archived') && !update.cancelledAt) {
    update.cancelledAt = new Date();
  }

  if (update.status === 'active') {
    update.cancelledAt = null;
  }

  return update;
}

function getNextRenewalDate(subscription) {
  const nextDate = new Date(subscription.nextRenewalDate);

  if (subscription.billingFrequency === 'weekly') {
    nextDate.setDate(nextDate.getDate() + 7);
    return nextDate;
  }

  if (subscription.billingFrequency === 'quarterly') {
    nextDate.setMonth(nextDate.getMonth() + 3);
    return nextDate;
  }

  if (subscription.billingFrequency === 'yearly') {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
    return nextDate;
  }

  nextDate.setMonth(nextDate.getMonth() + 1);
  return nextDate;
}

function getReminderPreferenceRows(enabledKinds) {
  return reminderKinds.map((kind) => ({
    kind,
    isEnabled: enabledKinds.includes(kind),
  }));
}
