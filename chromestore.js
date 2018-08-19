/*
    chromestore.js

    Takes an optional, initial fileSchema which it creates
    upon initialization.

    fileSchema  [{path: 'path string', callback: callback function},
                {path: 'path string', callback: callback function},
                {path: 'path string', callback: callback function}]

*/
window.PERSISTENT = null;

class ChromeStore {
  constructor(fileSchema) {
    this.fileSchema = typeof fileSchema !== 'undefined' ? fileSchema : [];
    this.fs = null;
  }

  /**
   * @param {int} requestedBytes - requested size of storage in bytes
   * @param {function} callback - function to be executed when initialization is complete.
   *                              passed reference to initialized chromestore.
   */

  init(requestedBytes, callback) {
    let that = this;

    function createFileSchema(schema) {
      for (let key in schema) {
        if (schema.hasOwnProperty(key)) {
          let obj = schema[key];
          if (obj['path']) that.getDir(obj['path'], {create: true}, obj['callback']);
        }
      }
    }

    function requestFS(grantedBytes) {
      /** @function webkitRequestFileSystem */
      window.webkitRequestFileSystem(window.PERSISTENT, grantedBytes, function (filesystem) {
        that.fs = filesystem;
        console.log('fs: ', arguments);
        console.log(`Granted Bytes: ${grantedBytes}`);
        createFileSchema(that.fileSchema);
        if (callback) callback(that);
      }, ChromeStore.errorHandler);
    }

    /**
     * @param requestedBytes
     */
    function getGranted(requestedBytes) {
      /** @namespace navigator.webkitPersistentStorage */
      /** @function navigator.webkitRequestFileSystem.requestQuota */
      navigator.webkitPersistentStorage.requestQuota(requestedBytes, (grantedBytes) => {
        console.log('requestQuota: ', arguments);
        requestFS(grantedBytes, callback);
      }, ChromeStore.errorHandler);
    }

    getGranted(requestedBytes);
  }

  /**
   *  Create/get directory or directories on filesystem.
   *  Recursively creates directories on passed in path.
   * @param {string} path - path of directories in which to create
   * @param flags {object} - like a {create: true}
   * @param {function} callback - function to be executed when directory has been created
   */
  getDir(path, flags, callback) {
    /** @function rootDir.getDirectory */
    function recursiveCreate(path, callback, root) {
      path = (typeof path === 'object' ? path : path.split('/'));
      let rootDir = root ? root : this.fs.root;

      // Throw out './' or '/' and move on to prevent something like '/foo/.//bar'.
      if (path[0] === '.' || path[0] === '') {
        path = path.slice(1);
      }

      rootDir.getDirectory(path[0], flags, dirEntry => {
        // Recursively add the new sub-folder (if we still have another to create).
        if (path.length - 1) {
          recursiveCreate(path.slice(1), callback, dirEntry);
        }
        else {
          if (callback) callback(dirEntry);
        }
      }, ChromeStore.errorHandler);
    }

    recursiveCreate(path, callback);
  }


  /**
   *  Delete directory
   *
   * @param path [string]: path to directory in which to delete
   * @param flags
   * @param callback  [function]: function to be executed when directory has been deleted
   */
  deleteDir(path, flags = {}, callback) {
    if (flags.recursive === undefined) flags.recursive = false;

    let rootDir = this.fs.root;
    /** @function dirEntry.removeRecursively */
    rootDir.getDirectory(path, {}, dirEntry => {
      if (flags.recursive) dirEntry.removeRecursively(() => {
        if (callback) callback();
      }, ChromeStore.errorHandler); else dirEntry.remove(() => {
        if (callback) callback();
      }, ChromeStore.errorHandler);
    }, ChromeStore.errorHandler);
  }

