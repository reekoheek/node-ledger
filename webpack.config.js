const path = require('path');
// const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const DashboardPlugin = require('webpack-dashboard/plugin');
// const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin; //require('./dev/webpack/UglifyJsPlugin');

module.exports = function (env) {
  return {
    context: path.resolve(__dirname, './ui-src'),
    entry: {
      main: './main.js',
    },
    output: {
      path: path.join(__dirname, 'ui'),
      publicPath: '/ui',
      filename: 'lib/[name].js',
    },
    devtool: 'source-map',
    plugins: getPlugins(env),
    module: {
      rules: [
        {
          test: /\.html$/,
          use: 'html-loader',
        },
        {
          test: /\.s?css$/,
          loader: getCssLoader(),
        },
        {
          test: /\.(jpe?g|png|gif|svg)(\?.*)?$/i,
          use: getUrlLoader('./img/[name].[ext]'),
        },
        {
          test: /\.(woff2?|ttf|eot)(\?.*)?$/i,
          use: {
            loader: 'url-loader',
            options: getUrlLoader('./img/[name].[ext]'),
          },
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: getBabelLoader(),
        },
        {
          test: /\.js$/,
          include: /(template-binding|xin|xin-([a-zA-Z-]+)|([a-zA-Z-]+)-helper)\//,
          use: getBabelLoader(),
        },
      ],
    },
    devServer: {
      compress: true,
      // hot: false,
      // inline: false,
      host: '0.0.0.0',
      proxy: {
        '/api': { target: 'http://localhost:3000' },
        '/auth': { target: 'http://localhost:3000' },
      },
      // contentBase: (() => (env.cordova ? ['./www', './platforms/android/platform_www'] : [ './www' ]))(),
    },
  };
};

function getPlugins ({ dashboard } = {}) {
  const plugins = [];

  if (dashboard) {
    plugins.push(new DashboardPlugin());
  }

  plugins.push(new ExtractTextPlugin({
    filename: 'lib/bundle.css',
    disable: false,
    allChunks: true,
  }));

  return plugins;

  // new webpack.LoaderOptionsPlugin({
  //   // options: {
  //   //   debug: true,
  //   // },
  // }),
  // new UglifyJsPlugin({
  //   compress: false,
  //   // compress: { warnings: true },
  //   mangle: false,
  //   sourceMap: true,
  // }),
}

function getCssLoader () {
  // return [ 'style-loader', 'css-loader' ];
  return ExtractTextPlugin.extract({
    fallbackLoader: 'style-loader',
    loader: [
      {
        loader: 'css-loader',
      },
      {
        loader: 'sass-loader',
        query: {
          includePaths: [ path.resolve(__dirname, './node_modules') ],
        },
      },
    ],
    // publicPath: '/dist'
  });
}

function getUrlLoader (name = '[name].[ext]') {
  return {
    loader: 'url-loader',
    options: {
      limit: 1000,
      name: name,
    },
  };
}

function getBabelLoader () {
  return {
    loader: 'babel-loader',
    options: {
      babelrc: false,
      plugins: [
        require.resolve('babel-plugin-syntax-dynamic-import'),
      //   'babel-plugin-transform-async-to-generator',
      ],
      // presets: [
      //   'babel-preset-es2015',
      //   'babel-preset-stage-3',
      // ],
      cacheDirectory: true,
    },
  };
}
