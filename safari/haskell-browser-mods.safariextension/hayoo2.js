

// return a shortened version of div
function shorten(target) {
  // iterate over children
  var child = target.firstChild
  if (!child) return null;
  if (child.tagName == "PRE") {
    return null
  } else {
    // assume a block element - iterate over children of child
    var e = child.firstChild
    var len = 0
    var count = 0
    var e = child.firstChild
    var maxlength = 100
    var last_text = ""
    for (; e; e = e.nextSibling) {
      var newl = len + e.textContent.length
      if (newl > maxlength) {
        if (e.nodeType == 3) { // a text node
          // find first space after
          var text = e.textContent
          var k = text.indexOf(' ', maxlength - len)
          if (k >= 0) {
            last_text = text.substr(0, k)
          } else {
            last_text = text
          }
        } else { // an element
          count++
        }
        break
      }
      len = newl
      count++
    }
    if (e) {
      // need to add More..., copy first n nodes
      var frag = document.createElement(child.tagName)
      var j = 0;
      for (var ee = child.firstChild; ee && (j < count); ee = ee.nextSibling, j++) {
        frag.appendChild( ee.cloneNode(true) )
      }
      frag.appendChild( document.createTextNode(last_text + " ...") )
      return frag
    } else {
      // no need to add ellipses
      if (child.nextSibling) {
        var frag = child.cloneNode(true)
        frag.appendChild( document.createTextNode(" ...") )
        return frag
      } else {
        return null // no need to provide short version
      }
    }
  }
}

function isEllipsisActive(e) {
   var tolerance = 2; // In px. Depends on the font you are using
   return e.offsetWidth + tolerance < e.scrollWidth;
}

// On entry we have this structure:
//
//   <div class="panel-body">
//     <p class="result-subtitle'>...</p>
//     <div class="description more">
//       <div class="preview">
//       <div class="content">
//
//  - or -
//
//   <div class="panel-body">
//     <p class="result-subtitle'>...</p>
//     <div class="description more">...text...</div>
//
// We want this structure:
//
//   <div class="panel-body">
//     <p class="result-subtitle">... {expander}</p>
//     <div class="description more">
//       first child: preview element
//       <div class="content">...</div>


function fix_descriptions() {
  // var content_divs = document.getElementsByClassName("more").length
  // console.log("=== more div count:", content_divs)

  $(".more").each(function() {
    var found = 0
    $(this).find("div.preview").each(function() {
      $(this).remove()
      found = 1
    })

    if (found) {

      // fix up the .content div
      $(this).find(".content").each(function() {
        var text = $(this).text()
        if (text.substr(text.length-4) == "less") {
          text = text.substr(0, text.length-4)
        }
        $(this).html(text)
        $(this).find('*').show()
        $(this).show()
      })

    } else {
      // create the .content div
      var text = $(this).text()
      var div = document.createElement("div")
      div.className = "content"
      $(div).html(text)
      $(this).empty().append(div)
    }
  })

  // shorten each .content div if necessary

  $(document).find(".content").each(function() {
    if (this.firstChild) {
      var short = shorten(this)
      if (short) {

        // create the new preview element as the first child
        // of the .more div
        this.parentNode.insertBefore(short, this.parentNode.firstChild)

        // insert expander span in the result-title paragraph

        var control  = document.createElement("span")
        control.className = "label label-collapsed"
        control.innerHTML = 'expand'
        var this_content = this
        control.onclick = function(e) {
          e.preventDefault()
          if ($(this).hasClass("label-collapsed")) {
            $(this).removeClass("label-collapsed").addClass("label-expanded")
          } else {
            $(this).removeClass("label-expanded").addClass("label-collapsed")
          }
          // toggle children of the .more div
          $(this).parent().parent().find(".more").children().toggle()
          return false;
        }
        $(this).parent().parent().find(".result-subtitle").append(control)

        $(this).hide()
      }
    }
  })
}

console.log("== in hayoo2.js")
$().ready(fix_descriptions)

