var cs;


//Test writing to file
function testwrite(cs){
	//createDir(root, path, [callback])
	cs.createDir('genres/action', function(){
		//write(path, type, data, createFlag)
		cs.write('genres/action/media.mp4','video/mp4','aaa',true);
	});
	
}

//Test creating directory
function testCreateDir(cs){
	//create dir
	cs.createDir('genres/drama', function(){});

	//create dir 
	cs.createDir('genres/rock', function(){});
}

//Test deleting directory
function testDeleteDir(cs){
	cs.createDir('genres/deleteFolder', function(){
		//deleteDir(path,[callback])
		cs.deleteDir('genres/deleteFolder');
	});
}

//Test renaming directory
function testRenameDir(cs){
	cs.createDir('genres/rap', function(){
		//renameDir(oldPath,newDirName,[callback])
		cs.renameDir('genres/rap','renamedDir');
	});
}

//Test creating file
function testCreateFile(cs){
	cs.createFile('fileCreate.txt', true, true, function(){
		cs.write('fileCreate.txt', 'text/plain', 'test create file', false);
	});
}

//Test deleting file
function testDeleteFile(cs){
	cs.createFile('fileDelete.txt', true, true, function(){
		cs.write('fileDelete.txt', 'text/plain', 'test delete file', false, function(){
			cs.deleteFile('fileDelete.txt');
		});
	});
}

//Test renaming file
function testRenameFile(cs){
	cs.createFile('fileNotRenamed.txt', true, true, function(){
		cs.write('fileNotRenamed.txt', 'text/plain', 'test rename file', false, function(){
			cs.renameFile('fileNotRenamed.txt', 'fileRenamed.txt');
		});
	});
}

//Test getting data from url
function testGetData(cs){
	var url = 'https://s3.amazonaws.com/lr-chaos/videos/encoded_files/000/000/548/original/Hands-Elegant-Road-04-22-13.mp4';
	console.log('Retrieving data from ' + url);
	cs.getData(url, function(data){
		
		console.log('Bytes Received from ' + url + ': ' + data.byteLength);
	});
}

//Test getting and writing data from url to local file
function testGetAndWrite(cs){
	var url = 'https://s3.amazonaws.com/lr-chaos/videos/encoded_files/000/000/548/original/Hands-Elegant-Road-04-22-13.mp4';
	console.log('Retrieving data from ' + url);
	cs.getAndWrite(url, 'video.mp4', 'video/mp4', true, function(){
		
		console.log('Write video complete');
	});
}

function tests(cs){
	testwrite(cs);
	testCreateDir(cs);
	testDeleteDir(cs);
	testRenameDir(cs);
	testCreateFile(cs);
	testDeleteFile(cs);
	testRenameFile(cs);
	cs.isPersistentAvailable();
	//testGetData(cs);
	testGetAndWrite(cs);
}


window.onload = function(){
	//initializeChromestore(tests);
	var cs = new ChromeStore();
	cs.init(1024*1024*1024, tests);
	$("#purgeButton").on("click",function(){
		cs.purge();
	});
}
