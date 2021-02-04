const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const packageJson = require('./../package.json');
const utils = require('./utils.js');

const getTsLoaderRule = env => {
  let rules = [
    {
      loader: 'thread-loader',
      options: {
        // There should be 1 cpu for the fork-ts-checker-webpack-plugin.
        // The value may need to be adjusted (e.g. to 1) in some CI environments,
        // as cpus() may report more cores than what are available to the build.
        workers: 1
      }
    }
  ];
  if (env === 'development') {
    rules.push({
      loader: "babel-loader",
      options: {
        cacheDirectory: true,
        babelrc: false,
        presets: [
          [
            "@babel/preset-env",
            {targets: {browsers: "last 1 Chrome version"}} // or whatever your project requires
          ],
          "@babel/preset-typescript",
          "@babel/preset-react"
        ],
        plugins: [
          // plugin-proposal-decorators is only needed if you're using experimental decorators in TypeScript
          ["@babel/plugin-proposal-decorators", {legacy: true}],
          ["@babel/plugin-proposal-class-properties", {loose: false}],
          "react-hot-loader/babel"
        ]
      }
    });
  } else {
    rules.unshift({
      loader: 'cache-loader',
      options: {
        cacheDirectory: path.resolve('build/cache-loader')
      }
    });
    rules.push({
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
        happyPackMode: true
      }
    });
  }
  return rules;
};

module.exports = options => ({
  cache: options.env !== 'production',
  resolve: {
    extensions: [
      '.js', '.jsx', '.ts', '.tsx', '.json'
    ],
    modules: ['node_modules'],
    alias: utils.mapTypescriptAliasToWebpackAlias()
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: getTsLoaderRule(options.env),
        include: [utils.root('./src/main/webapp/app')],
        exclude: [utils.root('node_modules')]
      },
      {
        test: /\.(jpe?g|png|gif|svg|woff2?|ttf|eot)$/i,
        loader: 'file-loader',
        options: {
          digest: 'hex',
          hash: 'sha512',
          name: 'content/[hash].[ext]'
        }
      },
      {
        enforce: 'pre',
        test: /\.jsx?$/,
        loader: 'source-map-loader'
      },
      {
        test: /\.(j|t)sx?$/,
        enforce: 'pre',
        loader: 'eslint-loader',
        exclude: [utils.root('node_modules')]
      }
    ]
  },
  stats: {
    children: false
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: `'${options.env}'`,
        VERSION: `'${packageJson.version}'`,
        DEBUG_INFO_ENABLED: options.env === 'development',
        // The root URL for API calls, ending with a '/' - for example: `"https://www.jhipster.tech:8081/myservice/"`.
        // If this URL is left empty (""), then it will be relative to the current context.
        // If you use an API server, in `prod` mode, you will need to enable CORS
        // (see the `jhipster.cors` common JHipster property in the `application-*.yml` configurations)
        SERVER_API_URL: `''`
      }
    }),
    new ForkTsCheckerWebpackPlugin({ eslint: true }),
    new CopyWebpackPlugin([
      { from: './node_modules/swagger-ui-dist/*.{js,css,html,png}', to: 'swagger-ui', flatten: true, ignore: ['index.html']},
      { from: './node_modules/axios/dist/axios.min.js', to: 'swagger-ui'},
      { from: './src/main/webapp//swagger-ui/', to: 'swagger-ui' },
      { from: './src/main/webapp/content/', to: 'content' },
      { from: './src/main/webapp/favicon.ico', to: 'favicon.ico' },
      { from: './src/main/webapp/manifest.webapp', to: 'manifest.webapp' },
      // jhipster-needle-add-assets-to-webpack - JHipster will add/remove third-party resources in this array
      { from: './src/main/webapp/robots.txt', to: 'robots.txt' }
    ]),
    new HtmlWebpackPlugin({
      template: './src/main/webapp/index.html',
	    chunksSortMode: 'auto',
      inject: 'body',
      base: '/',
    }),
  ]
});
