
var script = document.createElement('script');

var js ='\
@include hn-injected.js
';

var code = document.createTextNode(js)
script.appendChild(code);
(document.head).appendChild(script)

console.log("=== done in hn.js")

