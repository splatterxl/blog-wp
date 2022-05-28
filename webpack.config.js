import path from 'node:path';

export default {
  entry: "./client/src/app.js",
  output: {
    path: path.resolve("./client/assets/js"),
    filename: "bundle.js",
  },
  mode: process.env.NODE_ENV,
};
