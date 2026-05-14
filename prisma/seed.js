import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const demoPassword = 'PayTrack123!';
const demoEmail = 'demo@paytrack.local';

const defaultCategories = [
  { name: 'Entertainment', translationKey: 'category.entertainment', color: '#FF6B5F' },
  { name: 'Productivity', translationKey: 'category.productivity', color: '#2EE59D' },
  { name: 'Fitness', translationKey: 'category.fitness', color: '#38BDF8' },
  { name: 'Education', translationKey: 'category.education', color: '#F59E0B' },
  { name: 'Programming', translationKey: 'category.programming', color: '#38BDF8' },
  { name: 'Utilities', translationKey: 'category.utilities', color: '#101828' },
  { name: 'Finance', translationKey: 'category.finance', color: '#6366F1' },
];

async function main() {
  for (const category of defaultCategories) {
    await prisma.category.upsert({
      where: {
        id: `default-${category.name.toLowerCase()}`,
      },
      update: category,
      create: {
        id: `default-${category.name.toLowerCase()}`,
        ...category,
        isDefault: true,
      },
    });
  }

  const passwordHash = await bcrypt.hash(demoPassword, 12);
  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {
      passwordHash,
      name: 'PayTrack Demo',
      defaultCurrency: 'USD',
      locale: 'en',
      timezone: 'Europe/Rome',
    },
    create: {
      email: demoEmail,
      passwordHash,
      name: 'PayTrack Demo',
      defaultCurrency: 'USD',
      locale: 'en',
      timezone: 'Europe/Rome',
    },
  });

  const entertainment = await prisma.category.findUniqueOrThrow({
    where: { id: 'default-entertainment' },
  });
  const productivity = await prisma.category.findUniqueOrThrow({
    where: { id: 'default-productivity' },
  });
  const programming = await prisma.category.findUniqueOrThrow({
    where: { id: 'default-programming' },
  });
  const education = await prisma.category.findUniqueOrThrow({
    where: { id: 'default-education' },
  });
  const utilities = await prisma.category.findUniqueOrThrow({
    where: { id: 'default-utilities' },
  });

  const card = await prisma.paymentMethod.upsert({
    where: { id: 'demo-visa-card' },
    update: {
      userId: user.id,
      name: 'Visa ending 4242',
      type: 'card',
      lastFour: '4242',
      color: '#101828',
    },
    create: {
      id: 'demo-visa-card',
      userId: user.id,
      name: 'Visa ending 4242',
      type: 'card',
      lastFour: '4242',
      color: '#101828',
    },
  });

  const demoSubscriptions = [
    {
      id: 'demo-netflix',
      name: 'Netflix',
      price: 15.99,
      categoryId: entertainment.id,
      nextRenewalDate: new Date('2026-05-18T00:00:00.000Z'),
    },
    {
      id: 'demo-spotify',
      name: 'Spotify',
      price: 10.99,
      categoryId: entertainment.id,
      nextRenewalDate: new Date('2026-06-02T00:00:00.000Z'),
    },
    {
      id: 'demo-waking-up',
      name: 'Waking Up',
      price: 14.99,
      categoryId: education.id,
      nextRenewalDate: new Date('2026-06-05T00:00:00.000Z'),
    },
    {
      id: 'demo-figma',
      name: 'Figma',
      price: 12,
      categoryId: productivity.id,
      nextRenewalDate: new Date('2026-05-21T00:00:00.000Z'),
    },
    {
      id: 'demo-icloud',
      name: 'iCloud',
      price: 2.99,
      categoryId: utilities.id,
      nextRenewalDate: new Date('2026-05-25T00:00:00.000Z'),
    },
    {
      id: 'demo-codex',
      name: 'Codex',
      price: 20,
      categoryId: programming.id,
      nextRenewalDate: new Date('2026-06-12T00:00:00.000Z'),
    },
    {
      id: 'demo-claude',
      name: 'Claude',
      price: 20,
      categoryId: programming.id,
      nextRenewalDate: new Date('2026-06-14T00:00:00.000Z'),
    },
  ];

  for (const subscription of demoSubscriptions) {
    const { id, ...subscriptionData } = subscription;

    await prisma.subscription.upsert({
      where: { id },
      update: {
        userId: user.id,
        paymentMethodId: card.id,
        currency: 'USD',
        billingFrequency: 'monthly',
        status: 'active',
        ...subscriptionData,
      },
      create: {
        id,
        userId: user.id,
        paymentMethodId: card.id,
        currency: 'USD',
        billingFrequency: 'monthly',
        status: 'active',
        ...subscriptionData,
      },
    });
  }

  console.log(`Seeded demo user: ${demoEmail} / ${demoPassword}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
