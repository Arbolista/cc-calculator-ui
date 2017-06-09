/* global __dirname module*/

import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

module.exports = {
  entry: {
    app: `${__dirname}/../app/development`,
    style: `${__dirname}/../style/app`,
  },
  devtool: 'cheap-module-source-map',
  output: {
    filename: '[name].js',
    path: `${__dirname}/../../../build/production/assets`,
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
      }, {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract('css-loader', 'raw-loader!sass-loader'),
      }, {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('css-loader', 'raw-loader'),
      }, {
        test: /\.json$/,
        loader: 'json',
      }, {
        test: /\.png$/,
        loader: 'url-loader?limit=100000',
      }, {
        test: /\.jpg$/,
        loader: 'file-loader',
      }, {
        test: /\.otf$/,
        loader: 'url?limit=10000&mimetype=application/font-otf',
      }, {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=application/font-woff',
      }, {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=application/font-woff',
      }, {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=application/octet-stream',
      }, {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file',
      }, {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=image/svg+xml',
      }, {
        test: /\.rt\.html$/,
        loader: 'react-templates-loader?targetVersion=0.14.0',
      },
    ],
  },
  sassLoader: {
    includePaths: [`${__dirname}/../../../shared/components`, `${__dirname}/../../../node_modules`],
  },
  plugins: [
    new ExtractTextPlugin('css/style.css', {
      allChunks: true,
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      'window.d3': 'd3',
      d3: 'd3',
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
      NODE_ENV: '"production"',
      API_BASE_URL: `"${process.env.API_BASE_URL}"`,
      COMPETITION_BASE_URL: `"${process.env.COMPETITION_BASE_URL}"`,
      APP_ID: `"${process.env.APP_ID}"`,
    }),
    new webpack.optimize.UglifyJsPlugin({ minimize: true }),
  ],
  node: {
    fs: 'empty',
  },
  resolve: {
    alias: {
      api: `${__dirname}/../../api/real`,
      shared: `${__dirname}/../../../shared`,
    },
  },
};
