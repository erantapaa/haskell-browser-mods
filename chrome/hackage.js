
// console.log("here in hackage.js")

function url_path(url) {
  // trim the protocol and domain from the front of a url

  if (url.match(/^\//)) {
    return url.replace(/^\//, "");
  }
  return url.replace(/^https?:\/\/([^\/]+)\/?/, "");
}

// parse a module name which appears as a leaf name of a url
function parse_modname(part) {
  if (part.endsWith(".html")) {
    var name = part.slice(0, -5).replace('-','.')
    return name
  }
  return ""
}

function parse_full_url(full_url) {
  var url = url_path(full_url)
  return parse_url(url)
}

function parse_url(url) {
  // return an object with the following keys:
  //
  // area:      either: contents, docs-src, docs-mod, doc-index, doc-index-all
  //                    src, unknown 
  // package:   parsed package name
  // version:   parsed version name (may be empty)
  // fragment:  url fragment (#...)
  //
  // assume url has been stripped of protocol and domain.

  // remove the fragment
  var fparts = url.split('#',2)
  var frag = (fparts.length > 1) ? '#' + fparts[1] : ""

  var url0 = fparts[0]
  var parts = url0.split('/')
  if (parts[0] != 'package') {
    return undefined
  }

  // Example:
  //
  // url:   package/arithmoi-0.4.2.0/docs/Math-NumberTheory-Powers-Fourth.html
  // parts:   0           1           2      3

  var loc = {}
  loc.fragment = frag
  var pkgvers = parts[1]
  var m = pkgvers.match(/^(.*)-(\d[\d\.]*)$/);
  if (m) {
    loc.package = m[1]
    loc.version = m[2]
  } else {
    loc.package = pkgvers
    loc.version = ""
  }

  if (parts.length < 3) {
    loc.area = "contents"
  } else if (parts.length >= 3) {
      var x = parts[3]
      if (x == "src") {
        loc.area = "docs-src"
        loc.module = parse_modname(parts[4])
      } else if (d = x.match(/^doc-index(?:-(.*))?\.html$/)) {
        loc.area = "doc-index"
        loc.subarea = d[1] && d[1].length ? d[1] : ""
      } else if (x.endsWith(".html")) {
        loc.area = "docs-mod"
        loc.module = parse_modname(x)
      }
  } else if (parts[2] == 'src') {
    loc.area = "src"
  } else {
    loc.area = "unknown"
    loc.part2 = parts[2]
  }
  return loc
}

function pkgver_from_html() {
  // determine the package-version from the contents page
  console.log("in pkgver_from_html")

  var dl_anchors = $("div#downloads a").map(function() { return this.href }).get()
  var m;
  for (var i = 0; i < dl_anchors.length; i++) {
    var m = parse_full_url( dl_anchors[i] )
    if (m && m.version) {
      console.log("determined m:", m)
      return m
    }
  }
  return
}

function all_versions() {
  // extract all versions from the Versions row

  $("table.properties th").filter( function(i) {
    // console.log("this:", this, ">" + this.textContent + "<")
    return (this.textContent == "Versions")
  }).first().each(function(i,e) {
    var td = this.nextSibling
    while (td && td.tagName != "TD") {
      td = td.nextSibling
    }
    console.log("td:", td)
    console.log("e:", e, "e.next:", e.nextSibling)
    if (td) {
      var txt = td.textContent
      console.log("versions: ", txt)
    }
  });
}

function add_reverse_depends() {
  // add link to reverse_dependencies
  // http://packdeps.haskellers.com/reverse/4Blocks

  pkgver_from_html()

  var url = window.location.href
  var m = parse_full_url(url)
  if (!m || !m.version) {
    m = pkgver_from_html()
  }
  console.log("m:", m)
  if (m) {
    var revurl = "http://packdeps.haskellers.com/reverse/" + m.package
    var hdiff;
    if (m.version) {
      hdiff = "http://hdiff.luite.com/cgit/"+m.package+"/diff/?tag="+m.version
    } else {
      hdiff = "http://hdiff.luite.com/cgit/"+m.package+"/diff"
    }
    var docs;
    if (m.version) {
      docs = "/package/" + m.package + "-" + m.version + "/docs/doc-index-All.html"
    } else {
      docs = "/package/" + m.package + "/docs/doc-index-All.html"
    }

    var rev_anchor = '<a href="' + revurl + '">(rev-depends)</a>'
    var hdiff_anchor = '<a href="' + hdiff + '">(hdiff)</a>'
    var doc_anchor = '<a href="' + docs + '">(docs)</a>'

    console.log("rev_anchor:", rev_anchor)
    console.log("hdiff_anchor:", hdiff_anchor)

    var inner = rev_anchor + '&nbsp;' + hdiff_anchor + '&nbsp;' + doc_anchor
    $("table.properties tbody").append(
     '<tr><th>Additional Info</th><td>' + inner + '</td></tr>'
    )
  }
}

function main() {
  add_reverse_depends()
}

module.exports = {
  url_path: url_path,
  parse_url: parse_url,
  parse_full_url: parse_full_url,
  parse_modname: parse_modname
}

