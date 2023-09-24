const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { DefinePlugin } = require('webpack');

module.exports = {
  entry: {
    app: path.join(__dirname, './src/index.tsx')
  },
  output: {
    path: path.join(__dirname, "/dist"),
    filename: "[name].[contenthash].js",
    clean: true
  },
  mode: "production",
  devServer: {
    port: 8080,
    historyApiFallback: true, // required for SPA routing. redirects 404s to index.html and lets it behave as if server-side rendered
    static: {
      directory: path.join(__dirname, "public"), // get assets from here on reload
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
    }),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      // favicon: "./public/favicon.ico"
      favicon: "./public/sparkles.svg"
    }),
    new DefinePlugin({
      process: {
        env: {
          ENV: JSON.stringify('prod'),
        }
      }
    })
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@public': path.resolve(__dirname, 'public')
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: '/node_modules/'
      },
      {
        test: /\.(png|jpg|jpeg)$/,
        type: "asset",
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader, 'css-loader' // loaders not included with webpack, so must npm install them
        ]
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader' // webpack processes loaders from right to left. sass -> css -> js representation / style tags in html
        ]
      },
    ]
  }
}