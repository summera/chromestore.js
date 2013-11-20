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

    var cs = new ChromeStore([ {path: 'videos/clips'}, {path: 'audio/wav', callback: function(){console.log('finished creating audio structure')}} ]);
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
//Small
//https://s3.amazonaws.com/lr-chaos/videos/files/000/000/835/original/sd_13_07_24_03_00_51_AM_20CD4970-CB19-431C-ABE4-431709D8FF8E.mp4?1374635835

//Large
//https://s3.amazonaws.com/lr-chaos/videos/encoded_files/000/000/548/original/Hands-Elegant-Road-04-22-13.mp4