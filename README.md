
# haskell-browser-mods

Inspired by and icons borrowed from [hackage-fu](https://github.com/statusfailed/hackage-fu).

This is a simple Chrome/Safari browser extension to make navigating around the
Haskell interwebs more convenient. It modifies pages on various Haskell-related
websites to create inter-site links, add information and generally making it
easier to find and search for information.

I consider the project to still be in its "proof of concept" stage and the code to be of
alpha quality. Still, I've found it useful and I use it on a daily basis.  Suggestions,
comments, bug reports and PR's are welcome.

## Installation

The extension is currently available for Safari and Chrome.

For Chrome users, follow the steps here to load the unpacked extension located in the `chrome` directory:

- https://developer.chrome.com/extensions/getstarted#unpacked

For Safari users, load the extension located in the directory `safari/haskell-browser-mods.safariextension`.

Steps to load an extension into Safari from a directory:

1. [Enable the Develop menu](http://myownapp.com/manuals/tutorial_create_safariextension/#Enable%20Develop%20menu)
2. [Enable Extensions](http://myownapp.com/manuals/tutorial_create_safariextension/#Enable%20Extensions)
3. [Show the Extension Builder](http://myownapp.com/manuals/tutorial_create_safariextension/#Create%20an%20Extension)
4. Click on ["+" in the lower left corner of the Extension Builder](http://blog.jetboystudio.com/articles/safari-extension/safari2.png) and select "Add Extension"
5. Select the directory containing the Safari extension

__Caveat:__ This extension works by injecting JS + CSS and by modifying
the DOM of the pages of various Haskell-related websites.
It goes without saying that the features may cease to work
if the structure or pages of these sites change.

## Tour

Here is an overview of the what the extension does.

#### haskellnews.org

- Buttons have been added to filter news items by source.
- News items for Hackage have an `(hdiff)` link added to them to navigate to the hdiff page for that package.

__Example:__ http://haskellnews.org

#### hdiff.luite.com

When visiting a diff page on hdiff.luite.org the Hackage URL at the top of the page is made clickable.

__Example:__ http://hdiff.luite.com/cgit/uri-bytestring/diff/

#### haskell.org - package front page

When visiting the front page for a package, several new links are added:

- link added to packdeps.haskellers.com for the package's reverse dependencies
- link added to hdiff.luite.com` for source diffs
- link added to the "all index" page (*)
- if the Source Repository is a `git:github.com/...` link it will be transformed
to `https://github.com/...` so you can click on it.

__Example:__ http://hackage.haskell.org/package/persistent-2.5#additional-info

See the "Additional Links" and "Doc Index" sections for the new links.

(*) The "all index" page is the page which contains a list of all names defined in the package,
and this page may either be `docs-index.html` or `docs-index-All.html`.

Moreover, if documentation for the specific version of the package is not
available, the "Doc Index" section will display links for the
latest preceding version for which docs exist.

In the case of the example link, the docs for `persistent-2.5` do not exist. Therefore
the "Doc Index" links point to version 2.2.4.

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

#### hayoo.fh-wedel.de

Expand / collapse control added for doc sections.

__Example:__ http://hayoo.fh-wedel.de/?query=delete

## Safari and Redirects

Safari does not retain the hash part of the url when it encounters an redirect,
and this causes problems when accessing latest-version URLs on Hackage.

Example:

1. A page contains the link `https://hackage.haskell.org/package/base/docs/Prelude.html#v:not`
with the intention of it going to the documentation for the `not` function in the latest version of `base` package.

2. When Safari follows the link Hackage issues a redirect to a version specific page like `https://hackage.haskell.org/package/base-4.9.0.0/docs/Prelude.html`

3. Safari follows the redirect but does not add the the `#v:not` fragment to the end of the url.
Consequently the page is not scrolled to the definition of the `not` function.

To mitigate this problem, the mods for the hayoo site have the ability to call a REST api service
to get the latest version of a package. If the variable `LATEST_API_ENDPOINT` is set
a link to Hackage without an explicit package version will be translated via the service to one
with a version.  See the directory `latest-server` for more details on setting up the server.

