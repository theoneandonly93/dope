import { describe, it, expect, vi } from 'vitest';
import { getTokenDecimals, clearTokenMetadataCache } from '../lib/tokenMetadataCache';

// Mock wallet connection
vi.mock('../lib/wallet', () => ({
  getConnection: () => ({
    getParsedAccountInfo: async () => ({ value: { data: { parsed: { info: { decimals: 7 } } } } })
  })
}));

describe('tokenMetadataCache', () => {
  it('returns well-known decimals', async () => {
    const dec = await getTokenDecimals('So11111111111111111111111111111111111111112');
    expect(dec).toBe(9);
  });
  it('caches fetched decimals', async () => {
    clearTokenMetadataCache();
    const first = await getTokenDecimals('SomeMint1111111111111111111111111111111111111');
    const second = await getTokenDecimals('SomeMint1111111111111111111111111111111111111');
    expect(first).toBe(7);
    expect(second).toBe(7);
  });
});
