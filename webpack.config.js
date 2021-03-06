const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const MODE = process.env.NODE_ENV;

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
  new MiniCssExtractPlugin({
    filename: 'game/css/style.min.css',
    allChunks: true,
  }),
];

if (MODE === 'production') {
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
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
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
