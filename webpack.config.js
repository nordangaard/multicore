const path = require('path');
const webpack = require('webpack');
const env = process.env.NODE_ENV


var config = {
  output: {
    library: 'Multicore',
    libraryTarget: 'umd',
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/},
    ],
  },
  plugins: []
};


if (env === 'production') {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        screw_ie8: true,
        warnings: false
      }
    })
  )
}

module.exports = config;
