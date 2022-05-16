const { createPage } = require('./page.js');
const { info, debug } = require('./util/logging.js');
const { sessionNonce } = require('./util/nonce.js');

window.onpopstate = (event) => {
  if (event.state && event.state.nonce === sessionNonce) {
    info('router', 'popstate:', event.target.location.pathname);

    event.preventDefault();
    createPage(location.pathname);
  }
};

document.getElementById('back').onclick = (event) => {
  info('router', 'back:', location.pathname);

  event.preventDefault();
  history.back();
};

document.getElementById('hamburger').onclick = (event) => {
  debug('router', 'hamburger pressed, toggling menu');

  event.preventDefault();

  const inner = document.getElementById('nav-inner');
  const menu = document.getElementById('hamburger-icon');

  if (inner.style.display === 'block') {
    inner.style.display = 'none';
    menu.textContent = 'menu';
  } else {
    inner.style.display = 'block';
    menu.textContent = 'menu_open';
  }
};