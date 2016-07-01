
console.log("loaded hayoo.js")

function fix_hackage_links() {
  console.log("in fix_hackage_links")
  // find all links to hackage docs with fragments
  var links = document.getElementsByTagName("a")
  console.log("number of links: " + links.length)
  var found = []
  var mk_handler = function(x) {
    return function(e) { goto_hackage(x,e); return false }
  }

  for (var i = 0; i < links.length; i++) {
    var href = links[i].getAttribute("href")
    if (href && href.match("https?://hackage.haskell.org/package/[^/]*[^\\d]/.*#")) {
      links[i].addEventListener("click",  mk_handler(href) )
      // links[i].style.backgroundColor = "pink"
      // links[i].removeAttribute("href")
    }
  }
}

var LATEST_SERVER = "http://104.236.145.46:3001/latest/"

// lookup the latest version with docs of a package on Hackage
// next is a callback and is called with the returned version
function lookup_latest(pkgname, next) {
  var http = new XMLHttpRequest()
  var query = LATEST_SERVER + pkgname
  http.open("GET", query, true)
  var complete = function(e) {
    if (http.status == 200) {
      var json = JSON.parse(http.responseText)
      if (json && json.version) {
        next(json.version)
        return
      }
    }
    next(null)
    return
  }
  http.addEventListener("load", complete, false);
  http.addEventListener("error", function() { next(null) }, false)
  http.addEventListener("abort", function() { next(null) }, false)
  http.send()
}

function test_lookup(pkgname) {
  lookup_latest(pkgname, function(v) { console.log("latest version for " + pkgname + " is:", v) } )
}

function parse_package(url) {
  var m = url.match(/^(https?:\/\/hackage.haskell.org\/package\/)([^\/]*)(.*)/)
  if (m) {
    if (! m[2].match(/-\d[\d\.]*$/)) {
      return { pre: m[1] + m[2], post: m[3], package: m[2] }
    }
  }
  return null
}

function goto_hackage(url, e) {
  console.log("goto_hackage, url: " + url)

  var pkg = parse_package(url)
  if (pkg) {
    e.preventDefault()
    lookup_latest(pkg.package, function(version) {
      if (version) {
        var newurl = pkg.pre + "-" + version + pkg.post
        console.log("=== new url: " + newurl)
        window.location.href = newurl
      } else {
        // go to the original url
        console.log("=== going to original url")
        window.location.href = url
      }
    })
    return false
  } else {
    return true
  }
}

function done(e) {
  console.log("=== done (hayoo.js): ", e.target)
}

function doit(url) {
  var http = new XMLHttpRequest()
  http.open("GET", url, true)
  http.addEventListener("load", done, false);
  http.send()
}

function makeMores() {
  console.log("in my makeMores")
}

function countContentDivs() {
  var divs = document.getElementsByClassName("content")
  console.log("=== count of content divs:", divs.length)
}

fix_hackage_links()
countContentDivs()


