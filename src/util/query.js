import { debug } from "./logging.js";

export const query = new URLSearchParams(window.location.search);

debug("query", "query detect:", query);
