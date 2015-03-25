# bunyan-sub

A CLI tool subscribe to [bunyan-hub](https://undozen.github.io/bunyan-hub for log record events.

## install

```bash
npm i -g bunyan-sub
```

## usage

```bash
bunyansub -l level -H -t timestamp
```

* -l/--level [trace|debug|info|warn|error|fatal] as bunyan levels, defaults to trace
* -H/--history if provided, reads history from bunyan-hub, which will keep last 1000 records for each level
* -t/--time timestamp if reads history, this param provide starting time

Other parameters will send to bunyan cli, for example -s or -c, please refer to [bunyan doc on cli usage](https://www.npmjs.com/package/bunyan#cli-usage). If -s not provided, will output new-line determined JSONs.

## license
MIT
