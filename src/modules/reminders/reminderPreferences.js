export function isReminderEnabled(subscription, kind) {
  const preferences = subscription.reminderPreferences ?? [];

  if (preferences.length === 0) {
    return true;
  }

  return preferences.some((preference) => preference.kind === kind && preference.isEnabled);
}
