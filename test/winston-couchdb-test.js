/**
 * @todo add pouchdb for local testing
 */

require('abstract-winston-transport')({
  name: 'CouchDB',
  Transport: require('../lib/winston-couchdb'),
  construct: {
    url: 'http://username:password09@127.0.0.1:5984',
    db: 'winston-test'
  }
  // Not sure if these are still necessary, the general tests case are not implemented, yet
  // query: true,
  // stream: true
})
