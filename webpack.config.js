const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const DEBUG = JSON.parse(process.env.DEBUG || '0');

const plugins = [
  new CopyWebpackPlugin(
    [
      {
        from: 'src/game/images',
        to: 'images',
      },
      {
        from: 'src/game/index.html',
      },
    ],
    {
      ignore: [],
      copyUnmodified: true,
    }
  ),
  new ExtractTextPlugin({
    filename: 'game/css/style.min.css',
    allChunks: true,
  }),
];

if (!DEBUG) {
  plugins.push(new UglifyJSPlugin(), new OptimizeCssAssetsPlugin());
}

module.exports = {
  entry: {
    app: path.resolve(__dirname, 'src/app/app.js'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader',
        }),
      },
      {
        test: [/\.es6$/, /\.js$/],
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['env', { targets: { uglify: true } }]],
            plugins: ['babel-plugin-transform-class-properties'],
          },
        },
      },
    ],
  },
  plugins: plugins,
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    compress: true,
    port: 9000,
  },
};
