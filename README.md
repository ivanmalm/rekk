# **rekk** - Simplified depedency injection
[![npm package](https://nodei.co/npm/rekk.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/rekk/)

**rekk** is a dependency injection utility. It works similar to the standard Node _require(...)_ but with a few differences:
* You can provide a **partial** (or no) path to the .js-file, and it will use that path to look up the file for you.
* It detects the application root automatically, no more messy paths when injecting dependencies.

## Install
```sh
$ npm install -S rekk
```
## Usage
Assign rekk to a global variable and it can be used throughout your application.
```js
global.req = require('rekk');
```
In the examples below I'm importing a JS-file located at **app/persistance/configuration/config.js**  
If you don't provide the .js-extension, rekk will add it for you.
### Full path
```js
const config = req('app/persistance/configuration/config');
```

### Partial path
```js
const config = req('app/persistance/config');
```
or
```js
const config = req('app/config');
```

### No path
```js
const config = req('config');
```

### How it works
It checks wheather the input string contains a directory (the directory is basically everything before the last forward-slash).
If so, it starts a recursive search from the provided directory, checking every found filename against the one provided to **req(...)**

If no directory at all is provided, like in the _No path_ example above, it will recursively search every directory starting from your application root.  
Depending on the size of your application, this can be **very** performance-heavy, and is usually not recommended.

As we are recursively searching in subdirectories, there might be cases where two or more files have the same name and match the search parameter. Then the file with the **shortest** path from the root will be selected.



#### Notes
Please note that rekk is **synchronous** and is intendeded to be used during application startup.

If no directory name is provided, for example when **rekk** is called like:
```js
var dependency = req('my-module');
```
There is a _significant_ performance impact if done repeatedly, as it has to scan every directory (and it's sub-folders) in the application root. So try to at least provide **one** intial directory.