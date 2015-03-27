#!/usr/bin/env node

'use strict';
var net = require('net');
var VERSION = require('./package.json').version;
var BVERSION = require('bunyan/package.json').version;
var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;
var bunyanCliPath = require.resolve('bunyan/bin/bunyan');
var PassThrough = require('stream').PassThrough;
var SubStream = require('bunyan-sub-stream');

var argv = process.argv.slice(2);
if (argv.indexOf('--help') > -1 || argv.indexOf('-h') > -1) {
    console.log('\nUsage: bunyansub [options]\n' +
        '\n' +
        'Options:\n' +
        '   -l, --level     subscribed min level, default: TRACE  [trace]\n' +
        '   -H, --history   read history (last 1000 events)\n' +
        '   -t, --time      read history starting from this timestamp  [0]\n' +
        '   -v, --version   print version and exit\n' +
        '\n' +
        'more options will be passed to a spawned bunyan cli process, used as following:' +
        '\n'
    );
    var spawnResult = spawnSync(process.execPath, [bunyanCliPath, '-h'], {
        cwd: process.cwd(),
        env: process.env,
    });
    console.log(spawnResult.stdout.toString());
    //console.error(spawnResult.stderr.toString());
    process.exit(0);
};
if (argv.indexOf('--version') > -1 || argv.indexOf('-v') > -1) {
    console.log('bunyan-sub version: ' + VERSION);
    console.log('bunyan version: ' + BVERSION);
    process.exit(0);
};
var index, history, time, level;
if ((index = Math.max(argv.indexOf('--history'), argv.indexOf('-H'))) > -1) {
    argv.splice(index, 1);
    history = true;
}
if ((index = Math.max(argv.indexOf('--time'), argv.indexOf('-t'))) > -1) {
    history = true;
    time = argv.splice(index, 2)[1];
    time = time.match(/\d{13}/) ? parseInt(time, 10) :
        void 0;
}
if ((index = Math.max(argv.indexOf('--level'), argv.indexOf('-l'))) > -1) {
    level = argv.splice(index, 2)[1];
}
var host = '127.0.0.1';
if ((index = argv.indexOf('--host')) > -1) {
    host = argv.splice(index, 2)[1];
}
var port = 28692;
if ((index = Math.max(argv.indexOf('--port'), argv.indexOf('-p'))) > -1) {
    var _port = parseInt(argv.splice(index, 2)[1], 10);
    if (!isNaN(_port)) {
        port = _port;
    }
}

var pt = new PassThrough;

if (argv.length) {
    pt.pipe(spawn(process.execPath, [bunyanCliPath].concat(argv), {
        cwd: process.cwd(),
        env: process.env,
        stdio: ['pipe', process.stdout, process.stderr],
    }).stdin);
} else {
    pt.pipe(process.stdout);
}

(new SubStream({
    level: level,
    encoding: 'utf-8',
    history: history,
    time: time,
    host: host,
    port: port,
})).pipe(pt);
