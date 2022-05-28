import { get } from './http.js';
import { sessionNonce } from './nonce.js';

export const session = {
  nonce: sessionNonce,
  list: [],
  page: "home",
};

export async function updateList() {
  if (session.list.length) {
    return session.list;
  } else {
    return (session.list = await get('/api/articles').catch(() => []));
  }
}

export function getPage() {
  return session.page;
}
