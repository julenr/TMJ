'use strict';

const spawn = require('child_process').spawn;

const testSections = [
    'marketplace-property',
    'main-shared',
    'grouped'
];

let numberOpenedSections = testSections.length;
let openedSections = false;
let lastStdout = '';

const tests = {};
testSections.forEach( section => {
    tests[section] = spawn('npm.cmd', [ 'run', '--env=dist', `--entry=spec-entry-${section}.ts`, 'test:tcity']);
    tests[section].stdout.on('data', formatBlocks);
    tests[section].stderr.on('data', data => {
        logStdout(lastStdout);
        logStdout('ERROR on stderr: ' + data + '\n');
    });
    tests[section].on('error', code => {logStdout('ERROR' + code + '\n');});
    tests[section].on('exit', code => {
        if (code > 0) {
            logStdout(`Child exited with code ${code}\n`);
            process.exit(code);
        }
    });
});

function formatBlocks(data) {
    data = data.toString('utf8'); // Sometimes it comes in hex format
    lastStdout = data;
    if (data.includes('blockOpened')) {
        if (openedSections) { return }
        openedSections = true;
    }
    if (data.includes('blockClosed')) {
        if (numberOpenedSections > 1) {
            logStdout(data.replace(/##teamcity\[blockClosed name='JavaScript Unit Tests'\]/i, ''));
            --numberOpenedSections;
        } else {
            logStdout(data);
        }
    } else if (data.includes('##teamcity')) {
        logStdout(data);
    }
}

function logStdout(str) {
    process.stdout.write(str);
}
