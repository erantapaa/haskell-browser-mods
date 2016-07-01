
// insert records into latest.db
//
// Typical usage:  tar ztf hoogle.tar.gz | node insert-latest.js

var split = require('split')
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('latest.db');

function processLine (line) {
  var parts = line.split('/')
  if ((parts.length > 2) && parts[1].match(/^\d[\d\.]*$/)) {
    db.run("INSERT OR REPLACE INTO latest_docs (package, version) VALUES (?, ?)", parts[0], parts[1])
    // console.log("added", parts[0], parts[1])
  }
}

function countRows() {
  db.get("SELECT count(*) FROM latest_docs", function(err, count) {
    if (err) {
      console.err("query error:", err)
    } else {
      console.log("row count:", count)
    }
  })
}

db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS latest_docs (package TEXT, version TEXT, PRIMARY KEY (package))")
    process.stdin.pipe( split() ).on('data', processLine).on("end", countRows)
});


