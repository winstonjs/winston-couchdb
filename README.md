# winston-couchdb

A full featured CouchDB transport for winston

[![Version npm](https://img.shields.io/npm/v/winston-couchdb.svg?style=flat-square)](https://www.npmjs.com/package/winston-couchdb)
[![npm Downloads](https://img.shields.io/npm/dm/winston-couchdb.svg?style=flat-square)](https://npmcharts.com/compare/winston-couchdb?minimal=true)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)


[![NPM](https://nodei.co/npm/winston-couchdb.png?downloads=true&downloadRank=true)](https://nodei.co/npm/winston-couchdb/)


## Install

```bash
npm i winston winston-couchdb
```

## Setup

```js
const winston = require('winston')
const CouchLogger = require('winston-couchdb')

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.json(),
    winston.format.timestamp()
  ),
  transports: [
    new CouchLogger({ url: 'http://username:password@127.0.0.1:5984', db: 'winston-logs' })
  ]
})

```
