import { debug } from "./logging.js";

export const sessionNonce = localStorage.getItem('session_nonce') ??
  crypto.randomUUID?.() ?? `${Date.now()}-${Math.random() * 30}`;
debug("nonce", "sessionNonce:", sessionNonce);

localStorage.setItem('session_nonce', sessionNonce);