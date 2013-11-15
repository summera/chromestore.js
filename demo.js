$(function(){
	//FUNCTIONS
	function changeSourceToLocal(fileEntry) {
		var video = $("#vid").get(0);
		var currentTime = video.currentTime;

		$("video").attr("src", fileEntry.toURL());
		video.currentTime = currentTime;
	}

	//EVENT HANDLERS
	$("#fb").click(function(){
		var vidSource = $("#url").val();
		$("#vid").attr("src",vidSource);
		var video = $("#vid").get(0);
		video.load();
		video.play();
	});

	//INIT

});