import "./listeners.js";
import { createPage } from "./page.js";
import { info } from "./util/logging.js";
import { sessionNonce } from "./util/nonce.js";

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
}
