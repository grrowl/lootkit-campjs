/*jslint es6: false */
'use strict';

// mongod --dbpath=/data --port 27017

// almost all this copied from the friggin driver website
// also, isn't used at all by the server at the moment.
// <http://mongodb.github.io/node-mongodb-native/2.0/>
var db = {
  url: 'mongodb://localhost:27017/myproject',
  client: require('mongodb').MongoClient,
  connection: null,

  connect: function () {
    var self = this;
    this.client.connect(url, function(err, db) {
      if (err) {
        console.error("DB: Error "+ err);
        return;
      }

      console.log("DB: Connected");
      self.connection = db;
      // db.close();
    });
  },

  createIndexes: function(successCallback, errorCallback) {
    var db = this.connection,
        collection = db.collection('loot');

    // collection.createIndex( { <location field> : "2dsphere" } )
  },

  insert: function(objects, successCallback, errorCallback) {
    // Get the documents collection
    var db = this.connection,
        collection = db.collection('loot');

    // Insert some documents
    collection.insert(objects, function(err, result) {
      if (err) {
        errorCallback(err);
      }
      // at least return the successful ones
      if (result.ops.length) {
        successCallback(result.ops);
      }
    });

  },

  select: function (center, successCallback, errorCallback) {
    // Get the documents collection
    var db = this.connection,
        collection = db.collection('loot'),
        searchParams = {};

    if (center) {
      searchParams.location = {
        $geoNear: center
      };
    }

    collection.find({}).toArray(function(err, docs) {
      if (err) {
        errorCallback(err);
      }
      // at least return the successful ones
      if (docs && docs.length) {
        successCallback(result.ops);
      }
    });
  }
}

var storage = [];

module.exports = function (req, res, next) {

  if (req.url !== '/%22db%22') {
    next();
    return;
  }

  console.log('accessing db, '+ storage.length +' boop beep boop...');

  switch(req.method) {
    case 'GET':
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(storage, null, 2));
      break;

    case 'PUT':
      if (typeof req.body !== 'object') {
        // this is terrible
        console.log("BAD JSON DETECTED", req.body);
        break;
      }

      var lastId = 0;
      for (var i in storage) {
        if (storage._id > lastId)
          lastId = storage._id + 1;
      }

      for (var i in req.body) {
        lastId = lastId + 1;
        req.body[i]._id = lastId;
        storage.push(req.body[i]);
      }

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(req.body, null, 2));
      break;

    default:
      res.end('unknown method');
  }

  next();
}
