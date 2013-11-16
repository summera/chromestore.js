/*
	chromestore.js


*/
var ChromeStore = (function(fileSchema) {
	fileSchema = typeof fileSchema !== 'undefined' ? fileSchema : {};
	var fs = null;

	function errorHandler(DOMError) {
		var msg = '';

		switch (DOMError.name) {
			case 'QuotaExceededError':
				msg = 'QuotaExceededError';
				break;
			case 'NotFoundError':
				msg = 'NotFoundError';
				break;
			case 'SecurityError':
				msg = 'SecurityError';
				break;
			case 'InvalidModificationError':
				msg = 'InvalidModificationError';
				break;
			case 'InvalidStateError':
				msg = 'InvalidStateError';
				break;
			default:
				msg = 'Unknown Error';
				break;
		};
		console.log('Error: ' + msg);
	}

	return {

		/*
			Initialize chromestore
			Request persistent filesystem and amount of bytes

			requestedBytes 	[int]: requested size of storage in bytes
			callback 		[function]: function to be executed when initialization is complete.
										passed reference to initialized chromestore.
		*/
		init: function(requestedBytes, callback) {

			//Store this in that to be be used inside nested functions
			var that = this; 

			function requestFS(grantedBytes) {
				window.webkitRequestFileSystem(window.PERSISTENT, grantedBytes, function(filesystem) {
					fs = filesystem;
					console.log ('fs: ', arguments); // I see this on Chrome 27 in Ubuntu
					console.log("Granted Bytes: " + grantedBytes);
					console.log("**********************************");

					if(callback){
						callback(that); //Execute callback
					}
					else{
						console.log('no callback');
					}

				}, errorHandler);
			}

			function getGranted(requestedBytes){
				navigator.webkitPersistentStorage.requestQuota (requestedBytes, function(grantedBytes) {
					console.log("==================================");
					console.log("PERSISTENT STORAGE");
					console.log("==================================");
					console.log("**********************************");
					console.log ('requestQuota: ', arguments);

					requestFS(grantedBytes, callback);

				}, errorHandler);
			}


			getGranted(requestedBytes);

		},

		/*
			Create directory or directories on filesystem.
			Recursively creates directories on passed in path.
			If directory already exists, one is not made.

			path 		[string]: path of directories in which to create
			callback 	[function]: function to be executed when directory has been created
		*/
		createDir: function(path,callback,root) {
			path = (typeof path === 'object' ? path : path.split('/'));
			var rootDir = root ? root : fs.root, that = this;

			// Throw out './' or '/' and move on to prevent something like '/foo/.//bar'.
			if (path[0] == '.' || path[0] == '') {
				path = path.slice(1);
			}

			rootDir.getDirectory(path[0], {create: true}, function(dirEntry) {
				// Recursively add the new subfolder (if we still have another to create).
				if (path.length) {
					that.createDir(path.slice(1),callback,dirEntry);
				}
				else {
					if(callback) callback();
				}
			}, errorHandler);
		},

		/*
			Delete directory

			path 		[string]: path to directory in which to delete
			callback 	[function]: function to be executed when directory has been deleted
		*/
		deleteDir: function(path,callback){
			var rootDir = fs.root;

			rootDir.getDirectory(path,{},function(dirEntry){
				dirEntry.removeRecursively(function(){
					
					//call callback function if specified
					if(callback) callback();
				}, errorHandler);
			}, errorHandler);
		},

		/*
			Rename directory

			path 		[string]: path to directory in which to rename
			newName 	[string]: new name of directory
			callback 	[function]: function to be executed when directory is renamed
		*/
		renameDir: function(path,newName,callback) {
			var rootDir = fs.root;
			var pathArray = path.split('/');
			var pLength = pathArray.length;
			var pathToParent="";

			for(var i = 0; i<=pLength-2; i++){
				pathToParent = pathToParent+pathArray[i]+"/";
			}

			rootDir.getDirectory(pathToParent,{},function(parentDir){
				pathToParent = parentDir;
			},errorHandler);

			rootDir.getDirectory(path,{},function(dirEntry){
				dirEntry.moveTo(pathToParent,newName,function(newDir) {
					console.log(path + ' Directory renamed.');
					
					//call callback function if specified
					if(callback) callback(newDir);
				}, errorHandler);
			}, errorHandler);
		},

		/*	
			Create file 
			Directory in which file is created must exist before
			creating file

			path 		[string]: path to new file
			create 		[boolean]: true creates the file if it doesn't exist,
			exclusive 	[boolean]: true will throw an error if file already exists, false will overwrite contents
			callback 	[function]: function to be executed when file is created. passed the FileEntry object
		*/
		createFile: function(path, create, exclusive, callback) {
			fs.root.getFile(path, {create: create, exclusive: exclusive}, function(fileEntry) {
				if(callback) {callback(fileEntry);}
			}, errorHandler);
		},

		/*
			Delete file

			path [string]: path to file in wich to delete
		*/
		deleteFile: function(path) {
			fs.root.getFile(path, {create: false}, function(fileEntry) {

				fileEntry.remove(function() {
				
				}, errorHandler);

		  	}, errorHandler);
		},

		/*
			Rename file

			path 		[string]: path to file in which to rename
			newName 	[string]: new name of file
			callback	[function]: function in which to execute when file is renamed. 
									passed the FileEntry object
		*/
		renameFile: function(path, newName, callback) {
			var rootDir = fs.root;
			var pathArray = path.split('/');
			var pLength = pathArray.length;
			var pathToParent= "";

			for(var i = 0; i<=pLength-2; i++){
				pathToParent = pathToParent+pathArray[i]+"/";
			}

			rootDir.getDirectory(pathToParent,{},function(parentDir){
				pathToParent = parentDir;
			},errorHandler);

			fs.root.getFile(path, {}, function(fileEntry){
				fileEntry.moveTo(pathToParent, newName,function(){
					console.log('File renamed');

					//call callback function if specified
					if(callback) callback(fileEntry);
				}, errorHandler);
			}, errorHandler);
		},

		/*
			Return the number of used and remaining bytes in filesystem

			callback [function]: function to be executed when used and remaining bytes have been received
									from filesystem.  passed the number of used and remaining bytes
		*/
		usedAndRemaining: function(callback) {
			navigator.webkitPersistentStorage.queryUsageAndQuota(function (used, remaining){
				if(callback){callback(used, remaining);}
			});
		},

		/*

		*/
		createWriter: function() {
			var fw = new FileWriter(fs);
			return fw;
		},

		/*

		*/
		write: function(path, fileType, data, createFlag, callback) {
			var fw = this.createWriter();
			fw.writeData(path, fileType, data, createFlag, callback);
		},
		
		/*

		*/
		createReceiver: function() {
			var receiver = new DataReceiver();
			return receiver;
		},

		/*

		*/
		getData: function(url, callback) {

			var receiver = this.createReceiver();

			receiver.getData(url, callback);
		},

		/*

		*/
		getAndWrite: function(url, path, fileType, createFlag, callback) {
			var that = this;
			this.getData(url, function(data){
				that.write(path, fileType, data, createFlag, callback)
			});
		},

		/*

		*/
		purge: function() {
			var dirReader = fs.root.createReader();
			dirReader.readEntries(function(entries) {
				for (var i = 0, entry; entry = entries[i]; ++i) {
					if (entry.isDirectory) {
						entry.removeRecursively(function() {}, errorHandler);
					} else {
						entry.remove(function() {}, errorHandler);
					}
				}
				console.log('Local storage emptied.');
			}, errorHandler);
		},

		/*

		*/
		listFiles: function(path) {
			var dirReader = fs.root.createReader();
			dirReader.readEntries(function(entries) {
				if (!entries.length) {
					console.log('Filesystem is empty.');
				}

				for (var i = 0, entry; entry = entries[i]; ++i) {
					console.log(entry.name);
				}
			}, errorHandler);
		}

	};

});

