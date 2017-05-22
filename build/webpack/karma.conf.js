'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');

// --entry parameter to set entry file for TeamCity in order to run Tests concurrently
let entry = 'src/app/spec-entry.ts';
if (process.env.npm_config_entry) {
    entry = `src/app/spec-entries/${process.env.npm_config_entry}`;
} else {
    writeTestPatternFile(process.env.npm_config_spec);
}

const env = process.env.npm_config_env;
// --sourcemap parameter to generate sourcemaps and code coverage report
const coverage = process.env.npm_config_sourcemap;

module.exports = function karmaConfig(config) {
    const karmaConfig = {
        basePath: '../..',
        frameworks: ['jasmine'],
        files: [
            entry
        ],
        preprocessors: {
            'src/app/**/*.ts': (coverage) ? ['webpack', 'sourcemap'] : ['webpack']
        },
        // logLevel: config.LOG_DEBUG,
        logLevel: config.LOG_INFO,
        colors: true,
        browsers: [((env === 'dist') ? 'Electron' : 'Chrome')],
        singleRun: true,
        webpack: require('./webpack.config.js'),
        webpackMiddleware: {
            colors: true,
            noInfo: true
        },
        reporters: ((env === 'dist') ? ['teamcity'] : ['spec']),
        coverageReporter: {
            reporters: []
        },
        mime: {
            'text/x-typescript': ['ts','tsx']
        },
    };
    // If sourcemap also generate coverage
    if (coverage) {
        karmaConfig.reporters = karmaConfig.reporters.concat(['coverage', 'coverage-istanbul']);
        // karmaConfig.coverageReporter.reporters.push({ type: 'in-memory' });
        karmaConfig.coverageIstanbulReporter = {
            reports: ['html'],
                dir: './build/report/coverage'
        }
    }

    config.set(karmaConfig);
};

function writeTestPatternFile(pattern) {
    pattern = pattern || '';

    const testRunnerPath = path.resolve(process.cwd(), 'src/test-runner.tmp.ts');
    let specsPath = '.';

    if (pattern !== '' && fs.existsSync(path.resolve(process.cwd(), 'src', pattern))) {
        specsPath = path.resolve(process.cwd(), 'src', pattern).replace(/\\/g, '/');
        pattern = '.+spec\\.ts';
    } else {
        pattern += (_.endsWith(pattern, '.spec.ts')) ? '' : '.+spec\\.ts';
    }

    const code = `
/* tslint:disable */ 
let testsContext = (<any>require).context('${specsPath}', true, /${pattern}/i);
testsContext.keys().forEach(testsContext);
if (${pattern.length}) {
    console.log('\\n\\nRunning tests matching pattern /${pattern}/i:\\n\\n * ' + testsContext.keys().join('\\n * ') + '\\n\\n');
} else {
    console.log('\\n\\nRunning ALL tests. Use "gulp test --spec FooController" (FooController can be any basic regex) to only run a subset of the tests (much quicker!)\\n\\n');
}
/* tslint:enable */
`;
    fs.writeFileSync(testRunnerPath, code);
}
