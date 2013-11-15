var cs;


//test write dummy file and dir
function testwrite(cs){
	//createDir(root, path, [callback])
	cs.createDir('', 'genres/action', function(){
		//write(path, type, data, createFlag)
		cs.write('genres/action/media.mp4','video/mp4','aaa',true);
	});
	
}

function testCreateDir(cs){
	//create another dir and delete it
	cs.createDir('', 'genres/drama', function(){
		//deleteDir(path,[callback])
		cs.deleteDir('genres/drama');
	});

	//create dir and rename it
	cs.createDir('', 'genres/rock', function(){
		//renameDir(oldPath,newDirName,[callback])
		cs.renameDir('genres/rock','roll');
	});
}

function testCreateFile(cs){
	cs.createFile('file1.txt', true, true, function(){
		cs.write('file1.txt', 'text/plain', 'test create file', false);
	});
}

function testDeleteFile(cs){
	cs.createFile('fileDelete.txt', true, true, function(){
		cs.write('fileDelete.txt', 'text/plain', 'test delete file', false, function(){
			cs.deleteFile('fileDelete.txt');
		});
	});
}

function tests (cs){
	testwrite(cs);
	testCreateDir(cs);
	testCreateFile(cs);
	testDeleteFile(cs);
}


window.onload = function(){
	//initializeChromestore(tests);
	var cs = new ChromeStore();
	cs.init(1024*1024, tests);
	$("#purgeButton").on("click",function(){
		cs.purge();
	});
}