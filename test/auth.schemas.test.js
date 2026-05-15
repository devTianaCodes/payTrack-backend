import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  passwordResetConfirmSchema,
  passwordResetRequestSchema,
  registerSchema,
} from '../src/modules/auth/auth.schemas.js';

describe('auth schemas', () => {
  it('normalizes email and currency on registration', () => {
    const result = registerSchema.parse({
      email: '  DEMO@PAYTRACK.LOCAL ',
      password: 'PayTrack123!',
      defaultCurrency: 'eur',
      locale: 'it',
    });

    assert.equal(result.email, 'demo@paytrack.local');
    assert.equal(result.defaultCurrency, 'EUR');
  });

  it('validates password reset request emails', () => {
    const result = passwordResetRequestSchema.parse({
      email: '  USER@example.com ',
    });

    assert.equal(result.email, 'user@example.com');
  });

  it('rejects short reset tokens', () => {
    assert.throws(
      () =>
        passwordResetConfirmSchema.parse({
          token: 'too-short',
          password: 'PayTrack123!',
        }),
      /String must contain at least 32 character/,
    );
  });
});
