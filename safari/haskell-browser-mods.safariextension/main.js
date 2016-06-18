
function insert_script(resource) {
  var script = document.createElement("script")
  script.src = safari.extension.baseURI + resource
  document.body.appendChild(script)
}

function insert_css(resource) {
  var link = document.createElement('link')
  link.rel = "stylesheet"
  link.type = "text/css"
  link.href = safari.extension.baseURI + resource
  document.head.appendChild(link)
}

function init() {
  var where = window.location.href
  console.log("where:", where)
  if (where.match("hdiff\.luite\.com")) {
    insert_script("hdiff.js")
  } else if (where.match("haskellnews.org")) {
    insert_script("haskellnews.js")
  } else if (where.match('hackage.haskell.org/package')) {
    console.log("I'm in hackage!")
    insert_script("jquery-1.12.4.min.js")
    insert_css("ocean-patch.css")
    // check if on index page
    if (where.match("docs/doc-index(-All)?.html")) {
      console.log("=== in the doc-index area")
      insert_css("awesomplete.css")
      insert_script("haddock-index.js")
    } else {
      console.log("=== not in the doc-index area")
    }
    insert_script("mousetrap.min.js")
    insert_script("hackage.js")
  } else {
    console.log("=== where am I???", where)
  }
}

init()

