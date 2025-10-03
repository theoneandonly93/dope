// Generic no-op shim for Injective-related packages not required in this build.
export const MsgExecuteContractCompat = class { constructor(){ /* noop */ } };
export default { MsgExecuteContractCompat };
export const noop = () => {};
