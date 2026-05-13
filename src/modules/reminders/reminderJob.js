import cron from 'node-cron';

export function scheduleReminderJob() {
  return cron.schedule('0 8 * * *', () => {
    console.log('Reminder job scaffolded. Implementation arrives in the reminders milestone.');
  });
}
