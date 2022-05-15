import { createPage } from './page.js';
import { sessionNonce } from './util/nonce.js';

export function setURL(url) {
  window.history.replaceState({
    nonce: sessionNonce
  }, "", url);
}

export function pushURL(url) {
  window.history.pushState({
    nonce: sessionNonce
  }, '', url);
}

export function navigate(url) {
  pushURL(url);
  createPage(url);
}

window.onpopstate = (event) => {
  if (event.state && event.state.nonce === sessionNonce) {
    event.preventDefault();
    createPage(location.pathname);
  }
};