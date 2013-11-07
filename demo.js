$(function(){
	//FUNCTIONS

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