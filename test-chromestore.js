var cs;


//test write dummy file
function testwrite(cs){
	var writer = cs.write('media.mp4','video/mp4','aaa',true,'');	
}

function tests (cs){
	testwrite(cs);
}


window.onload = function(){
	//initializeChromestore(tests);
	var cs = new ChromeStore();
	cs.init(1024*1024, testwrite);
}
