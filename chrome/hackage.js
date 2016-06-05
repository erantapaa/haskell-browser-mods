
console.log("here in hackage.js")

function pkgver_from_url(url) {
  // determine the package from the url
  // e.g.: http://hackage.haskell.org/package/text-1.2.0.4
  var m = url.match(/hackage.haskell.org\/package\/([^\/]+)-(\d[\d\.]*)/)
  if (m) {
    console.log("m:", m)
    console.log("package:", m[1], "version:", m[2])
    return { package: m[1], version: m[2], pkgversion: m[1] + "-" + m[2]  }
  }
  m = url.match(/hackage.haskell.org\/package\/([^\/]+)/)
  if (m) {
    return { package: m[1], version: "" }
  }
  return
}

function pkgver_from_html() {
  // determine the package-version from the contents page
  console.log("in pkgver_from_html")

  var dl_anchors = $("div#downloads a").map(function() { return this.href }).get()
  var m;
  for (var i = 0; i < dl_anchors.length; i++) {
    var m = pkgver_from_url( dl_anchors[i] )
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
  var m = pkgver_from_url(url)
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

add_reverse_depends()

