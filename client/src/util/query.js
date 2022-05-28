import { debug } from "./logging.js";

export let query = new URLSearchParams(window.location.search);
export function setQuery(newQuery) {
  query = newQuery;
}

debug("query", "query detect:", query);
