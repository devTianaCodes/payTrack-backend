import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isReminderEnabled } from '../src/modules/reminders/reminderPreferences.js';

describe('reminder preferences', () => {
  it('keeps both default reminder windows enabled when no preferences exist', () => {
    const subscription = { reminderPreferences: [] };

    assert.equal(isReminderEnabled(subscription, 'seven_days'), true);
    assert.equal(isReminderEnabled(subscription, 'one_day'), true);
  });

  it('honors disabled reminder windows', () => {
    const subscription = {
      reminderPreferences: [
        { kind: 'seven_days', isEnabled: true },
        { kind: 'one_day', isEnabled: false },
      ],
    };

    assert.equal(isReminderEnabled(subscription, 'seven_days'), true);
    assert.equal(isReminderEnabled(subscription, 'one_day'), false);
  });

  it('treats missing preference rows as disabled once preferences are customized', () => {
    const subscription = {
      reminderPreferences: [{ kind: 'seven_days', isEnabled: true }],
    };

    assert.equal(isReminderEnabled(subscription, 'one_day'), false);
  });
});
