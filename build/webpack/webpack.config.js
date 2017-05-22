'use strict';

const fs = require('fs');
const path = require('path');
const HtmlwebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const webpack = require('webpack');
const Clean = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const autoprefixer = require('autoprefixer');
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
    mocks: path.join(process.cwd(), 'src/test/mocks'),
    app: path.join(process.cwd(), 'src/app/entry.ts'),
    indexInlined: path.join(process.cwd(), 'src/index-inlined.js'),
    build: path.join(process.cwd(), 'dist')
};

const SOURCE_MAPS = {
    // https://webpack.js.org/configuration/devtool/
    'start': '#cheap-module-eval-source-map',
    'build': '#source-map',
    'build:tcity': '#source-map',
    'test:tcity': '#source-map',
    'test': '#source-map',
    'tdd': '#source-map'
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

const checkUnusedVars = TARGET === 'start' || TARGET === 'build' || TARGET === 'build:tcity';

const postcssConf = [
    autoprefixer({
        browsers: [
            '> 5%',
            'Explorer 11',
            'Firefox >= 30',
            'Chrome >= 34',
            'Safari >= 5.1',
            'Opera >= 22',
            'Android >= 4.1']
    })
];

let webPackModuleExport;

const common = {
    resolve: {
        modules: [
            path.join(process.cwd(), 'src'),
            'node_modules'
        ],
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
                        loader: 'ng-annotate-loader?add=true&map=false'
                    },
                    {
                        loader: `awesome-typescript-loader?sourceMap=${!!(checkTool())}&noUnusedLocals=${checkUnusedVars}`
                    }
                ],
                enforce: 'pre',
                include: PATHS.appSource
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                use: ['url-loader?limit=40000&name=assets/images/[name].[ext]'],
                include: PATHS.appSource
            },
            {
                test: /\.html$/,
                use: ['html-loader?exportAsEs6Default'],
                include: PATHS.appSource
            }
        ]
    },
    plugins: [
        new webpack.NormalModuleReplacementPlugin(/^tmApiEnums$/, 'app/api/generated/enums/tmApiEnums.js')
    ]
};

if (TARGET === 'start' || !TARGET) {
    webPackModuleExport = merge(common, {
        devtool: checkTool(),
        module: {
            rules: [
                {
                    test: /\.scss$/,
                    use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
                    include: PATHS.appSource
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader', 'postcss-loader'],
                    include: PATHS.appSource
                }
            ]
        },
        plugins: [
            new HtmlwebpackPlugin({
                template: './build/webpack/templates/develop.webpack.ejs',
                minify: {},
                tangramIcons: '/tangram.icons.hash.svg'
            }),
            new webpack.LoaderOptionsPlugin({
                options: {
                    context: __dirname,
                    postcss: postcssConf
                }
            }),
        ]
    });
}

