import api, { renderApp } from './api.js';
import fs from 'node:fs/promises';

const notFoundPage = await fs.readFile('./client/app/404.html', 'utf8');

/**
 * @param {ReturnType<import('fastify').default>} fastify 
 */
export default function router(fastify, options, done) {
  fastify
    .addHook('onRequest', (req, res, done) => {
      res.render = function () {
        renderApp(res);
      };
      console.debug(`${req.id} - ${req.method} ${req.url} - ${req.headers['user-agent']} - ${req.ip}`);
      done();
    })
    .addHook('onSend', (req, res, payload, done) => {
      res.header('X-Req-Id', req.id);

      done();
    })
    .addHook('onResponse', (req, res, done) => {
      console.debug(`${req.id} - ${req.method} ${req.url} -> ${res.statusCode}`);
      done();
    })
    .addHook('onError', (req, res, error, done) => {
      console.error(`${req.id} - ${req.method} ${req.url} -> ${error.message}`);
      done();
    });

  fastify.setNotFoundHandler((req, res) => {
    res.code(404);
    res.header('Content-Type', 'text/html; charset=utf-8');
    res.send(notFoundPage);
  });

  function redirect(a, b) {
    fastify.get(a, (_, res) => {
      res.code(302).header('Location', b).send("Found. Redirecting to " + b);
    });
  }
  function app(path) {
    fastify.get(path, (req, res) => {
      res.render();
    });
  }

  redirect('/', '/articles/index');
  redirect('/articles', '/articles/index');
  redirect('/articles/', '/articles/index');
  redirect('/articles/home', '/articles/index');
  app('/articles/index');
  app('/articles/:slug');
  app('/app');
  app('/app/');

  fastify.register(api, {
    prefix: '/api',
  });

  done();
}