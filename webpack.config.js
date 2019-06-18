const ArcGISPlugin = require("@arcgis/webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const path = require("path");

module.exports = {
  entry: {
    index: [
      "./src/css/main.scss",
      // "@dojo/framework/shim/Promise",
      "./src/index.ts"
    ]
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "web-gis"),
    publicPath: "/web-gis/"
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: false
      })
    ]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: {
          transpileOnly: true
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: { minimize: false }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "resolve-url-loader",
            options: { includeRoot: true }
          },
          "sass-loader?sourceMap"
        ]
      },
      {}
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),

    new ArcGISPlugin(),

    new HtmlWebPackPlugin({
      title: "ArcGIS Template Application",
      template: "./src/index.html",
      filename: "./index.html",
      chunksSortMode: "none",
      inlineSource: ".(css)$"
    }),

    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),

    new CopyWebpackPlugin([
      {
        from: "./static",
        to: "./static"
      }
    ])
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src/")
    },
    modules: [
      path.resolve(__dirname, "/src"),
      path.resolve(__dirname, "node_modules/")
    ],
    extensions: [".ts", ".tsx", ".js", ".scss", ".css"]
  },
  node: {
    process: false,
    global: false,
    fs: "empty"
  }
};
