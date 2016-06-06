
# haskell-browser-mods

Inspired by and icons borrowed from [hackage-fu](https://github.com/statusfailed/hackage-fu).

This is a simple Chrome browser extension to make navigating around the
Haskell interwebs more convenient. It modifies pages on various Haskell-related
websites to create inter-site links, add information and generally making it
easier to find and search for information.

NOTE: This is a very much a WIP. It's purpose it to experiment with ways
of improving navigation in and around the various Haskell websites.

The specific changes implemented are:

On `hdiff.luite.com`:

* Make URLs back to Hackage clickable

On `hackage.haskell.org`:

* Link added to `packdeps.haskellers.com` for reverse dependencies
* Link added to `hdiff.luite.com` for source diffs
* Link to latest version of the package with available docs
* Link added to the doc index page (either `doc-index-All.html` if that exists or `doc-index.html`)
* Source Repository links of the form `git://github.com/...` are now clickable
* On index pages, pressing ESC brings up an autocomplete search box for searching the page.

On `haskellnews.org`:

* Links to `hdiff.luite.com` added for new package uploads
