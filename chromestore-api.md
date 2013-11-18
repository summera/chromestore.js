# Chromestore.js API Documentation



## Creating and Initializing Chromestore

In order to use chromestore, it must be instantiated and initialized.

### Instantiation

```javascript
var cs = new Chromestore();
```

### Initialization
Initialization is used to ask for specified number of bytes from filesystem.
When initalized, callback will be executed. Callback
is passed a reference to the created chromestore.

init(requestedBytes, callback);

```javascript
cs.init(1024*1024, function(cstore){
	console.log('Chromestore initialized');
});
```

## Querying for Used and Remaining Bytes
In order to ask for the number of used and remaining bytes 
in chromestore, call usedAndRemaining();  This will also 
tell you whether persistent storage.  If not available,
remaining will be 0.

```javascript
cs.usedAndRemaining(function (used,remaining) {
	console.log("Used bytes: "+ used);
	console.log("Remaining bytes: "+ remaining);
});

```

## Working with Directories

### Flags
**Create** - 	If create is true, a file or directory will be created if it does not already exist.
				If create is false, a file or directory will not be created and if it does not already exist
				an error will be thrown.

**Exclusive** - Exclusive only has an effect when used with {create: true}.  When exclusive is true,
				an error will be thrown if the file already exists. 
	

### Creating and Getting Directories
getDir() will create a directory when the create flag is set to true.
Directories will be created recursively if they do not already exist.
This makes it much easier to create directory hierarchies as compared to the 
current filesystem API, where one would have to make sure the parent directory exists
before creating the subdirectory.
A reference to the dirEntry at the end of the path will be passed to the callback.

If create is false, the directory at the end of the path will be fetched if it exists.

getDir(path, flags, callback);

```javascript
cs.getDir('genres/action', {create: true}, function(dirEntry){
	console.log('Directory created');		
});
```

### Renaming Directory
renameDir() is used to rename directories.

renameDir(pathToDirectory, newName);

```javascript
cs.renameDir('genres/rap','renamedDir');
```

### Deleting Directory
deleteDir() will remove a directory.
If you would like to remove a directory and all its contents,
set the recursive flag to true.  If recursive is set to false
and the directory contains contents, an error will be thrown.
Recursive is set to false by default.

deleteDir(path, flags, callback);

```javascript
cs.deleteDir('genres/directoryToDelete', {recursive: false}, function(){
	console.log('Directory deleted');
});
```

## Working with Files

### Flags

### Creating Directory

### Getting Directory

### Renaming Directory

### Deleting Directory

## Getting and Receiving Data

### Getting Data from URL

```javascript
var url = 'https://s3.amazonaws.com/lr-chaos/videos/encoded_files/000/000/548/original/Hands-Elegant-Road-04-22-13.mp4';
console.log('Retrieving data from ' + url);
cs.getData(url, function(data){
		console.log('Bytes Received from ' + url + ': ' + data.byteLength);
});
```

### Getting and Writing Data from URL
```javascript
var url = 'https://s3.amazonaws.com/lr-chaos/videos/encoded_files/000/000/548/original/Hands-Elegant-Road-04-22-13.mp4';
console.log('Retrieving data from ' + url);
cs.getAndWrite(url, 'video.mp4', 'video/mp4', {create: true}, function(){
		
	console.log('Write video complete');
});
```

