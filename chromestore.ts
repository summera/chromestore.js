/*
	This is a chromestore.js transformed in a typescript source code
    https://github.com/summera/chromestore.js/

    Takes an optional, initial fileSchema which it creates
    upon initialization.

    fileSchema  [{path: 'path string', callback: callback function},
                {path: 'path string', callback: callback function},
                {path: 'path string', callback: callback function}]

*/


interface Navigator {
    webkitPersistentStorage:any;
}

interface Flags {
	recursive?:boolean;
	}



module nebula {
	
	
	export class ChromeStore {
		constructor(fileSchema:Array<Object>) {
			this.fileSchema = typeof fileSchema !== 'undefined' ? fileSchema : [];
			
		}
		
		
		
		private errorHandler(domError:DOMError) {
			let msg = '';
	        switch (domError.name) {
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
		
        private createFileSchema(fileSchema:Array<Object>){
            for (let key in fileSchema){
                if(fileSchema.hasOwnProperty(key)){
                    let obj = fileSchema[key];
                    if(obj['path']){
                        this.getDir(obj['path'], {create: true}, obj['callback']);
                    }
                }
            }
        }

        private requestFS(grantedBytes:number, callback:Function) {
	        var _this = this;
            window.webkitRequestFileSystem(window.PERSISTENT, grantedBytes, function(filesystem) {
                _this.fs = filesystem;
                console.log ('fs: ', arguments); // I see this on Chrome 27 in Ubuntu
                console.log("Granted Bytes: " + grantedBytes);
                console.log("**********************************");

                _this.createFileSchema(_this.fileSchema);

                if(callback){callback(this);} //Execute callback

            }, this.errorHandler);
        }

        private getGranted(requestedBytes:number){
	        var _this = this;
            navigator.webkitPersistentStorage.requestQuota (requestedBytes, function(grantedBytes) {
                console.log("==================================");
                console.log("PERSISTENT STORAGE");
                console.log("==================================");
                console.log("**********************************");
                console.log ('requestQuota: ', arguments);

                _this.requestFS(grantedBytes,null);

            }, this.errorHandler);
        }
        
        private recursiveCreate(path:string, callback:Function, flags:Flags, root:DirectoryEntry){
	        var _this = this;
            let pathInt = (typeof path === 'object' ? path : path.split('/'));
            let rootDir = root ? root : this.fs.root;

            // Throw out './' or '/' and move on to prevent something like '/foo/.//bar'.
            if (pathInt[0] == '.' || pathInt[0] == '') {
                pathInt = pathInt.slice(1);
            }

            rootDir.getDirectory(pathInt[0], flags, function(dirEntry) {
                // Recursively add the new subfolder (if we still have another to create).
                if (pathInt.length - 1) {
                    _this.recursiveCreate(pathInt.slice(1).toString(), callback, null, dirEntry);
                }
                else {
                    if(callback) callback(dirEntry);
                }
            }, this.errorHandler);
        }
        
        
        /*
            Create/get directory or directories on filesystem.
            Recursively creates directories on passed in path.
            If directory already exists, one is not made.

            path        [string]: path of directories in which to create
            callback    [function]: function to be executed when directory has been created
        */
        public getDir(path:string, flags:Flags, callback:Function) {        
            this.recursiveCreate(path, callback, flags, null);
        }


		/*
		    Initialize chromestore
		    Request persistent filesystem and amount of bytes
		    Create initial fileSchema if there is one
		
		    requestedBytes  [int]: requested size of storage in bytes
		    callback        [function]: function to be executed when initialization is complete.
		                                passed reference to initialized chromestore.
		*/	
		public init(requestedBytes:number, callback:Function) {
			this.getGranted(requestedBytes);
		}
		
        /*
            Delete directory

            path        [string]: path to directory in which to delete
            callback    [function]: function to be executed when directory has been deleted
        */
        public deleteDir(path:string, flags:Flags, callback:Function){

            let _flags:Flags = flags || {};
            if(_flags.recursive === undefined) _flags.recursive = false;

            let rootDir = this.fs.root;

            rootDir.getDirectory(path,{},function(dirEntry){
                if(_flags.recursive){
                    dirEntry.removeRecursively(function(){
                        //call callback function if specified
                        if(callback) callback();
                    }, this.errorHandler);
                }
                else{
                    dirEntry.remove(function(){ 
                        //call callback function if specified
                        if(callback) callback();
                    }, this.errorHandler);
                }
            }, this.errorHandler);
        }
        
        /*
            Rename directory

            path        [string]: path to directory in which to rename
            newName     [string]: new name of directory
            callback    [function]: function to be executed when directory is renamed
        */		
        public renameDir(path:string, newName:string, callback:Function) {
            let rootDir = this.fs.root;
            let pathArray = path.split('/');
            let pLength = pathArray.length;
            let pathToParent:DirectoryEntry=null;
            let pathToParentString:string="";

            for(let i = 0; i<=pLength-2; i++){            
                pathToParentString = pathToParentString+pathArray[i]+"/";
            }

            rootDir.getDirectory(pathToParentString,{},function(parentDir){
                pathToParent = parentDir;
            },this.errorHandler);

            rootDir.getDirectory(path,{},function(dirEntry){
                dirEntry.moveTo(pathToParent,newName,function(newDir) {
                    console.log(path + ' Directory renamed.');
                    
                    //call callback function if specified
                    if(callback) callback(newDir);
                }, this.errorHandler);
            }, this.errorHandler);
        }
        
        
        /*  
            Create/get file 
            Directory in which file is created must exist before
            creating file

            path        [string]: path to new file
            create      [boolean]: true creates the file if it doesn't exist,
            exclusive   [boolean]: true will throw an error if file already exists, false will overwrite contents
            callback    [function]: function to be executed when file is created. passed the FileEntry object
        */
        public getFile(path:string, flags:Flags, callback:Function) {
            this.fs.root.getFile(path, flags, function(fileEntry) {
                if(callback) {callback(fileEntry);}
            }, this.errorHandler);
        }
        
        
        /*
            Delete file

            path [string]: path to file in wich to delete
        */
        public deleteFile(path:string) {
            this.fs.root.getFile(path, {create: false}, function(fileEntry) {

                fileEntry.remove(function() {
                
                }, this.errorHandler);

            }, this.errorHandler);
        }
        
        /*
            Rename file

            path        [string]: path to file in which to rename
            newName     [string]: new name of file
            callback    [function]: function in which to execute when file is renamed. 
                                    passed the FileEntry object
        */
        public renameFile(path:string, newName:string, callback:Function) {
            let rootDir = this.fs.root;
            let pathArray = path.split('/');
            let pLength = pathArray.length;
            let pathToParent:DirectoryEntry=null;
            let pathToParentString:string="";

            for(let i = 0; i<=pLength-2; i++){
                pathToParentString = pathToParentString+pathArray[i]+"/";
            }

            rootDir.getDirectory(pathToParentString,{},function(parentDir){
                pathToParent = parentDir;
            },this.errorHandler);

            this.fs.root.getFile(path, {}, function(fileEntry){
                fileEntry.moveTo(pathToParent, newName,function(){
                    console.log('File renamed');

                    //call callback function if specified
                    if(callback) callback(fileEntry);
                }, this.errorHandler);
            }, this.errorHandler);
        }
        
        /*
            Return the number of used and remaining bytes in filesystem

            callback [function]: function to be executed when used and remaining bytes have been received
                                    from filesystem.  passed the number of used and remaining bytes
        */
        public usedAndRemaining(callback:Function) {
            navigator.webkitPersistentStorage.queryUsageAndQuota(function (used, remaining){
                if(callback){callback(used, remaining);}
            });
        }

        /*
            Create new FileWriter object and returns it to the caller
        */
        public createWriter() {
            let fw = new FileWriter(this.fs);
            return fw;
        }
        
        /*
            Write to a file
            If file does not exist, createFlag must be set to True

            path        [string]: path of file in which to write / create
            fileType    [string]: type of file (eg. video/mp4, application/text)
            data        [string]: blob to be written to the file
            createFlag  [boolean]: create new file
            callback    [function]: function to be executed when data has been written

        */
        public write(path:string, fileType:string, data:Object, flags:Flags, callback:Function) {
            let fw = this.createWriter();
            fw.writeData(path, fileType, data, flags, callback);
        }
        
        /*
            Create new DataReceiver object and returns it to the caller
        */
        public createReceiver() {
            let receiver = new DataReceiver();
            return receiver;
        }
        
        /*
            Get data from a specified url
            Returns a function with 'data' parameter

            url         [string]: URL path of the file to be downloaded
            callback    [function]: function to be executed when file has finished downloading
        */
        public getData(url:string, callback:Function) {
            let receiver = this.createReceiver();
            receiver.getData(url, callback);
        }
        
        
        /*
            Get data from a URL and store it in local persistent storage
            Calls getData and write in sequence

            url         [string]: URL path of the file to be downloaded
            path        [string]: path of file in which to write / create
            fileType    [string]: type of file (eg. video/mp4, application/text)
            createFlag  [boolean]: create new file
            callback    [function]: function to be executed when file has been written
        */
        public getAndWrite(url:string, path:string, fileType:string, flags:Flags, callback:Function) {
	        var _this = this;
            this.getData(url, function(data){
                _this.write(path, fileType, data, flags, callback)
            });
        }
        
        /*
            Delete all files and directories that already exists in local persistent storage
        */
        public purge() {
            let dirReader = this.fs.root.createReader();
            dirReader.readEntries(function(entries) {
                for (let i = 0, entry; entry = entries[i]; ++i) {
                    if (entry.isDirectory) {
                        entry.removeRecursively(function() {}, this.errorHandler);
                    } else {
                        entry.remove(function() {}, this.errorHandler);
                    }
                }
                console.log('Local storage emptied.');
            }, this.errorHandler);
        }
        
        
        /*
            List all files that exists in the specified path.
            Outputs an array of objects

            path        [string]: path to be listed, defaults to root when not specified
            callback    [function]: function to be executed when file has been written
        */
        public ls(path:string,callback:Function) {
            let dirReader;
            let arr = [];
            let rootDir = this.fs.root;
            let pathArray = path.split('/');
            let pLength = pathArray.length;
            let pathToParent:DirectoryEntry=null;
            let pathToParentString:string="";

            for(let i = 0; i<=pLength-1; i++){
                pathToParentString = pathToParentString+pathArray[i]+"/";
            }

            rootDir.getDirectory(pathToParentString,{},function(parentDir){
                pathToParent = parentDir;
                dirReader = (pathToParent) ? pathToParent.createReader() : this.fs.root.createReader();
                dirReader.readEntries(function(entries) {
                    if (!entries.length) {
                        console.log('Filesystem is empty.');
                    }

                    for (let i = 0, entry; entry = entries[i]; ++i) {
                        arr.push({
                            name: entry.name, 
                            fileEntry: entry.filesystem
                        });
                    }

                    if(callback) callback(arr);
                }, this.errorHandler);
            },this.errorHandler);
        }
        
		private fileSchema:Array<Object>;
		private fs:FileSystem = null;
	
	}
	
	
	/*
	    DataReceiver object
	    Method: getData
	*/
	export class DataReceiver {
		constructor() {}
		
        /*
            Get data from a specified url
            Returns a function with 'data' parameter

            url         [string]: URL path of the file to be downloaded
            callback    [function]: function to be executed when file has finished downloading
        */
		public getData(url:string, callback:Function) {
			let xhr = new XMLHttpRequest(); 
			xhr.open('GET', url, true); 
            xhr.responseType = "arraybuffer";

            xhr.onload = function(e) {
                if(xhr.status == 200) {
                    callback(xhr.response);
                }
            }
            xhr.send();
		}

	}
	
	/*
	    FileWriter Object
	    method: writeData
	*/
	export class FileWriter {
		constructor(fs:FileSystem) {
			this.fs = fs;
		}
		
		private errorHandler(domError:DOMError) {
			let msg = '';
	        switch (domError.name) {
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
		
		
        /*
            Write data to a file
            If file does not exist, createFlag must be set to True
            If file already exists and createFlag is set to True, its content will be overwritten

            path        [string]: path of file in which to write / create
            fileType    [string]: type of file (eg. video/mp4, application/text)
            data        [string]: blob to be written to the file
            createFlag  [boolean]: create new file
            callback    [function]: function to be executed when data has been written
        */
        public writeData(path:string, fileType:string, data:Object, flags:Flags, callback:Function){
            this.fs.root.getFile(path, flags, function(fileEntry) {

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
                    
                }, this.errorHandler);

            }, this.errorHandler);
        }
		
		private fs:FileSystem = null;
	}
	
	export class DOMError {
		constructor() {}
		public name:string;
	}

}

