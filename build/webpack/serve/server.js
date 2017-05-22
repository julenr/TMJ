'use strict';

const compression = require ('compression');
const proxy = require ('express-http-proxy');
const express = require ('express');
const https = require ('https');
const webpackMiddleware = require ('webpack-dev-middleware');
const webpack = require ('webpack');
const path = require ('path');
const fs = require ('fs');
const logger = require ('../../utilities/logger');
const chalk = require ('chalk');

const sslCredentials = {
  key: fs.readFileSync('./build/webpack/serve/localhost.key', 'utf8'),
  cert: fs.readFileSync('./build/webpack/serve/localhost.crt', 'utf8')
};
const TM_ENV = getEnv();
const API_URL = `api.${TM_ENV}.trademe.co.nz`;
const IMAGESERVER_URL = `${TM_ENV}.trademe.co.nz`;
const PORT = 5000;
const STATIC_PATH = isDevelopment() ? 'src' : 'dist';

const app = express();
const server = https.createServer(sslCredentials, app);

let isFirstCompile = true;

// In case Production is selected check if appropiate folder exist
if (!isDevelopment()) {
    checkProduction();
}
app.use(compression());
setProxy('/ngapi', API_URL);
setProxy('/images/', IMAGESERVER_URL);
app.use(express.static(STATIC_PATH));

if (isDevelopment()) {
    cacheRequests();
    // fixme: Why is this here?
    app.use('/app', express.static('src/app'));
    app.get('/tangram.icons.hash.svg', (req, res) => res.sendFile(path.join(process.cwd(), 'node_modules/tangram/images/icons.svg')));
    const config = require('../webpack.config.js');
    const compiler = webpack(config);
    compiler.plugin('compile', function() {
        if (isFirstCompile) {
            logger.info(`\n
=============================================================================\n
  Warming up the WebPack build, this takes a couple of minutes the first time...\n
==============================================================================\n`);
        }
    });
    compiler.plugin('done', () => {
        if (isFirstCompile) {
            servingInfoLog();
            isFirstCompile = false;
        }
    });
    app.use(webpackMiddleware(compiler, {
        stats: 'minimal',
        publicPath: config.output.publicPath
    }));
    app.use('*', (req, res, next) => {
        const filename = path.join(compiler.outputPath, 'index.html');
        compiler.outputFileSystem.readFile(filename, (err, result) => {
            if (err) {
                return next(err);
            }
            try {
                res.set('content-type','text/html');
                res.send(result);
                res.end();
            }
            catch (e) {
                // Occasionally this callback runs after headers have already been sent
                console.error('Failed to write to response', e);
                return next(e);
            }
        });
    });
} else { // Production
    app.get('*', (req, res) => {
        res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
}

// Listen
server.listen(PORT, null, (err) => {
    if (err) {
        console.log(err);
    } else if (!isDevelopment()){
        servingInfoLog();
    }
});

function isDevelopment () {
    return (!process.env.NODE_ENV) || (process.env.NODE_ENV === 'development');
}

function getMode () {
    return isDevelopment() ? 'development' : 'production';
}

function setProxy(path, url) {
    app.use(path, proxy(url, {
        decorateRequest: function (proxyReq, originalReq) {
            proxyReq.headers['host'] = url;
            proxyReq.headers['referer'] = `http://${url}`;
            return proxyReq;
        },
        forwardPath: function (req, res) {
            return path + require('url').parse(req.url).path;
        },
        limit: '10mb'
    }));
}

function getEnv() {
  let envParam = process.env.npm_config_env;
  if (envParam === true || !envParam) {
    const randomItem = list => list[Math.floor(Math.random() * list.length)];
    const numbers = [1, 2, 3, 4, 5, 6];
    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    envParam = `${randomItem(numbers)}${randomItem(letters)}`;
  } else if (!isNaN(envParam)) {
    // Number only defaults to env nA
    envParam = `${envParam}a`;
  }
  if (/\d/.test(envParam)) {
    envParam = `test${envParam}`;
  }
  return envParam;
}

function cacheRequests() {
    if (fs.existsSync(path.join(process.cwd(), 'cache'))) {
        ['abtesting/features.json', 'categories/0.json', 'localities.json', 'tmareas.json', 'travelareas.json']
            .forEach(path => {
                const file = /[^\\/:*?"<>|\r\n]+$/.exec(path);
                app.use(`/ngapi/v1/${path}`, express.static(`cache/${file}`));
            });
    }
}

function webPackBundle() {

}

function servingInfoLog() {
    logger.info(`\n
=========================================================================\n
  Serving in ${getMode()} mode at ${chalk.white.bgBlack.bold('https://preview.dev.trademe.co.nz:' + PORT)} 
  Proxying through to ${chalk.white.bgBlack.bold(API_URL)}\n
=========================================================================\n`);
}

function checkProduction() {
    try {
        fs.accessSync(path.join(process.cwd(), 'dist', 'index.html'), fs.F_OK);
    }
    catch(e) {
        logger.info(`\n
=======================================================================================\n
  ${chalk.red('ERROR: No Production build exist')}\n
  Remember that production mode only serves the dist folder,
  you will need to trigger your own build with ${chalk.white.bgBlack('npm run build')}\n
=======================================================================================\n`);
        process.exit();
    }
}
