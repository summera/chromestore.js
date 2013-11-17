# Chromestore.js API Documentation



## Creating and Initializing Chromestore

In order to use chromestore, it must be instantiated and initialized.

### Instantiation

```javascript
var cs = new Chromestore();
```

### Initialization
Ask for specified number of bytes from filesystem.
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

### Creating Directory

### Getting Directory

### Renaming Directory

### Deleting Directory

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

