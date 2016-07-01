var express = require('express');
var app = express();

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('latest.db');

console.log("Registering endpoint: /");
app.get('/', function(req, res){
    res.send('hello ROOT world');
});

app.get('/latest/:package', function(req, res) {
  db.get("SELECT version FROM latest_docs WHERE package = ?", req.params.package, function(err, row) {
    if (err) {
     console.err(err)
     res.status(300)
    } else {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.json({ "version": row.version })
    }
  })
});

var PORT = 3000
console.log("listening")
app.listen(PORT);
console.log("Submit GET request on http://localhost:"+PORT+"/latest/{package-name}")

