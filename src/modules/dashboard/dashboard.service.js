import { prisma } from '../../prisma/client.js';

const upcomingRenewalLimit = 7;

export async function getDashboardSummary(userId) {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId,
      status: 'active',
    },
    include: {
      category: true,
      paymentMethod: true,
    },
    orderBy: [{ nextRenewalDate: 'asc' }, { name: 'asc' }],
  });

  const monthlySpend = subscriptions.reduce(
    (total, subscription) => total + getMonthlyAmount(subscription),
    0,
  );

  const categoryMap = new Map();

  for (const subscription of subscriptions) {
    const categoryName = subscription.category?.name ?? 'Uncategorized';
    const existingCategory = categoryMap.get(categoryName) ?? {
      name: categoryName,
      value: 0,
      color: subscription.category?.color ?? '#101828',
      subscriptions: [],
    };

    const monthlyAmount = getMonthlyAmount(subscription);

    existingCategory.value += monthlyAmount;
    existingCategory.subscriptions.push({
      id: subscription.id,
      name: subscription.name,
      value: roundMoney(monthlyAmount),
    });
    categoryMap.set(categoryName, existingCategory);
  }

  return {
    currency: subscriptions[0]?.currency ?? 'USD',
    monthlySpend: roundMoney(monthlySpend),
    yearlyProjection: roundMoney(monthlySpend * 12),
    activeSubscriptionCount: subscriptions.length,
    upcomingRenewals: subscriptions.slice(0, upcomingRenewalLimit),
    categoryMix: Array.from(categoryMap.values())
      .map((category) => ({
        ...category,
        subscriptions: category.subscriptions.sort((left, right) => right.value - left.value),
        value: roundMoney(category.value),
      }))
      .sort((left, right) => right.value - left.value),
  };
}

function getMonthlyAmount(subscription) {
  const price = Number(subscription.price);

  if (subscription.billingFrequency === 'weekly') return (price * 52) / 12;
  if (subscription.billingFrequency === 'quarterly') return price / 3;
  if (subscription.billingFrequency === 'yearly') return price / 12;

  return price;
}

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}
