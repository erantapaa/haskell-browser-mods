
function insert_script(resource) {
  var s = document.createElement('script');
  s.src = chrome.extension.getURL(resource);
  // s.onload = function() { this.parentNode.removeChild(this); };
  document.head.appendChild(s);
}

insert_script("hn-injected.js")
console.log("=== done in hn.js")

