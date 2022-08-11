const Transport = require('winston-transport')
const nano = require('nano')

//
// Inherit from `winston-transport` so you can take advantage
// of the base functionality and `.exceptions.handle()`.
//
module.exports = class CouchDB extends Transport {
  /**
   *
   * @param {Object} options
   * @param {string} options.url - CouchDB URL including auth, e.g. http://username:password@localhost:5984
   * @param {string} options.db - database name
   *
   */
  constructor(options) {
    super(options)

    this.name = 'CouchDB'
    this.dbName = options.db || options.database
    this.url = new URL(options.url)
    this.couch = nano(this.url.toString())
    this.db = this.couch.use(this.dbName)
  }

  /**
   * 
   * @param {Logform} info 
   * @param {Function} callback 
   */
  log(info, callback) {
    const couchTransport = this
    const { level, message, ...meta } = info
    const doc = meta || {}
    if (!doc.timestamp) { // if meta does not contain a timestamp, e.g. winston.format.timestamp() is not enabled, add a timestamp
      doc.timestamp = (new Date()).toISOString()
    }
    doc.message = message
    doc.level = level
    doc.type = 'log' // Add a type so that the documents can be found more easily

    couchTransport.db.insert(doc, function (error, body, headers) {
      if (error) {
        // console.log(error)
        if (error.error === 'not_found') {
          // create database and retry
          return couchTransport.#ensureCouchBucket(function () {
            couchTransport.log(info, callback)
          })
        } else {
          couchTransport.emit('error', error)
          if (callback) callback(error, false)
          return
        }
      }
      setImmediate(() => {
        couchTransport.emit('logged', info)
      })

      // Perform the writing to the remote service
      if (callback) callback(null, true)
    })
  }

  query(options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }
    const couchTransport = this
    const query = { include_docs: true }

    if (options.rows) query.limit = options.rows
    if (options.start) query.skip = options.start
    if (options.order === 'desc') query.descending = true
    if (options.from) query.startkey = (new Date(options.from)).toISOString()
    if (options.until) query.endkey = (new Date(options.until)).toISOString()

    couchTransport.db.view('Logs', 'logsByTimestamp', query, function (error, body) {
      if (error) {
        if (error.error === 'not_found') {
          return couchTransport.#ensureCouchView(function (err, body) {
            if (err) {
              console.error(err)
              return callback(error)
            }
            return couchTransport.query(options, callback)
          })
        }
        return callback(error)
      }
      body.rows.forEach((doc) => {
        console.log(doc)
      })
    })
  }

  stream(options) {
    const couchTransport = this

    if (options.start === -1) {
      delete options.start
    }

    if (!options.start) {
      options.start = '0'
    }

    return couchTransport.db.changesAsStream(couchTransport.dbName, {
      include_docs: true,
      feed: 'continuous',
      style: 'main_only',
      descending: false,
      since: options.start
    })
  }

  #ensureCouchBucket(callback) {
    const couchTransport = this
    return couchTransport.couch.db.create(couchTransport.dbName, function (err, body) {
      if (err) {
        console.error(err)
        return callback(err)
      }
      return couchTransport.#ensureCouchView(callback)
    })
  }

  #ensureCouchView(callback) {
    const couchTransport = this
    return couchTransport.db.insert({
      _id: '_design/Logs',
      views: {
        logsByTimestamp: {
          map: function (doc) {
            if (doc.type === 'log') {
              /* global emit */
              emit(doc.timestamp, null)
            }
          }
        }
      }
    }, callback)
  }
}
