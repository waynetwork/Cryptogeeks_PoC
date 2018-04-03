const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const backend = {
  host: 'localhost',
  port: 3001
};

module.exports = {
  devtool: 'eval-source-map',
  entry: './src/javascript/index',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build')
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new CopyWebpackPlugin([{ from: './src/static/' }]),
    new ExtractTextPlugin('style.css'),
    new webpack.DefinePlugin({
      DEVELOPMENT_MODE: true,
      WEBSOCKET_BASE_URL: JSON.stringify('http://'+backend.host+':'+backend.port+'/'),
      FEATURE_NOTIFICATIONS: true,
      FEATURE_WAITCOIN_CHALLENGE: true,
      GOOGLE_ANALYTICS_ID: JSON.stringify('')
    }),
  ],
  module: {
    rules: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract({
          use: ['css-loader', 'less-loader']
        })
      }
    ]
  },
  devServer: {
    port: 3000,
    hot: true,
    open: true,
    contentBase: path.join(__dirname, '../src/static'),
    proxy: {
      '/api': {
        target: backend,
        pathRewrite: {'^/api' : ''},
        secure: false
      }
    }

  },
};
