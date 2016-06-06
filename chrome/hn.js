
var script = document.createElement('script');

var js ='\
 \
function add_hdiff(n, oldhtml) { \
  var href = this.href; \
  $(this).attr("seen", 1); \
  var m = href.match("haskell.org.package/(.*?)-([0-9][^/]*)$"); \
  if (m) { \
    var url = "http://hdiff.luite.com/cgit/" + m[1] + "/diff/?tag=" + m[2]; \
    return \' <a href="\' + url + \'" target="_blank">(hdiff)</a> \'; \
  } else { \
    return ""; \
  } \
} \
 \
function add_hdiff_links() { \
  $("table.table a[seen!=1][href^=\'https://hackage.haskell.org/package/\']").after(add_hdiff); \
} \
 \
function update_items() { \
  getNewItems(); \
  add_hdiff_links(); \
} \
 \
(function() { \
  var old_setInterval = window.setInterval; \
  window.setInterval = function() { return 10 }; \
  var last = old_setInterval(";", 1000); \
  for (var i = 0; i <= last; i++) { clearInterval(i); } \
  old_setInterval(update_items, 20*1000); \
  old_setInterval(refreshDates, 1000); \
  add_hdiff_links(); \
})(); \
 \
';

var code = document.createTextNode(js)
script.appendChild(code);
(document.head).appendChild(script)

console.log("=== done in hn.js")

