import { debug } from "./logging.js";

export function createElement(tagName, attrs, children) {
  const elem = document.createElement(tagName);
  if (attrs) {
    attrs.class && (elem.className = attrs.class);
    attrs.id && (elem.id = attrs.id);
    attrs.text && (elem.textContent = attrs.text);
    attrs.href && elem.setAttribute("href", attrs.href);
    attrs.onClick && elem.addEventListener("click", attrs.onClick);
    Object.assign(elem, attrs);
  }
  if (children) {
    for (const child of children) {
      elem.appendChild(child);
    }
  }
  return elem;
}

export function getContainer() {
  let qs = document.getElementById("container");

  if (!qs) {
    document.body.appendChild(createElement("div", { id: "container" }));
    qs = document.getElementById("container");
  }

  return qs;
}

export function updateDOM(heading, main) {
  const container = getContainer();
  while (container.firstElementChild) {
    container.removeChild(container.firstElementChild);
  }

  container.appendChild(heading);

  if (main) {
    container.appendChild(createElement("hr"));
    container.appendChild(main);
  }
}

export function title(text) {
  debug("dom", "title:", text);

  document.getElementsByTagName("title")[0].textContent = text;
}