/*

*/
var FileWriter = (function(filesystem) {
	var fs = filesystem;
	function errorHandler(DOMError) {
		var msg = '';

		switch (DOMError.name) {
			case 'QuotaExceededError':
				msg = 'QuotaExceededError';
				break;
			case 'NotFoundError':
				msg = 'NotFoundError';
				break;
			case 'SecurityError':
				msg = 'SecurityError';
				break;
			case 'InvalidModificationError':
				msg = 'InvalidModificationError';
				break;
			case 'InvalidStateError':
				msg = 'InvalidStateError';
				break;
			default:
				msg = 'Unknown Error';
				break;
		};
		console.log('Error: ' + msg);
	}

	return {
		/*

		*/
		writeData: function(path, fileType, data, createFlag, callback){
			fs.root.getFile(path, {create: createFlag}, function(fileEntry) {

				// Create a FileWriter object for our FileEntry (log.txt).
				fileEntry.createWriter(function(fileWriter) {

					fileWriter.onwriteend = function(e) {
						console.log('Write completed.');
						if(callback) {callback(fileEntry);}
					};

					fileWriter.onerror = function(e) {
						console.log('Write failed: ' + e.toString());
					};

					// Create a new Blob and write it to log.txt.
					var blob = new Blob([data], {type: fileType});

					fileWriter.write(blob);
					
				}, errorHandler);

			}, errorHandler);
		}
	}
});

/*

*/
var DataReceiver = (function() {

	return {

		/*

		*/
		getData: function(url, callback){
			var xhr = new XMLHttpRequest(); 
			xhr.open('GET', url, true); 
			xhr.responseType = "arraybuffer";

			xhr.onload = function(e) {
				if(this.status == 200) {
					callback(this.response);
				}
			}

			xhr.send();
		}
	}

});