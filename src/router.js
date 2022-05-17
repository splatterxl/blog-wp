import "./listeners.js";
import { createPage } from "./page.js";
import { info } from "./util/logging.js";
import { sessionNonce } from "./util/nonce.js";
import { setQuery } from './util/query.js';

export function setURL(url) {
  window.history.replaceState(
    {
      nonce: sessionNonce,
    },
    "",
    url
  );
}

export function pushURL(url) {
  window.history.pushState(
    {
      nonce: sessionNonce,
    },
    "",
    url
  );
}

export function navigate(url) {
  info("router", "navigate:", url);

  pushURL(url);
  createPage(url);
  setQuery(new URLSearchParams(url));
}

export function goUp() {
  info("router", "going up in tree", location.pathname);

  const href = location.pathname;

  if (/^\/(?:app|articles\/\w+)?\/?/g) {
    navigate("/");
  } else {
    navigate("/app/?error=Unexpected tree traversal");
  }
}