  /**
   *
   * @param path  [string]: path to directory in which to rename
   * @param newName [string]: new name of directory
   * @param callback  [function]: function to be executed when directory is renamed
   */
  renameDir(path, newName, callback) {
    let rootDir = this.fs.root;
    let pathArray = path.split('/');
    let pLength = pathArray.length;
    let pathToParent = "";

    for (let i = 0; i <= pLength - 2; i++) {
      pathToParent = `${pathToParent + pathArray[i]}/`;
    }

    rootDir.getDirectory(pathToParent, {}, parentDir => {
      pathToParent = parentDir;
    }, ChromeStore.errorHandler);

    rootDir.getDirectory(path, {}, dirEntry => {
      dirEntry.moveTo(pathToParent, newName, newDir => {
        console.log(`${path} Directory renamed.`);

        //call callback function if specified
        if (callback) callback(newDir);
      }, ChromeStore.errorHandler);
    }, ChromeStore.errorHandler);
  }


  /*


      path
      create
      exclusive
      callback    [function]: function to be executed when file is created. passed the FileEntry object
  */
  /**
   * Create/get file
   * Directory in which file is created must exist before  creating file
   * @param path [string]: path to new file
   * @param flags [boolean]: true creates the file if it doesn't exist,
   * @param callback
   */
  getFile(path, flags, callback) {
    this.fs.root.getFile(path, flags, fileEntry => {
      if (callback) {
        callback(fileEntry);
      }
    }, ChromeStore.errorHandler);
  }


  /**
   * Delete file
   * @param path [string]: path to file in which to delete
   */
  deleteFile(path) {
    this.fs.root.getFile(path, {create: false}, fileEntry => {
      fileEntry.remove(() => {
      }, ChromeStore.errorHandler);
    }, ChromeStore.errorHandler);
  }


  /*
      Rename file

      path        [string]: path to file in which to rename
      newName     [string]: new name of file
      callback    [function]: function in which to execute when file is renamed.
                              passed the FileEntry object
  */
  renameFile(path, newName, callback) {
    let rootDir = this.fs.root;
    let pathArray = path.split('/');
    let pLength = pathArray.length;
    let pathToParent = "";

    for (let i = 0; i <= pLength - 2; i++) {
      pathToParent = `${pathToParent + pathArray[i]}/`;
    }

    rootDir.getDirectory(pathToParent, {}, parentDir => {
      pathToParent = parentDir;
    }, ChromeStore.errorHandler);

    this.fs.root.getFile(path, {}, fileEntry => {
      fileEntry.moveTo(pathToParent, newName, () => {
        console.log('File renamed');

        //call callback function if specified
        if (callback) callback(fileEntry);
      }, ChromeStore.errorHandler);
    }, ChromeStore.errorHandler);
  }


  /**
   *
   * @param callback [function]: function to be executed when used and remaining bytes have been received
   *                             from filesystem.  passed the number of used and remaining bytes
   * @function navigator.webkitPersistentStorage.queryUsageAndQuota
   */
  usedAndRemaining(callback) {
    navigator.webkitPersistentStorage.queryUsageAndQuota((used, remaining) => {
      if (callback) callback(used, remaining);
    });
  }


  /**
   *  Create new FileWriter object and returns it to the caller
   * @returns {FileWriter}
   */
  createWriter() {
    return new FileWriter(this.fs);
  }


  /**
   *  Write to a file
   *  If file does not exist, createFlag must be set to True
   *
   * @param {string} path - path of file in which to write / create
   * @param {string} fileType - type of file (eg. video/mp4, application/text)
   * @param {string} data - blob to be written to the file
   * @param {boolean} flags - create new file
   * @param {function} callback - function to be executed when data has been written
   */
  write(path, fileType, data, flags, callback) {
    let fw = this.createWriter();
    fw.writeData(path, fileType, data, flags, callback);
  }


  /**
   * Create new DataReceiver object and returns it to the caller
   * @returns {DataReceiver}
   */
  static createReceiver() {
    return new DataReceiver();
  }


