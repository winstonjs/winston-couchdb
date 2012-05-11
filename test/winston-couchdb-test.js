/*
 * couchdb-test.js: Tests for instances of the Couchdb transport
 *
 * (C) 2011 Max Ogden
 * MIT LICENSE
 *
 */

var path = require('path'),
    vows = require('vows'),
    assert = require('assert'),
    helpers = require('winston/test/helpers'),
    transport = require('winston/test/transports/transport'),
    Couchdb = require('../lib/winston-couchdb').Couchdb;

vows.describe('winston/transports/couchdb').addBatch({
  'An instance of the Couchdb Transport': transport(Couchdb, {
    host: 'localhost',
    port: 5984,
    db: 'logs'
  })
}).export(module);
