$(function(){
	//FUNCTIONS
	function changeSourceToLocal(fileEntry) {
		var video = $("#vid").get(0);
		var currentTime = video.currentTime;

		$("video").attr("src", fileEntry.toURL());
		video.currentTime = currentTime;
	}

	var cs = new ChromeStore();
	cs.init(1024*1024*1024, tests);


	//EVENT HANDLERS
	$("#fb").click(function(){
		var vidSource = $("#url").val();
		$("#vid").attr("src",vidSource);
		var video = $("#vid").get(0);
		video.load();
		video.play();
	});

	$("#downloadToLocal").click(function(){
		var url = $("#vid").attr('src');
		cs.getAndWrite(url, 'video.mp4', 'video/mp4', true, function(fileEntry){
		
			console.log('Switching to local file system');
		});

	});	

});