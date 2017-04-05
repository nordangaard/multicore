const path = require('path');
const webpack = require('webpack');

const fixPath = function(pathString) {
  return path.resolve(path.normalize(pathString));
};


module.exports = {
  entry: fixPath('./src/multicore.js'),
  output: {
    path: fixPath('./lib'),
    filename: 'multicore.js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          cacheDirectory: true,
        },
      },
    ],
  },
};
