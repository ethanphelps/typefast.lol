const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { DefinePlugin } = require('webpack');

module.exports = {
  entry: {
    app: path.join(__dirname, './src/index.tsx')
  },
  output: {
    path: path.join(__dirname, "/dist"),
    // publicPath: "./",
    filename: "[name].js",
    clean: true
  },
  mode: "development",
  cache: false,
  devServer: {
    port: 8080,
    historyApiFallback: true, // required for SPA routing. redirects 404s to index.html and lets it behave as if server-side rendered
    hot: true,
    static: {
      directory: path.join(__dirname, "public"), // get assets from here on reload
    },
    liveReload: true,
    watchFiles: [ path.join(__dirname, 'src/**/*') ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      // favicon: "./public/favicon.ico",
      inject: 'head',
      customHeaContent: `
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
        <link rel="manifest" href="/site.webmanifest">
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5">
        <meta name="msapplication-TileColor" content="#da532c">
        <meta name="theme-color" content="#ffffff">
      `
    }),
    // pass environment variables into build
    new DefinePlugin({
      process: {
        env: {
          ENV: JSON.stringify('local'),
          TEST: JSON.stringify('test string')
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
          'style-loader', 'css-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader', 'css-loader', 'sass-loader' // webpack processes loaders from right to left
        ]
      } 
    ]
  }
}