  /*
      Get data from a specified url
      Returns a function with 'data' parameter

      url         [string]: URL path of the file to be downloaded
      callback    [function]: function to be executed when file has finished downloading
  */
  static getData(url, callback) {
    let receiver = ChromeStore.createReceiver();
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
  getAndWrite(url, path, fileType, flags, callback) {
    let that = this;
    ChromeStore.getData(url, data => {
      that.write(path, fileType, data, flags, callback)
    });
  }


  /*
      Delete all files and directories that already exists in local persistent storage
  */
  purge() {
    let dirReader = this.fs.root.createReader();
    dirReader.readEntries(entries => {
      for (let i = 0, entry; entry = entries[i]; ++i) {
        if (entry.isDirectory) {
          entry.removeRecursively(() => {
          }, ChromeStore.errorHandler);
        } else {
          entry.remove(() => {
          }, ChromeStore.errorHandler);
        }
      }
      console.log('Local storage emptied.');
    }, ChromeStore.errorHandler);
  }


  /*
      List all files that exists in the specified path.
      Outputs an array of objects

      path        [string]: path to be listed, defaults to root when not specified
      callback    [function]: function to be executed when file has been written
  */
  ls(path, callback) {
    let dirReader;
    let arr = [];
    let rootDir = this.fs.root;
    let pathArray = path.split('/');
    let pLength = pathArray.length;
    let pathToParent = "";

    for (let i = 0; i <= pLength - 1; i++) {
      pathToParent = `${pathToParent + pathArray[i]}/`;
    }

    rootDir.getDirectory(pathToParent, {}, parentDir => {
      pathToParent = parentDir;
      dirReader = (pathToParent) ? pathToParent.createReader() : fs.root.createReader();
      dirReader.readEntries(entries => {
        if (!entries.length) {
          console.log('Filesystem is empty.');
        }

        for (let i = 0, entry; entry = entries[i]; ++i) {
          arr.push({
            name: entry.name,
            fileEntry: entry.filesystem
          });
        }

        if (callback) callback(arr);
      }, ChromeStore.errorHandler);
    }, ChromeStore.errorHandler);
  }

  static errorHandler(DOMError) {
    let msg = '';

    if (DOMError.name === 'QuotaExceededError') msg = 'QuotaExceededError';
    else if (DOMError.name === 'NotFoundError') msg = 'NotFoundError';
    else if (DOMError.name === 'SecurityError') msg = 'SecurityError';
    else if (DOMError.name === 'InvalidModificationError') msg = 'InvalidModificationError';
    else if (DOMError.name === 'InvalidStateError') msg = 'InvalidStateError';
    else msg = 'Unknown Error';

    console.error(msg);
  }
}

class FileWriter {
  constructor(filesystem) {
    this.filesystem = filesystem;
  }

  static errorHandler(DOMError) {
    let msg = '';
    if (DOMError.name === 'QuotaExceededError') msg = 'QuotaExceededError';
    else if (DOMError.name === 'NotFoundError') msg = 'NotFoundError';
    else if (DOMError.name === 'SecurityError') msg = 'SecurityError';
    else if (DOMError.name === 'InvalidModificationError') msg = 'InvalidModificationError';
    else if (DOMError.name === 'InvalidStateError') msg = 'InvalidStateError';
    else msg = 'Unknown Error';
    console.error(`Error: ${msg}`);
  }

  writeData(path, fileType, data, flags, callback) {
    this.filesystem.root.getFile(path, flags, fileEntry => {
      /** @function fileEntry.createWriter */
      // Create a FileWriter object for our FileEntry (log.txt).
      fileEntry.createWriter(fileWriter => {
        /** @function fileWriter.onwriteend */
        fileWriter.onwriteend = () => {
          console.log('Write completed.');
          if (callback) callback(fileEntry);
        };

        fileWriter.onerror = e => {
          console.log(`Write failed: ${e.toString()}`);
        };
        // Create a new Blob and write it to log.txt.
        let blob = new Blob([data], {type: fileType});
        fileWriter.write(blob);
      }, FileWriter.errorHandler);
    }, FileWriter.errorHandler);
  }
}

class DataReceiver {
  /**
   *
   * @param {string} url - URL path of the file to be downloaded
   * @param {function} callback - function to be executed when file has finished downloading
   */
  getData(url, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = "arraybuffer";

    xhr.onload = function (e) {
      if (this.status === 200) {
        callback(this.response);
      }
    };

    xhr.send();
  }
}
