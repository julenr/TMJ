'use strict';

const fs = require('fs');
const path = require('path');
const HtmlwebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const webpack = require('webpack');
const Clean = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const sha1 = require('sha1');
const chalk = require('chalk');
const pkg = require('../../package.json');

const TARGET = process.env.npm_lifecycle_event;
// NPM Parameters --notypes --sourcemap
const NPM_PARAMS = {
  notypes: process.env.notypes,
  sourcemap: process.env.npm_config_sourcemap
};

const PATHS = {
  appSource: path.join(process.cwd(), 'src'),
  app: path.join(process.cwd(), 'src/main.ts'),
  build: path.join(process.cwd(), 'dist')
};

const SOURCE_MAPS = {
  // https://webpack.js.org/configuration/devtool/
  start: '#cheap-module-eval-source-map',
  build: '#source-map',
  'build:tcity': '#source-map',
  'test:tcity': '#source-map',
  test: '#source-map',
  tdd: '#source-map'
};

function checkTool() {
  switch (NPM_PARAMS.sourcemap) {
    case 'true': {
      return SOURCE_MAPS[TARGET];
      break;
    }
    case 'none': {
      return false;
    }
    case undefined: {
      return SOURCE_MAPS[TARGET];
      break;
    }
    default: {
      return NPM_PARAMS.sourcemap;
    }
  }
}

const checkUnusedVars =
  TARGET === 'start' || TARGET === 'build' || TARGET === 'build:tcity';

const testServer = '1b';
let webPackModuleExport;

const common = {
  resolve: {
    modules: [path.join(process.cwd(), 'src'), 'node_modules'],
    extensions: ['.ts', '.js', '.json']
  },
  entry: {
    app: PATHS.app
  },
  output: {
    path: PATHS.build,
    publicPath: '/',
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: `awesome-typescript-loader?{configFileName: "tsconfig.json"}`
          },
          'angular2-template-loader'
        ],
        include: [PATHS.appSource, path.resolve('node_modules/@trademe')]
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: ['url-loader?limit=40000&name=assets/images/[name].[ext]'],
        include: [PATHS.appSource, path.resolve('node_modules/@trademe')]
      },
      { test: /\.svg/, loader: 'svg-inline-loader?removeSVGTagAttrs=false' },
      {
        test: /\.html$/,
        use: ['raw-loader'],
        include: [PATHS.appSource, path.resolve('node_modules/@trademe')]
      }
    ]
  },
  plugins: [
    new webpack.ContextReplacementPlugin(
      /angular(\\|\/)core(\\|\/)@angular/,
      PATHS.appSource
    )
  ],
  node: {
      global: true,
      crypto: 'empty',
      process: true,
      module: false,
      clearImmediate: false,
      setImmediate: false
    }
};

if (TARGET === 'start' || !TARGET) {
  webPackModuleExport = merge(common, {
    devtool: checkTool(),
    module: {
      rules: [
        {
          test: /\.(scss|css)$/,
          use: [
            'to-string-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: true
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
                includePaths: ['node_modules']
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new HtmlwebpackPlugin({
        template: './build/webpack/templates/develop.webpack.ejs',
        minify: {}
      }),
      new webpack.LoaderOptionsPlugin({
        options: {
          context: __dirname
        }
      })
    ],
    devServer: {
      https: true,
      port: process.env.PORT || 5000,
      host: 'localhost',
      open: false,
      proxy: {
        '/ngapi/**': {
          target: `http://api.test${testServer}.trademe.co.nz`,
          secure: true,
          changeOrigin: true,
          onProxyReq: proxyReq => {
            proxyReq.setHeader(
              'referer',
              `http://api.test${testServer}.trademe.co.nz`
            );
          }
        }
      }
    }
  });
}

if (TARGET === 'build' || TARGET === 'build:tcity') {
  // Gather Vendor Modules for Vendor Chunk
  const vendorPkgs = Object.keys(pkg.dependencies);

  webPackModuleExport = merge(common, {
    devtool: checkTool(),
    entry: {
      vendor: vendorPkgs
    },
    output: {
      filename: '[name].[chunkhash].js'
    },
    module: {
      rules: [
        {
          test: /\.(scss|css)$/,
          use: ['to-string-loader'].concat(
            ExtractTextPlugin.extract({
              use: [
                {
                  loader: 'css-loader',
                  options: { sourceMap: false, url: false }
                },
                {
                  loader: 'postcss-loader',
                  options: {
                    sourceMap: false
                  }
                },
                {
                  loader: 'sass-loader',
                  options: {
                    sourceMap: false,
                    includePaths: ['node_modules']
                  }
                }
              ]
            })
          )
        }
      ]
    },
    plugins: [
      new webpack.ProvidePlugin({
        Reflect: 'core-js/es7/reflect'
      }),
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false,
        options: {
          context: __dirname
        }
      }),
      new Clean([PATHS.build], {
        root: process.cwd(),
        verbose: false,
        dry: false
      }),
      new HtmlwebpackPlugin({
        template: './build/webpack/templates/production.webpack.ejs',
        chunksSortMode: function(chunk1, chunk2) {
          const orders = ['manifest', 'vendor', 'app'];
          const order1 = orders.indexOf(chunk1.names[0]);
          const order2 = orders.indexOf(chunk2.names[0]);
          return order1 > order2 ? 1 : order1 < order2 ? -1 : 0;
        },
        minify: {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true
        }
      }),
      new ExtractTextPlugin('styles.[chunkhash].css'),
      new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor', 'manifest']
      }),
      new webpack.optimize.UglifyJsPlugin({
        beautify: false,
        mangle: {
          except: ['$super', '$', 'exports', 'require', 'angular'],
          screw_ie8: true,
          keep_fnames: true
        },
        sourceMap: !!checkTool(),
        output: {
          comments: false
        },
        compress: {
          screw_ie8: true,
          warnings: false,
          conditionals: true,
          unused: true,
          comparisons: true,
          sequences: true,
          dead_code: true,
          evaluate: true,
          if_return: true,
          join_vars: true,
          negate_iife: false
        }
      })
    ]
  });
}

module.exports = webPackModuleExport;
