//
// run tests with:
//
//  node tests.js

var t = require("./hackage.js")

function should_be(f, arg, expected) {
  var got = f(arg)
  if (got === expected) {
    console.log("PASSED")
  } else {
    console.log("FAILED -      got:", got)
    console.log("         expected:", expected)
  }
}

function has_kv_pairs(f, arg, kv_pairs) {
  var obj = f(arg)
  // obj must be an object
  if (!obj) {
    console.log("for arg:", arg)
    console.log("  -- returned value is not an object:", obj)
    return
  }
  var errors = 0
  for (var key in kv_pairs) {
    if (!kv_pairs.hasOwnProperty(key)) { continue; }
    var got = obj[key]
    if (!(got === kv_pairs[key])) {
      if (errors == 0) {
        console.log("for arg:", arg)
      }
      errors++
      console.log(" - FAILED for key ", key)
      console.log("        got:", got)
      console.log("   expected:", kv_pairs[key])
    }
  }
  if (errors == 0) {
    console.log("PASSED")
  } else {
    console.log(obj)
  }
}

should_be(t.url_path, "http://cnn.com", "")
should_be(t.url_path, "http://hackage.haskell.org/foo", "foo")
should_be(t.url_path, "http://hackage.haskell.org/foo/bar/baz.html#asd",
                      "foo/bar/baz.html#asd")

var parse_tests = [
  { arg: "package/sproxy-0.9.6",
    expected: { area: "contents", package: "sproxy", version: "0.9.6", fragment: "" }
  },
  { arg: "package/arithmoi-0.4.2.0/docs/Math-NumberTheory-Powers-Fourth.html",
    expected: { area: "docs-mod", package: "arithmoi", version: "0.4.2.0", fragment: "" }
  },
  { arg: "package/exp-extended-0.1.1.1/docs/src/Numeric-ExpExtended.html#ExpExtendable",
    expected: { area: "docs-src", package: "exp-extended", version: "0.1.1.1", fragment: "#ExpExtendable" }
  },
  { arg: "package/integer-gmp-1.0.0.1/docs/doc-index.html",
    expected: { area: "doc-index", subarea: "", package: "integer-gmp", version: "1.0.0.1", fragment: "" }
  },
  { arg: "package/transformers-0.4.2.0/docs/doc-index-All.html",
    expected: { area: "doc-index", subarea: "All", package: "transformers", version: "0.4.2.0", fragment: "" }
  }
];

// https://hackage.haskell.org/package/transformers-0.4.2.0/docs/doc-index-All.html

// test t.parse_url
for (var i = 0; i < parse_tests.length; i++) {
  var params = parse_tests[i]
  has_kv_pairs(t.parse_url, params.arg, params.expected)
}

// test t.parse_full_url
for (var i = 0; i < parse_tests.length; i++) {
  var params = parse_tests[i]
  var url = "https://hackage.haskell.org/" + params.arg
  has_kv_pairs(t.parse_full_url, url, params.expected)
}

/*
has_kv_pairs(
  t.parse_url,
  "package/sproxy-0.9.6",
  { area: "contents", package: "sproxy", version: "0.9.6", fragment: "" }
)

has_kv_pairs(
  t.parse_url,
  "package/arithmoi-0.4.2.0/docs/Math-NumberTheory-Powers-Fourth.html",
  { area: "docs-mod", package: "arithmoi", version: "0.4.2.0", fragment: "" }
)

has_kv_pairs(
  t.parse_url,
  "package/exp-extended-0.1.1.1/docs/src/Numeric-ExpExtended.html#ExpExtendable",
  { area: "docs-src", package: "exp-extended", version: "0.1.1.1",
    fragment: "#ExpExtendable" }
)

has_kv_pairs(
  t.parse_full_url,
  "package/arithmoi-0.4.2.0/docs/Math-NumberTheory-Powers-Fourth.html",
  { area: "docs-mod", package: "arithmoi", version: "0.4.2.0", fragment: "" }
)
*/

