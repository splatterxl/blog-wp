import { sessionNonce } from './nonce.js';

export const session = {
  nonce: sessionNonce,
  list: []
};

export async function updateList() {
  if (session.list.length) {
    return session.list;
  } else {
    return (session.list = await fetch('/api/blog/list').then(res => res.json()));
  }
} 