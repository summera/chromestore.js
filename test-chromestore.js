var cs;


//test write dummy file and dir
function testwrite(cs){
	//createDir(root, path, [callback])
	cs.createDir('', 'genres/action', function(){
		//write(path, type, data, createFlag)
		var writer = cs.write('genres/action/media.mp4','video/mp4','aaa',true,'');
	});
	
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

function tests (cs){
	testwrite(cs);
}


window.onload = function(){
	//initializeChromestore(tests);
	var cs = new ChromeStore();
	cs.init(1024*1024, testwrite);
}
