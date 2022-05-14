export function setURL(url) {
  window.history.replaceState(null, "", url);
}

export function navigate(url) {
  setURL(url);
  const deconstructed = new URL(url);
  createPage(deconstructed.href, deconstructed.search);
}
