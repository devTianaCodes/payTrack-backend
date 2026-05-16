import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createCorsOriginHandler, isAllowedOrigin } from '../src/config/cors.js';

describe('cors configuration', () => {
  const allowedOrigins = ['http://localhost:5317', 'https://paytrack.example.com'];

  it('allows requests without an origin header', () => {
    assert.equal(isAllowedOrigin(undefined, allowedOrigins), true);
  });

  it('allows configured frontend origins', () => {
    assert.equal(isAllowedOrigin('https://paytrack.example.com', allowedOrigins), true);
  });

  it('rejects unconfigured origins', () => {
    assert.equal(isAllowedOrigin('https://other.example.com', allowedOrigins), false);
  });

  it('passes allowed origins through the Express CORS callback', () => {
    const handler = createCorsOriginHandler(allowedOrigins);

    handler('http://localhost:5317', (error, isAllowed) => {
      assert.equal(error, null);
      assert.equal(isAllowed, true);
    });
  });
});
