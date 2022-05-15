import { debug } from './logging.js';

export const sessionNonce = crypto.randomUUID();
debug('nonce', 'sessionNonce:', sessionNonce);
