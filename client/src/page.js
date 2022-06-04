import { createElement, updateDOM, title } from "./util/dom.js";
import { query } from "./util/query.js";
import { setURL, pushURL, navigate, createError } from "./router.js";
import { debug } from "./util/logging.js";
import { updateList, session, getList } from "./util/session.js";
import { get } from "./util/http.js";

export function createPage(
  pathname = location.pathname,
  push = true,
  createLoading = true,
  set = true,
  error = query.get("error")
) {
  if (createLoading) {
    updateDOM(
      createElement("header", null, [
        createElement("h1", { text: "Loading..." }),
        createArticleLoading(),
      ]),
      null,
      "loading"
    );
  }

  let path;

  if (error) {
    debug("render", "paint error:", error);
    createErrorPage(error);
  } else {
    const slug = getSlug(pathname);

    if (slug && slug !== "index") {
      session.page = "article";
      debug("render", "paint article:", slug);
      path = createArticlePage(
        slug,
        getList().find((x) => x.slug === slug),
        push
      );
    } else {
      session.page = "home";
      debug("render", "paint app home");
      path = createHomePage(push);
    }
  }

  if (set) {
    (push ? pushURL : setURL)(pathname);
  }
}

export function getSlug(path) {
  const pathname = path.slice(1).split("/");
  pathname.shift();

  if (pathname[0] === "app" || pathname[0] === "articles") {
    pathname.shift();
  }

  if (!pathname[0]) {
    pathname[0] = query.get("id");
  }

  return pathname[0];
}

export async function createArticlePage(slug, baseData, push = true) {
  const index = await updateList();

  const article = await get(
    `/api/articles/${slug}/full?content-type=html`
  ).catch(() => null);

  if (!article) {
    return createError("404");
  }

  const { meta: articleMeta, content } = article;

  const { title: name, author, date: created, modified = null } = articleMeta;

  const heading = createElement("h1", {
    class: "article-heading",
    text: name,
  });
  const metaElem = createElement("p", {
    class: "article-meta",
  });
  metaElem.appendChild(
    createElement("span", {
      class: "article-author",
      text: author,
    })
  );
  metaElem.appendChild(
    createElement(
      "span",
      {
        class: "article-date",
      },
      [
        createElement("span", {
          class: "article-date-on",
          text: " on ",
        }),
        createElement("span", {
          class: "article-date-actual",
          text: new Date(created).toLocaleDateString(navigator.language, {
            dateStyle: "medium",
          }),
        }),
      ]
    )
  );

  if (modified && modified !== created) {
    metaElem.appendChild(
      createElement("span", {
        class: "article-date-modified",
        text:
          " (last modified on " +
          new Date(modified).toLocaleDateString(navigator.language, {
            dateStyle: "medium",
          }) +
          ")",
      })
    );
  }

  const header = createElement("header", null, [heading, metaElem]);

  updateDOM(
    header,
    createElement("article", {
      innerHTML: article.content,
    }),
    "article"
  );
  title(name);

  return `/articles/${slug}`;
}

export async function createHomePage(push = true) {
  const heading = createElement("h1", {
    class: "home-heading",
    text: "Welcome to my blog!",
  });
  const meta = createElement("p", {
    class: "home-meta",
    text: "This is a place where I write about my journey and experiences with the web.",
  });

  const header = createElement("header", null, [heading, meta]);

  const list = await createArticleList();

  updateDOM(header, list, "home");
  title("Home");

  return "/";
}

export async function createArticleList() {
  const index = await updateList();

  const list = index.map((article) => {
    const { title: name, slug } = article;
    const link = createElement(
      "a",
      {
        class: "article-list-a",
        href: `/articles/${slug}`,
        onClick(event) {
          event.preventDefault();
          navigate(`/articles/${slug}`);
        },
      },
      [
        createElement(
          "li",
          {
            class: "article-list-item",
          },
          [
            createElement("span", {
              class: "article-list-name",
              text: name,
            }),
            createElement("span", {
              class: "article-list-sep",
              text: " | ",
            }),
            createElement("span", {
              class: "article-list-date",
              text: new Date(article.date).toLocaleDateString(
                navigator.language,
                {
                  dateStyle: "medium",
                }
              ),
            }),
          ]
        ),
      ]
    );

    return link;
  });

  return createElement(
    "ul",
    {
      class: "article-list",
    },
    list
  );
}

export async function createNotFoundPage() {
  const heading = createElement("h1", {
    text: "Not Found",
  });
  const meta = createElement("p", {
    text: "The page you are looking for does not exist.",
  });

  const header = createElement("header", null, [heading, meta]);

  updateDOM(header, null, "error");
  title("Not Found");
}

export function createErrorPage(code) {
  switch (code) {
    case "not-found":
    case "404": {
      return createNotFoundPage();
    }
    default: {
      const heading = createElement("h1", {
        text: "Error",
      });
      const meta = createElement(
        "p",
        {
          text: "An error occurred. Here's all I know:",
        },
        [
          createElement("pre", {
            text: code,
          }),
        ]
      );

      const header = createElement("header", null, [heading, meta]);

      updateDOM(header, null, "error");
      title("Error");

      break;
    }
  }
}

function createArticleLoading() {
  return createElement("p", {
    class: "article-loading",
    text: "Hang tight, we're loading the article...",
  });
}
