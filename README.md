chromestore.js
=============
Chromestore.js is a simple javascript filesystem API for the Chrome browser.

It provides support for persistent file storage in the browser.

The API provides an easy to use interface for:
- Creating files and directories
- Deleting files and directories
- Renaming files and directories
- Writing to files
- Writing large amounts of data obtained from an ajax call to a file
- Getting used and remaining bytes of the filesystem

## Creating and Initializing Chromestore

In order to use chromestore, it must be instantiated and initialized.
Upon instantiation, one can pass in an initial file system schema to be
created upon initialization. The initial file system schema is an array
of javascript objects.  Each object has a path and an optional callback.
The callback will be executed once the corresponding folder tree has been created.

### Instantiation

```javascript
var cs = new Chromestore([
  { path: 'videos/clips' },
  { path: 'audio/wav', callback: function(){ console.log('finished creating audio/wav folder tree') }}
]);
```

### Initialization
Initialization is used to ask for specified number of bytes from filesystem.
When initalized, callback will be executed. Callback
is passed a reference to the created chromestore.

``` javascript
init(requestedBytes, callback);
```

```javascript
cs.init(1024*1024, function(cstore){
    console.log('Chromestore initialized');
});
```

## Querying for Used and Remaining Bytes
In order to ask for the number of used and remaining bytes
in chromestore, call `#usedAndRemaining`. This will also
tell you whether persistent storage. If not available,
`remaining` will be 0.

``` javascript
usedAndRemaining(callback);
```

```javascript
cs.usedAndRemaining(function (used,remaining) {
    console.log("Used bytes: "+ used);
    console.log("Remaining bytes: "+ remaining);
});

```

## Working with Directories

### Flags
**Create** -    If create is true, a file or directory will be created if it does not already exist.
                If create is false, a file or directory will not be created and if it does not already exist
                an error will be thrown.

**Exclusive** - Exclusive only has an effect when used with `{ create: true }`. When exclusive is true,
                an error will be thrown if the file already exists.


### Creating and Getting Directories
`#getDir` will create a directory when the create flag is set to true.
Directories will be created recursively if they do not already exist.
This makes it much easier to create directory hierarchies as compared to the
current filesystem API, where one would have to make sure the parent directory exists
before creating the subdirectory.
A reference to the dirEntry at the end of the path will be passed to the callback.

If create is false, the directory at the end of the path will be fetched if it exists.
Therefore, `#getDir` is used for both creating and getting directories.

``` javascript
getDir(path, flags, callback);
```

```javascript
//Create directory hierarchy root/genres/action
cs.getDir('genres/action', {create: true}, function(dirEntry){
    console.log('Directory created');
});
```

### Renaming Directory
renameDir() is used to rename directories.

``` javascript
renameDir(pathToDirectory, newName);
```

```javascript
//Rename 'rap' directory to 'renamedDir'
cs.renameDir('genres/rap','renamedDir');
```

### Deleting Directory
`#deleteDir` will remove a directory.
If you would like to remove a directory and all its contents,
set the recursive flag to true. If recursive is set to false
and the directory contains contents, an error will be thrown.
Recursive is set to false by default.

``` javascript
deleteDir(path, flags, callback);
```

```javascript
cs.deleteDir('genres/directoryToDelete', {recursive: false}, function(){
    console.log('Directory deleted');
});
```

## Working with Files
Methods for files are very similar to those used for directories,
except you can write to files.

### Flags
Flags are same as described above in directory section.

### Creating and Getting Files
`#getFile` is used for both creating and getting files.
In order to create a file within a directory,
the directory must exist before trying to create a file within it.

``` javascript
getFile(path, flags, callback);
```

```javascript
cs.getFile('fileCreate.txt', {create: true, exclusive: true}, function(fileEntry){
    console.log('File created');
});
```

### Writing to Files
A file does not need to exist before writing to one. If the file does not exist,
and the create flag is set to true, the file will be created and then written to.

``` javascript
write(path, mimetype, data, flags);
```

```javascript
//Create Directory
cs.getDir('genres/action', {create: true}, function(){
    //Create and write to file
    cs.write('genres/action/media.mp4','video/mp4','aaa', {create: true});
});
```

### Renaming Files

``` javascript
renameFile(pathToFile, newName);
```

```javascript
cs.getFile('fileNotRenamed.txt', {create: true, exclusive: true}, function(){
    cs.write('fileNotRenamed.txt', 'text/plain', 'test rename file', {create: false}, function(){
        cs.renameFile('fileNotRenamed.txt', 'fileRenamed.txt');
    });
});
```

### Deleting Files

``` javascript
deleteFile(pathToFile);
```

```javascript
//Create and retrieve 'fileDelete.txt'
cs.getFile('fileDelete.txt', {create: true, exclusive: true}, function(){
    //Write to 'fileDelete.txt'
    cs.write('fileDelete.txt', 'text/plain', 'test delete file', {create: false}, function(){
        //Delete file
        cs.deleteFile('fileDelete.txt');
    });
});
```

### Listing Files and Directories
Prints files and directories at the end of the given path. Defaults to root when not specified.
Returns an array of objects (name, fileEntry) to the callback function.

``` javascript
ls(pathToFile, callback);
```

```javascript
cs.getDir('genres/comedy', {create: true}, function(){
    cs.write('genres/comedy/listedfiles1.txt', 'text/plain', 'test list files 1', {create: true});

    //list all files inside genres/comedy
    cs.ls('genres/comedy', function(arr) {
        var length = arr.length;

        for(var i =0; i < length; ++i){
            console.log(arr[i].name);
        }
    });
});
```

## Getting and Receiving Data

### Getting Data from URL
Chromestore makes it easy to retrieve data from a remote server.
Currently, this data is returned in an `ArrayBuffer`.
Large amounts of data can be fetched, used, and integrated into the local filesystem.

```javascript
var url = 'https://s3.amazonaws.com/lr-chaos/videos/encoded_files/000/000/548/original/Hands-Elegant-Road-04-22-13.mp4';
console.log('Retrieving data from ' + url);
cs.getData(url, function(data){
    console.log('Bytes Received from ' + url + ': ' + data.byteLength);
});
```

### Getting and Writing Data from URL
Chromestore also makes it easy to retrieve and write data to a file all in one step.
This should be used if there is no need to touch the data before storing it
in persisten storage.

```javascript
var url = 'https://s3.amazonaws.com/lr-chaos/videos/encoded_files/000/000/548/original/Hands-Elegant-Road-04-22-13.mp4';
console.log('Retrieving data from ' + url);
cs.getAndWrite(url, 'video.mp4', 'video/mp4', {create: true}, function(){
    console.log('Write video complete');
});
```

# Contributions
Contributions welcome!! :smile:

1. Fork it ( https://github.com/summera/chromestore.js )
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin my-new-feature)
5. Create a new Pull Request

# Sources
http://www.html5rocks.com/en/tutorials/file/filesystem/
http://www.w3.org/TR/file-system-api/
