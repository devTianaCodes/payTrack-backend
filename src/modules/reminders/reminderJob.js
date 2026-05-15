import cron from 'node-cron';
import { prisma } from '../../prisma/client.js';
import { sendRenewalReminderEmail } from './reminders.mailer.js';

const reminderWindows = [
  { days: 7, kind: 'seven_days' },
  { days: 1, kind: 'one_day' },
];

export async function runReminderJob(now = new Date()) {
  let processedCount = 0;
  let skippedCount = 0;

  for (const reminderWindow of reminderWindows) {
    const renewalDate = addDaysAtStartOfDay(now, reminderWindow.days);
    const nextDay = addDaysAtStartOfDay(now, reminderWindow.days + 1);

    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        nextRenewalDate: {
          gte: renewalDate,
          lt: nextDay,
        },
      },
      include: {
        reminderPreferences: true,
        user: true,
      },
    });

    for (const subscription of subscriptions) {
      if (!isReminderEnabled(subscription, reminderWindow.kind)) {
        skippedCount += 1;
        continue;
      }

      const existingLog = await prisma.reminderLog.findUnique({
        where: {
          subscriptionId_kind_renewalDate: {
            subscriptionId: subscription.id,
            kind: reminderWindow.kind,
            renewalDate: subscription.nextRenewalDate,
          },
        },
        select: { id: true },
      });

      if (existingLog) continue;

      const result = await sendRenewalReminderEmail({
        kind: reminderWindow.kind,
        recipient: subscription.user,
        subscription,
      });

      if (result.skipped) {
        skippedCount += 1;
        continue;
      }

      await prisma.reminderLog.create({
        data: {
          userId: subscription.userId,
          subscriptionId: subscription.id,
          kind: reminderWindow.kind,
          renewalDate: subscription.nextRenewalDate,
          email: subscription.user.email,
        },
      });

      processedCount += 1;
    }
  }

  return { processedCount, skippedCount };
}

export function scheduleReminderJob() {
  return cron.schedule('0 8 * * *', async () => {
    try {
      const result = await runReminderJob();
      if (result.processedCount > 0) {
        console.log(`Reminder job processed ${result.processedCount} reminder(s).`);
      }
      if (result.skippedCount > 0) {
        console.log(`Reminder job skipped ${result.skippedCount} reminder(s).`);
      }
    } catch (error) {
      console.error('Reminder job failed', error);
    }
  });
}

function addDaysAtStartOfDay(date, days) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() + days);
  return result;
}

function isReminderEnabled(subscription, kind) {
  if (subscription.reminderPreferences.length === 0) {
    return true;
  }

  return subscription.reminderPreferences.some(
    (preference) => preference.kind === kind && preference.isEnabled,
  );
}
