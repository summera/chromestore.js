$(function(){
    //FUNCTIONS
    function changeSourceToLocal(fileEntry) {
        var video = $("#vid").get(0);
        var isPlaying = !video.paused;
        var currentTime = video.currentTime;
        console.log(currentTime);


        $("video").on('loadedmetadata', function(){
            console.log(currentTime);
            video.currentTime = currentTime;

            if(isPlaying){
                video.play();
            }
        });

        $("video").attr("src", fileEntry.toURL());
    }

    var cs = new ChromeStore();
    cs.init(1024*1024*1024);


    //EVENT HANDLERS
    $("#fb").click(function(){
        var vidSource = $("#url").val();
        $("#vid").attr("src",vidSource);
        var video = $("#vid").get(0);
        video.load();
        //video.play();
    });

    $("#downloadToLocal").click(function(){
        var url = $("#vid").attr('src');
        cs.getAndWrite(url, 'video.mp4', 'video/mp4', {create: true}, function(fileEntry){
            changeSourceToLocal(fileEntry);
            console.log('Video source changed to local storage.');
        });

    }); 

});