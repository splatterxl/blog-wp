import api, { articles, renderApp } from './api.js';
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
      done();
    })
    .addHook('onSend', (req, res, payload, done) => {
      res.header('X-Req-Id', req.id);

      done();
    })
    .addHook('onResponse', (req, res, done) => {
      console.debug(`${req.id} - ${req.method} ${req.url} -> ${res.statusCode} - ${req.headers['user-agent']} - ${req.ips?.join(', ') ?? req.ip}`);
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

  redirect('/articles/index', '/articles');
  app('/articles');
  app('/app');
  app('/app/');
  app('/');

  redirect('/avatar', '/assets/img/4269174cecd5819881f4f1e0e611bb284f5164d6.png');

  fastify.register(api, {
    prefix: '/api',
  });

  fastify.get('/articles/:slug', (req, res) => {
    if (['bot', 'spider', 'crawl'].some(v => req.headers['user-agent']?.includes(v))) {
      // @ts-ignore
      res.header('Content-Type', 'text/html; charset=utf-8').send(createHtmlPreview(req.params.slug));
      return;
    } else {
      res.render();

    }
  });

  done();
}

function createHtmlPreview(slug) {
  const article = articles.get(slug);

  if (!article) {
    return `<h1>404: Not Found</h1>
<p>The requested resource was not found.</p>
<p>
  <a href="/">Go to home</a>
</p>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>${article.meta.title}</title>
  <link rel="stylesheet" href="/assets/globals.css">
  <meta name="description" content="${article.meta.description}">
  <meta name="author" content="${article.meta.author}">
  <meta name="keywords" content="${article.meta.keywords}">
  <meta name="robots" content="index, follow">
  <meta name="referrer" content="origin">
  <meta name="theme-color" content="#ffffff">
  <!-- og -->
  <meta property="og:title" content="${article.meta.title}">
  <meta property="og:description" content="${article.meta.description}">
  <meta property="og:url" content="/articles/${slug}">
  <meta property="og:thumbnail" content="/avatar">
  <meta property="og:image" content="/avatar">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="${article.meta.author ? `${article.meta.author} on ` : ""}Splatterxl's Blog">
  <meta property="og:locale" content="en_GB">
  <!-- twitter -->
  <meta name="twitter:card" content="summary_small_image">
  <meta name="twitter:creator" content="@wontfixbug">
  <meta name="twitter:site" content="@wontfixbug">
  <meta name="twitter:title" content="${article.meta.title}">
  <meta name="twitter:description" content="${article.meta.description}">
  <meta name="twitter:image" content="/avatar">
  <meta name="twitter:image:alt" content="Splatterxl's Blog">
  <meta name="twitter:url" content="/articles/${slug}">
</head>
<body>
  <h1>${article.meta.title}</h1>
  <p>${article.meta.description}</p>
</body>
</html>`;
};
