

// return true if href is an Other link
function show_other(href) {
  for (var i = 0; i < sections.length; i++) {
    var prefix = sections[i].url
    if (prefix && href.substring(0,prefix.length) == prefix) {
      return false;
    }
  }
  return true
}

function show_mixed(href) {
  return true
}

function show_begins_with(prefix) {
  return function(href) {
    return (href.substring(0, prefix.length) == prefix)
  }
}

var sections = [
  { id: 'show_twitter',
    label: "Twitter",
    url: "https://twitter.com/"
  },
  { id: 'show_reddit',
    label: "Reddit",
    url: "http://www.reddit.com"
  },
  { id: 'show_hackage',
    label: "Hackage",
    url: 'https://hackage.haskell.org/package/'
  },
  { id: 'show_haskellcafe',
    label: "Haskell Cafe",
    url: 'https://groups.google.com/'
  },
  { id: 'show_stackoverflow',
    label: "Stack Overflow",
    url: 'http://stackoverflow.com/'
  },
  { id: 'show_github',
    label: "Github",
    url: 'https://github.com/'
  },
  { id: 'show_lpaste',
    label: "lpaste",
    url: 'http://lpaste.net/'
  },
  { id: 'show_other',
    label: 'Other',
    matches: show_other
  },
  { id: 'show_all',  // this is not created
    label: "Mixed",
    matches: show_mixed
  },
]

function add_hdiff(n, oldhtml) {
  var href = this.href;
  $(this).attr("seen", 1);
  var m = href.match("haskell.org.package/(.*?)-([0-9][^/]*)$");
  if (m) {
    var url = "http://hdiff.luite.com/cgit/" + m[1] + "/diff/?tag=" + m[2];
    return ' <a ignore=1 href="' + url + '" target="_blank">(hdiff)</a> ';
  } else {
    return "";
  }
}

function add_hdiff_links() {
  $("table.table a[seen!=1][href^='https://hackage.haskell.org/package/']").after(add_hdiff);
}

function update_items() {
  getNewItems();
  add_hdiff_links();
}

function toggleButton(sect_id, show) {
  var sel = "#" + sect_id
  if (show) {
    $(sel).parent().addClass('active')
  } else {
    $(sel).parent().removeClass('active')
  }
}

function handleToggle(sect_id) {
  console.log("sect_id:", sect_id)
  state = sect_id
  // toggle the buttons

  for (var i = 0; i < sections.length; i++) {
    var id = sections[i].id
    toggleButton( id, id == sect_id )
  }

  console.log("--- here after toggling buttons")

  // find the url prefix for the section

  var found;
  for (var i = 0; i < sections.length; i++) {
    if (sections[i].id == sect_id) {
      found = sections[i]
      break
    }
  }

  if (found) {
    if ("matches" in found) {
      show_fn = found.matches
    } else {
      show_fn = show_begins_with(found.url)
    }
    console.log("found.id: " + found.id)
    $("table.table a[href]").not("[ignore]").each(function() {
      var href = $(this).attr("href")
      var which = show_fn(href)
      $(this).parent().parent().toggle(which)
    })
  }
}

(function() {
  var href = window.location.href

  // don't do anything on the grouped page
  if (href.indexOf("grouped") >= 0) return;

  var old_setInterval = window.setInterval;
  window.setInterval = function() { console.log("--- setInterval called"); return 10 };
  var last = old_setInterval(";", 1000);
  console.log("--- last:", last)
  for (var i = 0; i <= last; i++) { clearInterval(i); }
  old_setInterval(update_items, 20*1000);
  old_setInterval(refreshDates, 1000);
  add_hdiff_links();

  // Find the Mixed button and make it clickable

  var create_handler = function(s) { return function() { handleToggle(s) } }

  $(".nav-pills li.active a").first().each(function() {
    console.log("-- found the mixed button")
    this.id = "show_all"
    this.onclick = create_handler("show_all")
  })

  var ul = document.getElementsByClassName("nav-pills")[0]
  for (var i = 0; i < sections.length; i++) {
    // skip over the Mixed button
    if (sections[i].id == "show_all") continue // do not create the "Mixed" button

    var li = document.createElement("li")
    var a = document.createElement("a")
    a.id = sections[i].id
    a.innerHTML = sections[i].label
    a.onclick = create_handler( sections[i].id )
    li.appendChild(a)
    ul.appendChild(li)
  }

})();

