import { handleError } from "../listeners.js";

export function get(url, options, reject) {
  return new Promise((resolve, reject) => {
    fetch(url, options).then((res) => {
      if (res.ok) {
        resolve(res.json());
      } else {
        reject ||
          handleError(
            new Error(`${res.status} ${res.statusText} (GET ${url})`)
          );
        reject(new Error());
      }
    });
  });
}
