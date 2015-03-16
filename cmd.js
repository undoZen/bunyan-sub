#!/usr/bin/env node

'use strict';
var net = require('net');
var dnode = require('dnode');
var destroy = require('destroy');
var VERSION = require('./package.json').version;
var BVERSION = require('bunyan/package.json').version;
var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;
var bunyanCliPath = require.resolve('bunyan/bin/bunyan');
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
    time = argv.splice(index, 2)[1];
    time = time.match(/\d{13}/) ? ~~time :
        void 0;
}
if ((index = Math.max(argv.indexOf('--level'), argv.indexOf('-l'))) > -1) {
    level = argv.splice(index, 2)[1];
}

var levelFromName = {
    'trace': 10,
    'debug': 20,
    'info': 30,
    'warn': 40,
    'error': 50,
    'fatal': 60
};

if (!level) {
    level = 10;
} else if (!isNaN(Number(level))) {
    level = ~~level;
    if ([10, 20, 30, 40, 50, 60].indexOf(level) < 0) {
        level = 10;
    }
} else {
    level = levelFromName[level.toString().toLowerCase()] || 10;
}

var log = (function () {
    if (!argv.length) return console.log.bind(console);
    var child = spawn(process.execPath, [bunyanCliPath].concat(argv), {
        cwd: process.cwd(),
        env: process.env,
        stdio: ['pipe', process.stdout, process.stderr],
    });
    return function (json) {
        child.stdin.write(json + '\n');
    }
}());

var d = dnode({
    log: function (rec) {
        log(JSON.stringify(rec));
    },
    getOptions: function (cb) {
        cb({
            readHistory: history,
            historyStartTime: time,
            minLevel: level,
        });
    }
});
d.on('error', console.error.bind(console, 'error'));
d.connect(28692);
d.on('end', function () {
    d.end();
    destroy(d);
});
