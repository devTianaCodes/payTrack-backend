import { prisma } from '../../prisma/client.js';
import { createHttpError } from '../../utils/httpError.js';

export function listCategories(userId) {
  return prisma.category.findMany({
    where: {
      OR: [{ isDefault: true }, { userId }],
    },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  });
}

export function createCategory(userId, data) {
  return prisma.category.create({
    data: {
      userId,
      name: data.name,
      color: data.color ?? '#2EE59D',
    },
  });
}

export async function updateCategory(userId, categoryId, data) {
  await ensureCustomCategoryOwner(userId, categoryId);

  return prisma.category.update({
    where: { id: categoryId },
    data,
  });
}

export async function deleteCategory(userId, categoryId) {
  await ensureCustomCategoryOwner(userId, categoryId);
  await prisma.category.delete({ where: { id: categoryId } });
}

async function ensureCustomCategoryOwner(userId, categoryId) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true, userId: true, isDefault: true },
  });

  if (!category || category.userId !== userId) {
    throw createHttpError(404, 'Category not found');
  }

  if (category.isDefault) {
    throw createHttpError(403, 'Default categories cannot be modified');
  }
}
