// init project
var express = require('express');
var app = express();

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

var url = process.env.MONGO_URL;

var validURL = require("valid-url");


function createShort(obj){
  
  MongoClient.connect(url, function (err, db) {
  
    var dbEntry = obj;

    if (err) {
      console.log('Unable to create in the mongoDB server. Error:', err);
    }

    else {
      console.log('Connection established to', url);
      db.collection("short-urls").insertOne(dbEntry, function(err, res) {
        if (err) throw err;
        console.log("1 document inserted");
        db.close();
      })
    }
  })
};

app.get("*", function(req, res){
  
  var reqQuery = req.originalUrl.slice(1);
    
  if (validURL.isWebUri(reqQuery)){
    
    var newUrl = "fcc-" + (Math.random() + 1).toString(36).substring(7);
    var result = {"original_url": reqQuery, "short_url": newUrl};
    createShort(result);
    res.end(JSON.stringify(result));
  }
  
  else if (reqQuery.startsWith("fcc-")){
    
    var query = { short_url: reqQuery };

    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      
      db.collection("short-urls").findOne(query, function(err, result){
        
        if (err) throw err;
        
        else if (result != {}){
          res.redirect(result["original_url"])
          db.close()
          }
        
        else {
          res.end("Error: this short url is not in the database.")
        } 
      })
    })
  }
  
  else {res.end("Error: you did not enter a valid url.")}
  
});

app.listen(8080);