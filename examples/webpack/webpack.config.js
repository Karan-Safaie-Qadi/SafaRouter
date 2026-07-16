import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  entry: "./main.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.[contenthash].js",
    clean: true,
  },
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
    static: [
      { directory: path.resolve(__dirname) },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
      inject: true,
    }),
  ],
};
