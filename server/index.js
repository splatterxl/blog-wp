import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import crypto from 'node:crypto';
import path from 'node:path';
import pointOfView from 'point-of-view';
import router from './router/index.js';
import { fileURLToPath } from 'node:url';

const server = fastify({
  logger: false,
  caseSensitive: true,
  genReqId: (req) => {
    return crypto.randomUUID();
  },
  ignoreTrailingSlash: false,
});

server.register(pointOfView, {
  engine: {
    pug: await import('pug'),
  },
  production: process.env.NODE_ENV === "production",
});
server.register(fastifyStatic, {
  root: path.resolve("./client/assets"),
  prefix: "/assets"
});
server.register(router);

server.listen('8080', "::", (err, addr) => {
  if (err) {
    throw err;
  } else {
    console.log(`:: server listening on ${addr}`);
  }
});