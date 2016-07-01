
### Synopsis

```sh
$ ./build-latest
$ node server.js
$ curl http://localhost:3001/latest/HUnit
```

This directory contains a simple nodejs REST api server to serve the latest
version of a package on Hackage that has docs.

After building the sqlite3 database `latest.db` and starting the server,
modify the variable `LATEST_API_ENDPOINT` in the hayoo.js source file to
point to the server, e.g.:

    var LATEST_API_ENDPOINT = "http://{host}:{port}/latest/"

This will cause the browser mod to translate Hackage links without an explicit
package version to one where the version is set to the one returned by the server.
This is useful for Safari users because Safari does not retain the hash part of the
URL when it encounters a redirect.

nodejs modules used:

- express
- sqlite3
- split

