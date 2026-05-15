import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createSubscriptionSchema,
  updateReminderPreferencesSchema,
} from '../src/modules/subscriptions/subscriptions.schemas.js';

describe('subscription schemas', () => {
  it('normalizes subscription currency and renewal date', () => {
    const result = createSubscriptionSchema.parse({
      name: 'Netflix',
      price: '15.99',
      currency: 'usd',
      billingFrequency: 'monthly',
      nextRenewalDate: '2026-06-18',
    });

    assert.equal(result.currency, 'USD');
    assert.equal(result.price, 15.99);
    assert.equal(result.nextRenewalDate instanceof Date, true);
  });

  it('accepts reminder preference windows used by the reminder job', () => {
    const result = updateReminderPreferencesSchema.parse({
      enabledKinds: ['seven_days', 'one_day'],
    });

    assert.deepEqual(result.enabledKinds, ['seven_days', 'one_day']);
  });

  it('rejects unknown reminder windows', () => {
    assert.throws(
      () =>
        updateReminderPreferencesSchema.parse({
          enabledKinds: ['three_days'],
        }),
      /Invalid enum value/,
    );
  });
});
