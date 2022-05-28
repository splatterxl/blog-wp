import { handleError } from '../listeners.js';

export function get(url, options) {
  return new Promise((resolve, reject) => {
    fetch(url, options).then(res => {
      if (res.ok) {
        resolve(res.json());
      } else {
        handleError(new Error(`${res.status} ${res.statusText} (GET ${url})`));
        reject(new Error);
      }
    });
  });
}