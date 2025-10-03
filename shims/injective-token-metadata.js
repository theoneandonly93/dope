// Shim for @injectivelabs/token-metadata providing TokenInfo placeholder
export class TokenInfo { constructor(symbol, address){ this.symbol = symbol; this.address = address; this.decimals = 9; } }
export const getTokenMeta = () => ({ symbol: 'STUB', address: '0x0', decimals: 9 });
export default { TokenInfo, getTokenMeta };

