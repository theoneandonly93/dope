// Shim for @injectivelabs/ts-types providing minimal enum placeholders to satisfy wormhole-sdk's optional Injective imports.
export const EthereumChainId = { MAINNET: 1, TESTNET: 5 };
export const ChainId = { Mainnet: 'mainnet', Testnet: 'testnet' };
export const StreamOperation = { Insert: 'insert', Update: 'update', Delete: 'delete' };
export default { EthereumChainId, ChainId, StreamOperation };

