
# haskell-browser-mods

Inspired by and icons borrowed from [hackage-fu](https://github.com/statusfailed/hackage-fu).

This is a simple Chrome/Safari browser extension to make navigating around the
Haskell interwebs more convenient. It modifies pages on various Haskell-related
websites to create inter-site links, add information and generally making it
easier to find and search for information.

I consider the project to still be in its "proof of concept" stage and the code to be of
alpha quality. Still, I've found it useful and I use it on a daily basis.  Suggestions,
 bug reports and PR's are welcome.

## Installation

The extension is currently available for Sarafi and Chrome.

For Chrome users, load the unpacked extension located in the `chrome` directory.

For Safari users, load the extension located in the directory `safari/haskell-browser-mods.safariextension`.

## Tour

Here is an overview of the what the extension does.

#### haskellnews.org

- Buttons have been added to filter news items by source.
- News items for Hackage have an `(hdiff)` link added to them to navigate to the hdiff page for that package.

__Example:__ http://haskellnews.org

#### hdiff.luite.org

When visiting a diff page on hdiff.luite.org the Hackage URL at the top of the page is made clickable.

__Example:__ http://hdiff.luite.com/cgit/uri-bytestring/diff/

#### haskell.org - package front page

When visiting the front page for a package, several new links are added:

- link added to the package's reverse dependencies
- link added to hdiff.luite.com` for source diffs
- link added to the all index page (*)
- if the Source Repository is a `git:github.com/...` link it will be transformed
to `https://github.com/...` so you can click on it.

__Example:__ http://hackage.haskell.org/package/persistent-2.5#additional-info

See the "Additional Links" and "Doc Index" sections for the new links.

(*) If documentation for the specific version of the package is not
available, the "Doc Index" section will display links for the
latest preceding version for which docs exist.

For the example link, the docs for `persistent-2.5` do not exist. Therefore
the "Doc Index" links will navigate to the docs for version 2.2.4 which is the
most recent preceding version which has documentation.

#### haskell.org - non-existent doc pages

When attempting to visit a documentation page which doesn't exist,
navigation links will appear for the latest preceding version of
the pacakge which does have doc pages.

__Example:__ http://hackage.haskell.org/package/persistent-2.5/docs/Database-Persist.html#v:mapToJSON

#### haskell.org - module doc pages

When on a module documentation page, pressing 's' will show/hide the Synopsis panel.

__Example:__ http://hackage.haskell.org/package/persistent-2.2.4/docs/Database-Persist.html#v:mapToJSON

#### haskell.org - package index pages

When on a doc index page, pressing ESC will being up an autocomplete search box.

__Example:__ http://hackage.haskell.org/package/blaze-html-0.8.1.1/docs/doc-index-All.html

