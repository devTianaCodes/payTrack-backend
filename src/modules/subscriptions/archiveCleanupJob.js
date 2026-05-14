import cron from 'node-cron';
import { prisma } from '../../prisma/client.js';

const archiveRetentionDays = 365;

export async function cleanupArchivedSubscriptions(now = new Date()) {
  const cutoffDate = new Date(now);
  cutoffDate.setDate(cutoffDate.getDate() - archiveRetentionDays);

  return prisma.subscription.deleteMany({
    where: {
      status: 'archived',
      cancelledAt: {
        lt: cutoffDate,
      },
    },
  });
}

export function scheduleArchiveCleanupJob() {
  return cron.schedule('30 3 * * *', async () => {
    try {
      const result = await cleanupArchivedSubscriptions();
      if (result.count > 0) {
        console.log(`Archive cleanup removed ${result.count} expired subscription(s).`);
      }
    } catch (error) {
      console.error('Archive cleanup failed', error);
    }
  });
}
