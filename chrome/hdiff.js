
function add_hackage_link() {
  var subs = document.getElementsByClassName("sub")

  for (var i = 0; i < subs.length; i++) {
    var elt = subs[i]
    if (elt.tagName != "TD") continue
    // look for a text child node 
    for (var child = elt.firstChild; child; child = child.nextSibling) {
      console.log("child:", child)
      if (child.nodeType != 3) continue;
      var txt = child.textContent
      console.log("txt:", txt)
      m = txt.match(/(https?:\/\/hackage.haskell.org\/package\/\S+)/)
      if (!m) continue
      var before = txt.substr(0, m.index)
      var after = txt.substr(m.index + m[0].length)
      var t1 = document.createTextNode(before)
      var t2 = document.createTextNode(m[0])
      var t3 = document.createTextNode(after)
      var a  = document.createElement('a')
      a.href = m[0]
      a.appendChild(t2)

      var parent = child.parentNode
      parent.insertBefore(t1, child)
      parent.insertBefore(a, child)
      parent.insertBefore(t3, child)
      parent.removeChild(child)
      return // only process one link
    }
  }
  return;
}

console.log("in hdiff.js")
add_hackage_link()

