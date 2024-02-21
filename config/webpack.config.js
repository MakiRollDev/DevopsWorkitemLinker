const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: {
    background: path.resolve(__dirname, "..", "src", "background.ts"),
    content: path.resolve(__dirname, "..", "src", "content.ts"),
  },
  output: {
    path: path.join(__dirname, "../dist"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".js", ".css"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: ".", to: ".", context: "public" },
        { from: "workitem.css", to: ".", context: "src" },
      ]
    }),
  ],
};