// Lightweight token metadata registry with in-memory caching
// Provides symbol/name/logo by SPL mint, with a few well-known built-ins

export type TokenInfo = {
  mint: string;
  symbol: string;
  name: string;
  logo?: string;
};

// Built-in minimal registry for common tokens used in app
const BUILT_INS: Record<string, TokenInfo> = {
  // wSOL
  'So11111111111111111111111111111111111111112': {
    mint: 'So11111111111111111111111111111111111111112',
    symbol: 'SOL',
    name: 'Solana',
    logo: '/sol.png',
  },
  // USDC (mainnet)
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    symbol: 'USDC',
    name: 'USD Coin',
    logo: '/logo-192.png',
  },
  // DOPE
  'FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33': {
    mint: 'FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33',
    symbol: 'DOPE',
    name: 'Dope Token',
    logo: '/dopelganga.svg',
  },
  // wETH
  '7vfCXTUXx5WJVxrzS2KHGfJo3AmoQ39kuixZ7Z6w7R8': {
    mint: '7vfCXTUXx5WJVxrzS2KHGfJo3AmoQ39kuixZ7Z6w7R8',
    symbol: 'ETH',
    name: 'Ethereum (Wormhole)',
    logo: '/eth.png',
  },
  // wBTC
  '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E': {
    mint: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
    symbol: 'BTC',
    name: 'Bitcoin (Wormhole)',
    logo: '/btc.png',
  },
};

// Optional: include project tokenlist (if present) at build-time
// This file exists at repo root and may include aliases and logos
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import projectTokenList from '../tokenlist.json';

const cache = new Map<string, TokenInfo>();
let hydratedFromProject = false;

function hydrateFromProjectList() {
  if (hydratedFromProject) return;
  hydratedFromProject = true;
  try {
    const list: any[] = Array.isArray(projectTokenList as any) ? (projectTokenList as any) : [];
    for (const t of list) {
      if (!(t && t.mint)) continue;
      const info: TokenInfo = {
        mint: t.mint,
        symbol: t.symbol || t.ticker || 'TOK',
        name: t.name || t.symbol || 'Token',
        logo: t.logo || t.logoURI || '/logo-192.png',
      };
      cache.set(t.mint, info);
    }
  } catch {
    // ignore if not present or invalid
  }
}

export function normalizeMint(m: string): string {
  const s = (m || '').trim().toLowerCase();
  if (s === 'sol' || s === 'wsol') return 'So11111111111111111111111111111111111111112';
  if (s === 'btc') return '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E';
  if (s === 'eth') return '7vfCXTUXx5WJVxrzS2KHGfJo3AmoQ39kuixZ7Z6w7R8';
  return m;
}

export async function getTokenInfo(mint: string): Promise<TokenInfo | null> {
  const mm = normalizeMint(mint);
  // Built-ins first
  if (BUILT_INS[mm]) return BUILT_INS[mm];

  // Project list (static import) and cache
  hydrateFromProjectList();
  if (cache.has(mm)) return cache.get(mm)!;

  // Attempt to fetch public tokenlist at runtime (optional)
  // This is non-blocking and best-effort
  try {
    const res = await fetch('/tokenlist.json', { cache: 'force-cache' });
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list)) {
        for (const t of list) {
          if (!t?.mint) continue;
          const info: TokenInfo = {
            mint: t.mint,
            symbol: t.symbol || t.ticker || 'TOK',
            name: t.name || t.symbol || 'Token',
            logo: t.logo || t.logoURI || '/logo-192.png',
          };
          if (!cache.has(t.mint)) cache.set(t.mint, info);
        }
      }
    }
  } catch {
    // ignore network errors
  }

  return cache.get(mm) || null;
}

export async function searchTokens(query: string, limit = 8): Promise<TokenInfo[]> {
  const q = (query || "").trim().toLowerCase();
  if (!q) return [];
  hydrateFromProjectList();
  const results: TokenInfo[] = [];
  const seen = new Set<string>();

  function push(t: TokenInfo) {
    if (!seen.has(t.mint)) { results.push(t); seen.add(t.mint); }
  }

  // Search built-ins
  for (const k of Object.keys(BUILT_INS)) {
    const t = BUILT_INS[k];
    const hay = `${t.symbol} ${t.name} ${t.mint}`.toLowerCase();
    if (hay.includes(q)) push(t);
  }
  // Search cache/project list
  for (const [_m, t] of Array.from(cache.entries())) {
    const hay = `${t.symbol} ${t.name} ${t.mint}`.toLowerCase();
    if (hay.includes(q)) push(t);
    if (results.length >= limit) break;
  }
  // If user typed common aliases like 'sol', normalize mapping
  if (results.length === 0) {
    const norm = normalizeMint(query);
    if (BUILT_INS[norm]) push(BUILT_INS[norm]);
  }
  return results.slice(0, limit);
}
