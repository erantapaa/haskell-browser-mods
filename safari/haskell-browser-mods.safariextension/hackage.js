
console.log("here in hackage.js")

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
  // rest:      parts [2..]
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

  // all the parts beyond the package-version part
  loc.rest = parts.slice(2).join("/") + loc.fragment

  loc.area = "unknown"

  if (parts.length < 3) {
    loc.area = "contents"
  } else if (parts[2] == "candidate") {
    loc.candidate = 1
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

function loc_contents_url(loc) {
  return loc_package_base_url(loc)
}

function loc_package_base_url(loc) {
  if (loc.version) {
    return  "/package/" + loc.package + "-" + loc.version
  } else {
    return "/package/" + loc.package
  }
}

function loc_doc_url(loc, subarea) {
  if (subarea) {
    return loc_package_base_url(loc) + "/docs/doc-index-" + subarea + ".html"
  } else {
    return loc_package_base_url(loc) + "/docs/doc-index.html"
  }
}

function html_links_list(links) {
  var html = "<ul>"
  for (var i = 0; i < links.length; i++) {
    html += "<li>" + atag(links[i].href, links[i].text)
  }
  html += "</ul>"
  return html
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

function FetchUrl(url, onDone) {

    var http = new XMLHttpRequest();
    http.open('GET', url);
    http.onreadystatechange = function() {
        if (this.readyState == this.DONE) {
            onDone(this)
        }
    };
    http.send();
}

function fetch_package_versions(package, onSuccess, onFailure) {
  var href = window.location.href
  var proto = href.split(':', 2)[0]
  var url = proto + "://hackage.haskell.org/package/" + package
  console.log("fetch_package_versions url:", url)

  FetchUrl(url, function(xhr) {
    var rtext = xhr.responseText
    console.log("xhr.status:", xhr.status)
    if (xhr.status == 200) {
      var re = new RegExp('href="/package/' + package + '-([0-9][0-9.]*)"', 'g')
      var matches = []
      var m;
      while (m = re.exec(rtext)) {
        matches.push(m[1]+"")
      }
      onSuccess(matches)
    } else {
      onFailure("status: " + xhr.status)
    }
  })
}

function cached_versions(loc) {
  if (!loc.versions) {
    console.log("scraping versions")
    loc.versions = scrape_package_versions()
  }
  return loc.versions
}

function scrape_package_versions() {
  // extract all versions from the Versions row (on the current page)

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

function fixup_index_link(loc) {
  var all_url = loc_doc_url(loc, "All")
  // in div package-header look for doc-index.html
  UrlExists(all_url, function() {
                       console.log("fixup_index_link: updating Index url")
                       loc.best_index_url = "doc-index-All.html"
                       $("a[href='doc-index.html']")
                         .attr("href", "doc-index-All.html")
                     },
                     function() {
                       console.log("did not find:", all_url)
                     })
}

function fixup_source_repo_link() {
  // on the contents page, if the Source Repository
  // is a git://github.com/... link, change it to http://github.com/...

  console.log("in fixup_source_repo_link")

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

function visiting_contents_page(m) {
  var loc = m
  // perform actions on a package's contents page
  //
  // m.package, m.version contain the package name and version

  var revurl = "http://packdeps.haskellers.com/reverse/" + loc.package
  var hdiff;
  if (loc.version) {
    hdiff = "http://hdiff.luite.com/cgit/"+loc.package+"/diff/?id="+loc.version
  } else {
    hdiff = "http://hdiff.luite.com/cgit/"+loc.package+"/diff"
  }
  var docs;
  if (loc.version) {
    docs = "/package/" + loc.package + "-" + loc.version + "/docs/doc-index-All.html"
  } else {
    docs = "/package/" + loc.package + "/docs/doc-index-All.html"
  }

  var rev_anchor = atag(revurl, '(rev-depends)')
  var hdiff_anchor = atag(hdiff, '(hdiff)')

  console.log("rev_anchor:", rev_anchor)
  console.log("hdiff_anchor:", hdiff_anchor)

  var inner = rev_anchor + '&nbsp;'
  $("table.properties tbody").append(
   '<tr><th>Additional Info</th><td id="hdiff-td">' + inner + '</td></tr>'
  )

  var versions = cached_versions(loc)
  if (versions.length) {
    if (!loc.version) {
      loc.version = versions[ versions.length-1 ]
    }
    // create select element
    var select = build_hdiff_options(loc, versions)
    select.value = loc.version
    select.onchange = function() {
      var v = this.value
      var url = "http://hdiff.luite.com/cgit/" + loc.package + "/diff/?id=" + loc.version
      if (v.length) {
        url += "&id2=" + v
      }
      console.log("hdiff url:", url)
      window.location.href = url
    }
    var txt = document.createTextNode("hdiff with: ")
    $("#hdiff-td").append(txt).append(select)
  } else {
    console.log("no versions found")
    // unable to parse any versions
    var a = document.createElement("a")
    a.href = hdiff
    a.innerHTML = "(hdiff)"
    $("#hdiff-td").append(a)
  }

  fixup_source_repo_link()
  add_doc_index_control(loc)
}

function build_hdiff_options(loc, versions) {
  // versions is the list of versions for this package
  var pkg = loc.package
  var prefix = "http://hdiff.luite.com/" + pkg + "/diff?id=" + loc.version
  var select =  document.createElement("select")
  for (var i = versions.length-1; i >= 0; i--) {
    var opt = document.createElement("option")
    opt.value = versions[i]
    if (versions[i] == loc.version) {
      opt.innerHTML = "(" + versions[i] + ")"
    } else {
      opt.innerHTML = versions[i]
    }
    select.appendChild(opt)
  }

  // add the empty repo option if this is first version
  if (versions[0] == loc.version) {
    var opt = document.createElement("option")
    opt.value=""
    opt.innerHTML = "(empty repo)"
    select.appendChild(opt)
  }
  return select
}

function atag(url, inner) {
  return "<a href='" + url + "'>" + inner + "</a>"
}

function fmt_doc_cell(loc, found, which, url) {
  var label;
  if (loc.version == found.version) {
    label = "Current version"
  } else {
    var u = "http://hackage.haskell.org/package/" + found.package + "-" + found.version
    label = "Version " + atag(u, found.version )
  }
  return label + ": " + atag(url, which)
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

  var get_docs = function() {
    return cached_versions(loc).reverse()
  };

  find_latest_docs(loc, get_docs, success, failure)
}

function doc_index_url(loc, section) {
  var url = "/package/" + loc.package + "-" + loc.version + "/docs/doc-index" + (section ? "-" + section : "") + ".html"
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

function check_version(loc, onSuccess, onFailure) {
    var url = doc_index_url(loc)
    console.log("--- check_version trying: ", url)
    UrlExists(url, function() { onSuccess(loc) }, onFailure)
  };

function check_list(versions, i, onSuccess, onFailure) {
    console.log("in check_list")
    if (i >= versions.length) {
      onFailure()
    } else {
      var loc = versions[i]
      check_version(loc, onSuccess, function() {
        check_list(versions, i+1, onSuccess, onFailure)
      })
    }
  };

function find_latest_docs(loc, get_versions, onSuccess, onFailure) {

  var tryOthers = function () {
      var versions= get_versions()
      var locs = []
      for (var i = 0; i < versions.length; i++) {
        locs.push( { package: loc.package, version: versions[i] } )
      }
      check_list(locs, 0, onSuccess, onFailure)
    };

  // kick everything off

  check_version(loc, onSuccess, tryOthers)
}

function insert_script(resource) {
  var s = document.createElement('script');
  s.src = safari.extension.baseURI + resource
  document.head.appendChild(s);
}

function insert_css(resource) {
  var link = document.createElement('link')
  link.rel = "stylesheet"
  link.type = "text/css"
  link.href = safari.extension.baseURI + resource
  document.head.appendChild(link)
}

function visiting_doc_index(loc) {
  // are we on a Page Not Found?
  var h1_text = $("#content h1").first().text()
  console.log("h1_text:", h1_text)

  if (h1_text.match(/Package not found/i)) {
    return; // package not found
  } else if (h1_text.match(/Not Found/i)) {
    // version was not found.
    return;
  } else if ( $("div#alphabet").first().length ) {
    // present link to index-All page
    var url = loc_doc_url(loc, "All")
    var links = [ { href: url, text: url } ]
    var html = "Alternative links:" + html_links_list(links)
    var div = document.createElement("div")
    div.innerHTML = html
    $("#content").append(div)
  } else {
    // inject the following tags:
    //  <script src="https://code.jquery.com/jquery-1.12.4.min.js"></script>
    //  <link rel="stylesheet" type="text/css" href="awesomplete.css">
    //  <script src="awesomplete.js"></script>
    //  <script src="main.js"></script>
    console.log("=== in visiting_doc_index")
    // injection is done in main for Safari
    // insert_script("jquery-1.12.4.min.js")
    // insert_css("awesomplete.css")
    // insert_script("haddock-index.js")
  }
}

function visiting_docs_mod(loc) {
  // fixup the [Index] link
  console.log("in visiting_docs_mod")
  // insert_css("ocean-patch.css")
  fixup_index_link(loc)
  // fixup the synopsis div
  $("#synopsis").addClass("synopsis-right")
}

function on_not_found_page(loc) {
  var h1_text = $("#content h1").first().text()
  console.log("h1_text:", h1_text)
  if (h1_text.match(/Package not found/i)) {
    return false;  // not able to handle this right now
  }

  if (h1_text.match(/Not found/i)) {
    var presentAlternative = function(alt) {
      // insert a new div at the end

      var p = loc.package
      var v = alt.version
      var contents_url = "/package/"+p+"-"+v
      var dest_url     = "/package/"+p+"-"+v+ "/" + loc.rest

      var links = [ { href: dest_url, text: dest_url },
                    { href: contents_url, text: contents_url } ]

      var html = "Alternative links:" + html_links_list(links)

      var div = document.createElement('div')
      div.innerHTML = html
      $("#content").append(div)
    };
    find_alternative_docs(loc, presentAlternative, reportFailure)
    return True;  // signal that we're handling it
  }
}

function reportFailure(msg) {
  console.log("failed:", msg)
}

function reportConsole(msg) {
  console.log("succeeded:", msg)
}

function find_alternative_docs(loc, onSuccess, onFailure) {
  // package is ok
  console.log("in find_alternative_docs")

  fetch_package_versions(
    loc.package,
    function(versions) {
      console.log("versions:", versions)
      var locs = []
      for (var i = versions.length-1; i >= 0; i--) {
        locs.push( { package: loc.package, version: versions[i] } )
      }
      check_list(locs, 0, onSuccess, onFailure)
    },
    onFailure
  )
}

function set_classes(classNames, on, off) {
  var names = classNames.split(' ')
  var newNames = []
  var found = false
  for (var i = 0; i < names.length; i++) {
    if (names[i] == on) {
      if (found) continue
      found = true
      newNames.push(on)
    } else if (names[i] == off) {
      continue
    } else {
      console.log("adding", names[i], names[i] == on, names[i] == off)
      newNames.push(names[i])
    }
  }
  if (!found) {
    newNames.push(on)
  }
  return newNames.join(' ')
}

function toggle_classes(classNames, on, off) {
  var names = classNames.split(' ')
  var newNames = []
  var found = false
  for (var i = 0; i < names.length; i++) {
    if (names[i] == on) {
      if (found) continue
      found = true
      newNames.push(off)
    } else if (names[i] == off) {
      if (found) continue
      found = true
      newNames.push(on)
    } else {
      newNames.push(names[i])
    }
  }
  return newNames.join(' ')
}

function toggle_synopsis(e) {
  // secton.syn show <-> hide
  // control.syn expander <-> collapser
  console.log("--- here in toggle synopsis")

  // determine the size of #synopsis
  var syndiv = document.getElementById("synopsis")

  $("#section\\.syn").first().each(function() {
    this.className = toggle_classes(this.className, "hide", "show")
  })
  $("#control\\.syn").first().each(function() {
    this.className = toggle_classes(this.className, "expander", "collapser")
  })

  var section_syn = document.getElementById("section.syn")
  var expanding = section_syn.className.indexOf("show") >= 0
  // console.log("expanding:", expanding)
  if (expanding) {
    // console.log("after width:", syndiv.getBoundingClientRect().width)
    // console.log("window width: ",  $(window).width())
    var syn_width = syndiv.getBoundingClientRect().width
    var window_width = $(window).width()
    if (syn_width >= window_width) {
      syndiv.className = set_classes(syndiv.className, "synopsis-left", "synopsis-right")
    } else {
      syndiv.className = set_classes(syndiv.className, "synopsis-right", "synopsis-left")
    }
  } else {
    // collapsing - always set to synopsis-left
    syndiv.className = set_classes(syndiv.className, "synopsis-right", "synopsis-left")
  }
}

function handle_keypress(e,loc) {
  var ch = (typeof e.which == "number") ? e.which : e.keyCode
  console.log("got char code:", ch)
  if (ch == 115) {
    console.log("--- toggling synopsis")
    toggle_synopsis(e)
  } else if (ch == 99) {
    console.log("--- goto contents")
    window.location.href = loc_contents_url(loc)
  } else if (ch == 105) {
    console.log("--- goto index")
    var dest = loc.best_index_url || "doc-index.html"
    window.location.href = dest
  }
}

function install_hot_keys(loc) {
  console.log("--- installing hot keys")
  Mousetrap.bind("s", toggle_synopsis )
  Mousetrap.bind("c", function() { window.location.href = loc_contents_url(loc) })
  Mousetrap.bind("i", function() {
                        console.log("... going to the index")
                        var dest = loc.best_index_url || "doc-index.html"
                        window.location.href = dest
                      })
}

function install_candidate_link(loc) {
  // install a Candidate link in #page-menu
  var url = loc_contents_url(loc)
  $("#page-menu").prepend( '<li>' + "<a href='" + url + "' style='color:red'> Candidate</a>")
}

function main() {
  var loc = parse_full_url(window.location.href)
  console.log(loc)

  if (!loc) return;

  if ((loc.area == "unknown") && loc.candidate) {
    console.log("about to install candidate link")
    install_candidate_link(loc)
  } else {
    console.log("not a candidate:", loc)
  }

  if (loc.area == "contents") {
    if (!loc.version) {
      loc2 = pkgver_from_html()
    } else {
      loc2 = loc
    }
    visiting_contents_page(loc2)
  }

  var on_not_found = false
  if (loc.area == "doc-index" || loc.area == "docs-mod" || loc.area == "docs-src") {
    // check if we're on a Not found page
    on_not_found = on_not_found_page(loc)
  }

 if (!on_not_found) {
   if (loc.area == "doc-index") {
      console.log("in docs-index")
      visiting_doc_index(loc)
    } else if (loc.area == "docs-mod") {
      console.log("in docs-mods")
      visiting_docs_mod(loc);
    }
  }

  // install hot-keys
  console.log("area:", loc.area)
  if ( loc.area == "docs-mod" ) { install_hot_keys(loc) }

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

