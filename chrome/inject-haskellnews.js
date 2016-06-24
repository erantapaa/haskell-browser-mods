function insert_script(resource) {
  var s = document.createElement('script');
  s.src = chrome.extension.getURL(resource);
  document.head.appendChild(s);
}

insert_script("haskellnews.js")
console.log("=== done in hn.js")
