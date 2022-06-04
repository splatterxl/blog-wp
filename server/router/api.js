import fs from "node:fs";
import crypto from "node:crypto";
import YAML from "yaml";
import { Remarkable } from "remarkable";
import hljs from "highlight.js";

const remarkable = new Remarkable({
  html: true,
  xhtmlOut: true,
  breaks: true,
  typographer: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, {
          language: hljs.getLanguage(lang)?.name?.toLowerCase() ?? lang,
        }).value;
      } catch (err) {
        return `Error: ${err.message}`;
      }
    }

    return "";
  },
});

const app = await fs.promises.readFile("./client/app/index.html", "utf8");
// @ts-ignore
const loadArticles = async () =>
  new Map(
    await fs.promises.readdir("./content").then((articles) =>
      articles.map((article) => {
        const slug = article.replace(".md", ""),
          stat = fs.statSync(`./content/${article}`),
          content = fs.readFileSync(`./content/${article}`, "utf8");

        const matched = content.match(/^---\n([\s\S]*?)\n---/s);

        if (!matched) {
          return [
            slug,
            {
              meta: {
                title: slug,
                date: stat.mtime ?? stat.ctime,
                slug,
                author: null,
              },
              content,
            },
          ];
        }

        const meta = YAML.parse(matched[1]);
        let md = content.replace(matched[0], "");

        return [
          slug,
          {
            meta: {
              title: meta.title || slug,
              date:
                (meta.date && new Date(meta.date)) ?? stat.mtime ?? stat.ctime,
              description: meta.description || "No description provided.",
              slug,
              author: meta.author ?? null,
            },
            content: md,
            parsed: remarkable.render(md),
          },
        ];
      })
    )
  );

export let articles = await loadArticles();

/**
 * @param {ReturnType<import('fastify').default>} fastify
 */
export default function api(fastify, opts, done) {
  const auth = crypto.randomUUID();

  console.log(":: api session id:", auth);

  fastify.setNotFoundHandler((req, res) => {
    res.code(404);
    res.send({
      error: "404: Not Found",
      message: "The requested resource was not found.",
      details: {
        url: req.url,
        id: req.id,
      },
    });
  });

  fastify.get("/articles/:article", (req, res) => {
    // @ts-ignore
    const article = articles.get(req.params.article);

    if (!article) {
      res.callNotFound();
      return;
    }

    res.send(article.meta);
  });

  fastify.get("/articles/:article/content", (req, res) => {
    // @ts-ignore
    const article = articles.get(req.params.article);

    if (!article) {
      res.callNotFound();
      return;
    }

    // @ts-ignore
    if (
      req.query.raw ||
      req.headers["accept"].includes("text/plain") ||
      req.headers["accept"].includes("text/markdown")
    ) {
      res
        .header("content-type", "text/plain; charset=utf-8")
        .send(article.content);
    } else {
      res
        .header("content-type", "text/html; charset=utf-8")
        .send(article.parsed);
    }
  });

  fastify.get("/articles/:article/full", (req, res) => {
    // @ts-ignore
    const article = articles.get(req.params.article);

    if (!article) {
      res.callNotFound();
      return;
    }

    // @ts-ignore
    switch (req.query["content-type"] ?? "plain") {
      case "plain":
        res.send({
          meta: article.meta,
          content: article.content,
        });
        break;
      case "html":
        res.send({
          meta: article.meta,
          content: article.parsed,
        });
        break;
      default:
        res.code(400).send({
          error: "400: Bad Request",
          message: "The requested content type is not supported.",
          details: {
            url: req.url,
            id: req.id,
            // @ts-ignore
            content_type: req.query["content-type"],
          },
        });
    }
  });

  fastify.get("/articles", (req, res) => {
    res.send(Array.from(articles.values()).map((article) => article.meta));
  });

  fastify.get("/reload", async (req, res) => {
    // @ts-ignore
    if (
      process.env.NODE_ENV !== "development" &&
      req.headers["authorization"] !== auth &&
      req.query.auth !== auth
    ) {
      res.code(401);
      res.send({
        error: "401: Unauthorized",
        message: "You are not authorized to perform this action.",
        details: {
          url: req.url,
          id: req.id,
          action: "articles.reload",
        },
      });
      return;
    }

    articles = await loadArticles();

    res
      .code(201)
      .send(Array.from(articles.values()).map((article) => article.meta));
  });

  done();
}

/**
 * @param {import('fastify').FastifyReply} res
 */
export function renderApp(res) {
  res.header("content-type", "text/html; charset=utf-8").send(app);
}
