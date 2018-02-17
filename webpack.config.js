const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const DEBUG = JSON.parse(process.env.DEBUG || '0');

const plugins = [
  new CopyWebpackPlugin([
    {
      from: 'src/images', to: 'images',
    },
    {
      from: 'src/index.html'
    }
  ],
    {
      ignore: [],
      copyUnmodified: true
    }
  ),
  new ExtractTextPlugin({
    filename: "css/style.min.css",
    allChunks: true
  })
];

if (!DEBUG) {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}}),
    new OptimizeCssAssetsPlugin()
  )
}

module.exports = {
  entry: {
    'js/trex': path.resolve(__dirname, 'src/js/trex.js'),
    'js/learner': path.resolve(__dirname, 'src/js/learner.js')
  },
  output: {path: path.resolve(__dirname, 'dist'), filename: '[name].bundle.js'},
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract(
            {fallback: 'style-loader', use: 'css-loader'})
      },
      {
        test: [/\.es6$/, /\.js$/],
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: 'es2015'
          }
        }
      }
    ]
  },
  plugins: plugins,
  devServer: {
    contentBase: path.resolve(__dirname, "dist"),
    compress: true,
    port: 9000
  }
};
