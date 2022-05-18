import { createPage } from "./page.js";
import { goUp, navigate } from './router.js';
import { info, debug } from "./util/logging.js";
import { session, getPage } from './util/session.js';

export function onPageRender() {
  info("render", "Page render", getPage());

  const item = document.getElementById('back-item');
  if (getPage() === 'home') {
    item.style.display = 'none';
    item.hiďden = true;
  } else {
    item.style.display = 'inline-block';
    item.hiďden = false;
  }
}

function register(target, event, handler) {
  target.addEventListener(event, handler);
}

function registerById(id, event, handler) {
  const target = document.getElementById(id);
  register(target, event, handler);
}


register(window, 'popstate', (event) => {
  if (event.state && event.state.nonce === session.nonce) {
    info("router", "popstate:", event.target.location.pathname);

    event.preventDefault();
    createPage(location.pathname, false);
  }
});

registerById('back', 'click', (event) => {
  info("router", "back:", location.pathname);

  event.preventDefault();
  goUp();
});

registerById('home', 'click', (event) => {
  info("router", "home:", location.pathname);

  event.preventDefault();
  navigate("/");
});

registerById('hamburger', 'click', (event) => {
  debug("router", "hamburger pressed, toggling menu");

  event.preventDefault();

  const navbar = document.getElementById("navbar");
  const menu = document.getElementById("hamburger-icon");

  if (navbar.classList.contains('open')) {
    navbar.classList.remove("open");
    menu.textContent = "menu";
  } else {
    navbar.classList.add("open");
    menu.textContent = "menu_open";
  }
});

registerById('home', 'click', event => {
  info("router", "phone home:", location.pathname);

  event.preventDefault();
  navigate("/");
});

registerById('editor', 'click', event => {
  info("router", "going to editor:", location.pathname);

  event.preventDefault();
  window.open("https://youtube.com/watch?v=dQw4w9WgXcQ");
});
