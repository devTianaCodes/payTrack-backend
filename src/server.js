import app from './app.js';
import { env } from './config/env.js';
import { scheduleReminderJob } from './modules/reminders/reminderJob.js';
import { scheduleArchiveCleanupJob } from './modules/subscriptions/archiveCleanupJob.js';

app.listen(env.port, () => {
  console.log(`PayTrack API listening on http://localhost:${env.port}`);
});

if (env.nodeEnv !== 'test') {
  scheduleArchiveCleanupJob();
  scheduleReminderJob();
}
