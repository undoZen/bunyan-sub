#!/usr/bin/env node

'use strict';
var net = require('net');
var dnode = require('dnode');
var destroy = require('destroy');
var VERSION = require('./package.json').version;
var opts = require("nomnom")
    .option('level', {
        abbr: 'l',
        default: 'info',
        help: 'subscribed min level, default: INFO'
    })
    .option('history', {
        abbr: 'H',
        flag: true,
        help: 'read history (last 1000 events)'
    })
    .option('time', {
        abbr: 't',
        default: 0,
        help: 'read history starting from this timestamp'
    })
    .option('version', {
        abbr: 'v',
        flag: true,
        help: 'print version and exit',
        callback: function () {
            return "version " + VERSION;
        }
    })
    .parse();

var levelFromName = {
    'trace': 10,
    'debug': 20,
    'info': 30,
    'warn': 40,
    'error': 50,
    'fatal': 60
};

if (!opts.level) {
    opts.level = 30;
} else if (!isNaN(Number(opts.level))) {
    opts.level = ~~opts.level;
    if ([10, 20, 30, 40, 50, 60].indexOf(opts.level) < 0) {
        opts.level = 30;
    }
} else {
    opts.level = levelFromName[opts.level.toString().toLowerCase()] || 30;
}

var d = dnode({
    log: function (rec) {
        console.log(JSON.stringify(rec));
    },
    getOptions: function (cb) {
        cb({
            readHistory: opts.history,
            historyStartTime: opts.time,
            minLevel: opts.level,
        });
    }
});
d.on('error', console.error.bind(console, 'error'));
d.connect(28692);
d.on('end', function () {
    d.end();
    destroy(d);
});