if (TARGET === 'build' || TARGET === 'build:tcity') {
    // Gather Vendor Modules for Vendor Chunk except Tangram
    const vendorPkgs = Object.keys(pkg.dependencies);
    vendorPkgs.splice(vendorPkgs.indexOf('tangram'), 1);
    vendorPkgs.splice(vendorPkgs.indexOf('trademe-ui-router'), 1);
    // To generate Tangram icons file hash file
    const tangramIconsFileHash = sha1(fs.readFileSync('./node_modules/tangram/images/icons.svg'));
    const extractSharedCSS = new ExtractTextPlugin('shared.[chunkhash].css');

    webPackModuleExport = merge(common, {
        devtool: checkTool(),
        entry: {
            vendor: vendorPkgs,
            indexInlined: PATHS.indexInlined
        },
        output: {
            path: PATHS.build,
            filename: '[name].[chunkhash].js'
        },
        module: {
            rules: [
                {
                    test: /^((?!shared\.scss$).)*\.scss$/,
                    use: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: 'css-loader?minimize=true!postcss-loader!sass-loader'
                    }),
                    include: PATHS.appSource
                },
                {
                    test: /shared\.scss$/,
                    use: extractSharedCSS.extract({
                        fallback: 'style-loader',
                        use: 'css-loader?minimize=true!postcss-loader!sass-loader'
                    }),
                    include: PATHS.appSource
                },
                {
                    test: /\.css$/,
                    use: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: 'css-loader?minimize=true!postcss-loader'
                    }),
                    include: PATHS.appSource
                }
            ]
        },
        plugins: [
            new webpack.LoaderOptionsPlugin({
                minimize: true,
                debug: false,
                options: {
                    context: __dirname,
                    postcss: postcssConf
                }
            }),
            new Clean([PATHS.build], {
                root: process.cwd(),
                verbose: false,
                dry: false
            }),
            new HtmlwebpackPlugin({
                template: './build/webpack/templates/production.webpack.ejs',
                tangramIcons: '/tangram.icons.' + tangramIconsFileHash + '.svg',
                chunksSortMode: function (chunk1, chunk2) {
                    const orders = ['manifest', 'indexInlined', 'vendor', 'app'];
                    const order1 = orders.indexOf(chunk1.names[0]);
                    const order2 = orders.indexOf(chunk2.names[0]);
                    return (order1 > order2) ? 1 : (order1 < order2) ? -1 : 0;
                },
                inlineSource: 'indexInlined',
                minify: {
                    collapseWhitespace: true,
                    removeComments: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true
                }
            }),
            new HtmlWebpackInlineSourcePlugin(),
            new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en-nz/),
            new ExtractTextPlugin('styles.[chunkhash].css'),
            extractSharedCSS,
            new webpack.optimize.CommonsChunkPlugin({
                names: ['vendor', 'manifest']
            }),
            new CopyWebpackPlugin([
                { context: PATHS.appSource, from: 'app/shared/images/*.png' },
                { context: PATHS.appSource, from: 'app/**/*.svg' },
                { context: process.cwd(), from: 'node_modules/tangram/images/icons.svg', to: './tangram.icons.' + tangramIconsFileHash + '.svg' },
                { context: PATHS.appSource, from: 'favicon.production.ico', to: './favicon.ico' },
                { context: PATHS.appSource, from: 'web.config' },
                { context: PATHS.appSource, from: 'robots.txt' },
                { context: PATHS.appSource, from: 'apple-touch-icon-57x57.png' },
                { context: PATHS.appSource, from: 'ie-manifest.xml' },
                { context: PATHS.appSource, from: 'manifest.webapp' },
                { context: PATHS.appSource, from: 'healthcheck.aspx' },
                { context: PATHS.appSource, from: 'web.config' }
            ]),
            new webpack.optimize.UglifyJsPlugin({
                beautify: false,
                mangle: {
                    except: ['$super', '$', 'exports', 'require', 'angular'],
                    screw_ie8: true,
                    keep_fnames: true
                },
                sourceMap: !!(checkTool()),
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
                },
            })
            // ,
            // TODO: Seems that entryOnly doesn't work and banner is applied to all files
            // Using a template string breaks the rendered ascii somehow ¯\_(ツ)_/¯
            // new webpack.BannerPlugin({
            //     banner: " _____              _        __  __      \r\n"
            //             + "|_   _| __ __ _  __| | ___  |  \\/  | ___    __ _\r\n"
            //             + "  | || '__/ _` |/ _` |/ _ \\ | |\\/| |/ _ \\  /  ('>--\r\n"
            //             + "  | || | | (_| | (_| |  __/ | |  | |  __/  \\__/\r\n"
            //             + "  |_||_|  \\__,_|\\__,_|\\___| |_|  |_|\\___|   L\\_\r\n"
            //             + "  L i f e     l i v e s     h e r e\r\n",
            //     raw: false, entryOnly: true
            // })
        ]
    });
}

if(TARGET === 'test' || TARGET === 'tdd' || TARGET === 'test:tcity') {
    webPackModuleExport = merge(common, {
        bail: TARGET === 'test',
        devtool: checkTool(),
        module: {
            noParse: [
                /sinon/
            ],
            rules: [{ test: /\.(scss|css)$/, use: ['null-loader'], include: PATHS.appSource} ]
        },
        plugins: [
            new webpack.NormalModuleReplacementPlugin(/^sinon$/, 'vendor/sinon-1.17.2.js')
        ]
    });
    if (NPM_PARAMS.sourcemap && TARGET !== 'test:tcity') {
        webPackModuleExport.module.rules.push({
            test: /^((?!\.spec\.ts$).)*\.ts$/,
            use: ['istanbul-instrumenter-loader'],
            include: PATHS.appSource,
            enforce: 'post'
        });
    }
}

if(checkTool() && TARGET !== 'test') {
    // Load source-map-loader in all source-maps cases but when coverage report is needed
    // source-map-loader conflict with istanbul code coverage report
    webPackModuleExport.module.rules[0].use.push({loader: 'source-map-loader'});
}

module.exports = webPackModuleExport;
