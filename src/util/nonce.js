import { debug } from "./logging.js";

export const sessionNonce =
  crypto.randomUUID?.() ?? `${Date.now()}-${Math.random() * 30}`;
debug("nonce", "sessionNonce:", sessionNonce);
