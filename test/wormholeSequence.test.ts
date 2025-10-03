import { describe, it, expect } from 'vitest';
import { parseSequenceFromLogsTx } from '../lib/wormhole';

// Provide a minimal mock object resembling a Solana transaction response with logs

describe('parseSequenceFromLogsTx', () => {
  it('returns undefined on invalid logs', () => {
    const seq = parseSequenceFromLogsTx({});
    expect(seq).toBeUndefined();
  });
});
