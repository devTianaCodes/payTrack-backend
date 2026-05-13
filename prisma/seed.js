import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultCategories = [
  { name: 'Entertainment', translationKey: 'category.entertainment', color: '#FF6B5F' },
  { name: 'Productivity', translationKey: 'category.productivity', color: '#2EE59D' },
  { name: 'Fitness', translationKey: 'category.fitness', color: '#38BDF8' },
  { name: 'Education', translationKey: 'category.education', color: '#F59E0B' },
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
