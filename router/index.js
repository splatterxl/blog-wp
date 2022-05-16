const express = require("express");
const app = express();
const index = new Map(require("../blog/list.json").map((v) => [v.slug, v]));

app.set("x-powered-by", false);

app.use((req, _, next) => {
  console.log(
    `${req.ip} - ${req.method} ${req.url} - ${req.headers["user-agent"]}`
  );
  next();
});
app.get("/", (req, res) => {
  res.redirect("/app/");
});
app.get("/noscript", (req, res) => {
  res.redirect("/app/unsupported");
});
app.get("/noscript.html", (req, res) => {
  res.redirect("/app/unsupported");
});
app.get("/articles/:slug", (req, res) => {
  if (index.has(req.params.slug)) {
    res.send(createOG(index.get(req.params.slug)));
  } else {
    res.redirect("/app/?error=404");
  }
});
app.get("/avatar", (req, res) => {
  res.redirect("https://avatars.githubusercontent.com/u/67709748");
});
app.get("/favicon.ico", (req, res) => {
  res.redirect("/assets/img/favicon.ico");
});
// serve static files from ../app/ whenever a request is called to /app/*
app.use(
  "/app",
  express.static("../app", {
    extensions: ["html"],
  })
);
// raw blog files
app.use(
  "/api/blog",
  express.static("../blog", {
    extensions: ["json"],
  })
);
app.use("/assets", express.static("../src/assets"));
app.use((req, res) => {
  console.debug(`${req.method} ${req.url} -> 404 Not Found`);
  res.status(404).send("404: Not Found");
});

app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});

function createOG(data) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>${data.name}</title>
  <meta name="description" content="${data.description}">
  <meta property="og:title" content="${data.name}">
  <meta property="og:description" content="${data.description}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Splatterxl's Blog">
  <meta property="og:locale" content="en_GB">
  <meta property="theme-color" content="#19ab63" />
  <meta property="og:image" content="/avatar">
  <meta http-equiv="refresh" content="0; url=/app?id=${data.slug}">
  <link rel="stylesheet" href="/assets/css/globals.css">
</head>
<body>
</body>
`;
}
