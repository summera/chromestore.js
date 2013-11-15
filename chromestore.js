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
		init: function(requestedBytes, callback) {

			//Store this in that so it can be used inside nested functions
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

		createDir: function(root,path,callback) {
			path = (typeof path === 'object' ? path : path.split('/'));
			var rootDir = root ? root : fs.root, that = this;

			// Throw out './' or '/' and move on to prevent something like '/foo/.//bar'.
			if (path[0] == '.' || path[0] == '') {
				path = path.slice(1);
			}

			rootDir.getDirectory(path[0], {create: true}, function(dirEntry) {
				// Recursively add the new subfolder (if we still have another to create).
				if (path.length) {
					that.createDir(dirEntry,path.slice(1),callback);
				}
				else {
					if(callback) callback();
				}
			}, errorHandler);
		},

		deleteDir: function(path,callback){
			var rootDir = fs.root;

			rootDir.getDirectory(path,{},function(dirEntry){
				dirEntry.removeRecursively(function(){
					console.log('Directory removed.');
					
					//call callback function if specified
					if(callback) callback();
				}, errorHandler);
			}, errorHandler);
		},

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

		createFile: function(path, create, exclusive, callback) {
			fs.root.getFile(path, {create: create, exclusive: exclusive}, function(fileEntry) {
				if(callback) {callback(fileEntry);}
			}, errorHandler);
		},

		deleteFile: function(path) {
			fs.root.getFile(path, {create: false}, function(fileEntry) {

				fileEntry.remove(function() {
				
				}, errorHandler);

		  	}, errorHandler);
		},

		renameFile: function(path,newName,callback) {
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
					if(callback) callback();
				}, errorHandler);
			}, errorHandler);
		},

		isPersistentAvailable: function(callback) {
			navigator.webkitPersistentStorage.queryUsageAndQuota(function (used, remaining){
				if(callback){callback(used, remaining);}
			});
		},

		createWriter: function() {
			var fw = new FileWriter(fs);
			return fw;
		},

		write: function(path, fileType, data, createFlag, callback) {
			var fw = this.createWriter();
			fw.writeData(path, fileType, data, createFlag, callback);
		},

		createReceiver: function() {
			var receiver = new DataReceiver();
			return receiver;
		},

		getData: function(url, callback) {

			var receiver = this.createReceiver();

			receiver.getData(url, callback);
		},

		getAndWrite: function(url, path, fileType, createFlag, callback) {
			var that = this;
			this.getData(url, function(data){
				that.write(path, fileType, data, createFlag, callback)
			});
		},

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

		listFiles: function(path) {

		}

	};

});

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

var DataReceiver = (function() {

	return {
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