const path = require("path");

module.exports = {
  entry: "./src/app.js",
  output: {
    path: path.resolve(__dirname, "app"),
    filename: "bundle.js",
  },
  mode: process.env.NODE_ENV,
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
