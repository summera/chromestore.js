$(function(){
	var cs = new ChromeStore();
	cs.init(1024*1024);

	//test write dummy file
	function testwrite(){
		var writer = cs.write('media.mp4','video/mp4','aaa',true,'');	
	}
	setTimeout(testwrite,1000);
})