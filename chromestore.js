var ChromeStore = (function(fileSchema) {
	fileSchema = typeof fileSchema !== 'undefined' ? fileSchema : {};
	var fs = null;

	function errorHandler(e) {
		var msg = '';

		switch (e.code) {
			case FileError.QUOTA_EXCEEDED_ERR:
				msg = 'QUOTA_EXCEEDED_ERR';
				break;
			case FileError.NOT_FOUND_ERR:
				msg = 'NOT_FOUND_ERR';
				break;
			case FileError.SECURITY_ERR:
				msg = 'SECURITY_ERR';
				break;
			case FileError.INVALID_MODIFICATION_ERR:
				msg = 'INVALID_MODIFICATION_ERR';
				break;
			case FileError.INVALID_STATE_ERR:
				msg = 'INVALID_STATE_ERR';
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

					callback(that); //Execute callback

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
			var rootDir = fs.root, that = this;

			rootDir.getDirectory(path,{},function(dirEntry){
				dirEntry.remove(function(){
					console.log('Directory removed.');
					
					//call callback function if specified
					if(callback) callback();
				}, errorHandler);
			}, errorHandler);
		},

		renameDir: function(path,newName,callback) {
			var rootDir = fs.root, that = this;
			var pathArray = path.split('/'), pLength = pathArray.length, pathToParent;

			for(var i = 0; i<=pLength-2; i++){
				pathToParent = pathArray[i]+"/";
			}
			rootDir.getDirectory(pathToParent,{},function(parentDir){
				pathToParent = parentDir;
			},errorHandler);

			rootDir.getDirectory(path,{},function(dirEntry){
				dirEntry.moveTo(pathToParent,newName,function() {
					console.log(path + ' Directory renamed.');
					
					//call callback function if specified
					if(callback) callback();
				}, errorHandler);
			}, errorHandler);
		},

		createFile: function(path, create, exclusive, callback) {
			fs.root.getFile(path, {create: true, exclusive: true}, function(fileEntry) {
				callback(fileEntry);
			}, errorHandler);
		},

		deleteFile: function(path) {
			fs.root.getFile(path, {create: false}, function(fileEntry) {

				fileEntry.remove(function() {
				
				}, errorHandler);

		  	}, errorHandler);
		},

		renameFile: function(path) {

		},

		isPersistentAvailable: function() {

		},

		createWriter: function() {
			var fw = new FileWriter(fs);
			return fw;
		},

		write: function(fileName,fileType,data,createFlag) {
			var fw = this.createWriter();
			fw.writeData(fileName,fileType,data,createFlag);
		},

		createReceiver: function() {
			var receiver = new DataReceiver();

			return receiver;
		},

		getData: function(url) {

			var receiver = createReceiver();

			return receiver.getData(url, function(data){return data});
		},

		getAndWrite: function() {

		},

		purge: function() {

		},

		listFiles: function(path) {

		}

	};

});

var FileWriter = (function(filesystem) {
	var fs = filesystem;
	function errorHandler(e) {
		var msg = '';

		switch (e.code) {
			case FileError.QUOTA_EXCEEDED_ERR:
				msg = 'QUOTA_EXCEEDED_ERR';
				break;
			case FileError.NOT_FOUND_ERR:
				msg = 'NOT_FOUND_ERR';
				break;
			case FileError.SECURITY_ERR:
				msg = 'SECURITY_ERR';
				break;
			case FileError.INVALID_MODIFICATION_ERR:
				msg = 'INVALID_MODIFICATION_ERR';
				break;
			case FileError.INVALID_STATE_ERR:
				msg = 'INVALID_STATE_ERR';
				break;
			default:
				msg = 'Unknown Error';
				break;
		};
		console.log('Error: ' + msg);
	}

	return {
		writeData: function(fileName,fileType,data,createFlag){
			fs.root.getFile(fileName, {create: createFlag}, function(fileEntry) {

				// Create a FileWriter object for our FileEntry (log.txt).
				fileEntry.createWriter(function(fileWriter) {

					fileWriter.onwriteend = function(e) {
						console.log('Write completed.');
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
		}
	}

});