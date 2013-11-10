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

		createDir: function(path) {

		},

		deleteDir: function(path) {

		},

		createFile: function(path, create, exclusive, callback) {
			fs.root.getFile(path, {create: true, exclusive: true}, function(fileEntry) {
				callback(fileEntry);
			}, errorHandler);
		},

		renameDir: function(path) {

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

		write: function(fileName,fileType,data,createFlag,path) {
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