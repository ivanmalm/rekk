# **rekk**
**rekk** allows you to require module depencendies similar to how yo would use _require(...)_,
which one very distinct difference, you can provide the directory search depth of your choice (to save IO time looking for files) or just plop in the .js-filename like usual and it will work just as well.

Please note that calls are **synchronous/blocking** and are intendeded to be performed during application startup.

## Install
```sh
$ npm install -S rekk
```
## Usage
It is convenient to assign it to a global variable so it can be used throughout the appliction.
The one below is assigned very early in **bin/www**
```js
global.req = require('rekk');
```
Then you simply call the **req(...)** function like you would with a normal _require_.
In the example below I'm importing a JS-file located at _app/persistance/config_
```js
const config = req('app/persistance/config');
```

### How it works
It checks wheather the input string contains a directory (the directory is basically everything before the last forward-slash).
If so, it starts a recursive search from the provided directory, checking every found filename against the one provided to **req(...)**



#### Notes
##### Performance
If no directory name is provided, for example when **rekk** is called like:
```js
var dependency = req('my-module');
```
There is a _significant_ performance impact if done repeatedly, as it has to scan every directory (and it's sub-folders) in the application root. So try to at least provide **one** intial directory, A cache implementatation the recursive-file search is on my agenda.
##### Misc.
As we are recursively searching in subdirectories, there might be cases where two or more files have the same name and match the search parameter. Then the file with the **shortest** path from the root will be selected.