export function createSlugFromTitle(title) {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "");
}
