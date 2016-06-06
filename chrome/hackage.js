
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
  } else if (parts.length >= 4) {
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

function scrape_package_versions() {
  // extract all versions from the Versions row

  var isVersions = function(i,e) {
    return (this.textContent == "Versions")
  };

  var vstr = 
  $("table.properties th")
    .filter( isVersions )
    .first()
    .siblings("td")
    .first()
    .text()
  ;
  var versions;
  if (vstr) {
    versions = vstr.match(/(\d[\d\.]+)/g)
  } else {
    versions = []
  }
  return versions
}

function change_source_repo_link() {
  // on the contents page, if the Source Repository
  // is a git://github.com/... link, change it to http://github.com/...

  console.log("in change_source_repo_link")

  var isSourceRepo = function(i,e) {
    return (this.textContent == "Source repository")
  }

  $("table.properties th")
    .filter(isSourceRepo)
    .first()
    .siblings("td")
    .first()
    .each(function(i,e) {
      console.log("found this td:", this)
    })
    // .find("a") .each(function(i,e) { console.log("--- and this a:", this) })
    .find("a[href*='git://github.com/']")
    .each(function(i,e) {
      var href = this.href
      if (href.match(/^git:/)) {
        this.href = href.replace(/^git:/, "https:")
        // insert a new text node
        var txt = document.createTextNode(this.href)

        // delete all children of the A tag
        while (this.firstChild) { this.removeChild(this.firstChild) }
        this.appendChild(txt)
      }
    });
}

function contents_page(m) {
  // perform actions on a package's contents page
  //
  // m.package, m.version contain the package name and version

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

  var inner = rev_anchor + '&nbsp;' + hdiff_anchor 
  $("table.properties tbody").append(
   '<tr><th>Additional Info</th><td>' + inner + '</td></tr>'
  )

  change_source_repo_link()
  add_doc_index_control(m)
}

function fmt_doc_cell(loc, found, which, url) {
  var label;
  if (loc.version == found.version) {
    label = "Current version"
  } else {
    label = "Version " + found.version
  }
  return label + ": <a href='" + url + "'>" + which + "</a>"
}

function add_doc_index_control(loc) {
  $("table.properties tbody").append(
   '<tr><th>Doc Index Links</th><td id="doc-index-cell"> (Pending)</td></tr>'
  )
  
  var success = function(found) {

    var url = doc_index_url(found)
    $("#doc-index-cell").html(fmt_doc_cell(loc, found, "Index", url))

    var all_url = doc_index_url(found, "All")
    UrlExists(all_url,
      function() {
        $("#doc-index-cell").html( fmt_doc_cell(loc, found, "All Index", all_url) )
      },
      function() {}
    )
  };

  var failure = function() {
    $("#doc-index-cell").html("No documentation found for any version")
  }

  find_latest_docs(loc,success, failure)
}

function doc_index_url(loc, section) {
  var url = "http://hackage.haskell.org/package/" + loc.package + "-" + loc.version + "/docs/doc-index" + (section ? "-" + section : "") + ".html"
  return url;
}

function UrlExists(url, onSuccess, onFailure)
{
    var http = new XMLHttpRequest();
    http.open('HEAD', url);
    http.onreadystatechange = function() {
        if (this.readyState == this.DONE) {
            if (this.status == 200) {
              onSuccess()
            } else {
              onFailure()
            }
        }
    };
    http.send();
}


function find_latest_docs(loc, onSuccess, onFailure) {

  var check_version = function(m, onSuccess, onFailure) {
    var url = doc_index_url(m)
    console.log("--- check_version trying: ", url)
    UrlExists(url, function() { onSuccess(m) }, onFailure)
  };

  var check_list = function(versions, i, onSuccess, onFailure) {
    if (i >= versions.length) {
      onFailure()
    } else {
      var loc = versions[i]
      check_version(loc, onSuccess, function() {
        check_list(versions, i+1, onSuccess, onFailure)
      })
    }
  };

  // kick everything off
  check_version(loc, onSuccess,
    function() {
      var versions = scrape_package_versions().reverse()
      // console.log("--- versions:", versions)
      var locs = []
      for (var i = 0; i < versions.length; i++) {
        locs.push( { package: loc.package, version: versions[i] } )
      }
      // console.log("--- locs = ", locs)
      check_list(locs, 0, onSuccess, onFailure)
    });

}

function main() {
  var loc = parse_full_url(window.location.href)
  console.log(loc)
  if (!loc) return;

  if (loc.area == "contents") {
    if (!loc.version) {
      loc2 = pkgver_from_html()
    } else {
      loc2 = loc
    }
    contents_page(loc2)

  }
}

if (typeof document === 'undefined') {
  // running under node
  module.exports = {
    url_path: url_path,
    parse_url: parse_url,
    parse_full_url: parse_full_url,
    parse_modname: parse_modname
  }
} else {
  main()
}

