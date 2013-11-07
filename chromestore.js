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


	function requestFS(grantedBytes) {
		window.webkitRequestFileSystem(window.PERSISTENT, grantedBytes, function(filesystem) {
			fs = filesystem;
			console.log ('fs: ', arguments); // I see this on Chrome 27 in Ubuntu
			console.log("Granted Bytes: " + grantedBytes);
			console.log("**********************************");
		}, onError);
	}

	function getGranted(requestedBytes){
		navigator.webkitPersistentStorage.requestQuota (requestedBytes, function(grantedBytes) {
			console.log("==================================");
			console.log("PERSISTENT STORAGE");
			console.log("==================================");

			console.log("**********************************");
			console.log ('requestQuota: ', arguments);
			
			requestFS(grantedBytes);

		}, onError);
	}

	return {
		init: function(requestedBytes) {
			getGranted(requestedBytes);

			
		},

		createDir: function(path) {

		},

		deleteDir: function(path) {

		},

		createFile: function(path) {

		},

		renameDir: function(path) {

		},

		deleteFile: function(path) {

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

		},

		getData: function(url) {

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

	return {
		writeData: function(fileName,fileType,data,createFlag){
			console.log(fileName+''+fileType+''+data+''+createFlag);
		}
	}
});

var DataReceiver = (function() {

	return {
		getData: function(url){

			var xhr = new XMLHttpRequest(); 
			xhr.open('GET', url, true); 
			xhr.responseType = "arraybuffer";

			xhr.onload = function(e) {
				if(this.status == 200) {
					return this.response;
				}
			}
		}
	}

});