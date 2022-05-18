import "./listeners.js";
import { createPage } from "./page.js";
import { info } from "./util/logging.js";
import { sessionNonce } from "./util/nonce.js";
import { setQuery } from './util/query.js';
import { onPageRender } from './listeners.js';

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

export function navigate(url, push = true) {
  info("router", "navigate:", url);

  (push ? pushURL : setURL)(url);
  createPage(url, false);
  setQuery(new URLSearchParams(url));
  onPageRender();
}

export function goUp() {
  info("router", "going up in tree", location.pathname);

  const href = location.pathname;

  if (/^\/(?:app|articles\/\w+)?\/?/g.test(href)) {
    navigate("/");
  } else {
    navigate("/app/?error=Unexpected tree traversal");
  }
}
