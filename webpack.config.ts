const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
module.exports = {
  //项目入口
  entry: "./src/index.ts",
  //输出设置
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  //调试工具
  devtool: "source-map",
  //模块加载器设置
  module: {
    // loaders: [{ test: /\.tsx?$/, loader: "awesome-typescript-loader" }]
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
      }

    ]
  },
  //调试服务
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 7777
  },
  //插件
  plugins: [
    new HtmlWebPackPlugin({
      title: "threejs学习"
    })
  ]
};
