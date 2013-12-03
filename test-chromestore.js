var cs;


//Test writing to file
function testwrite(cs){
    //getDir(root, path, [callback])
    cs.getDir('genres/action', {create: true}, function(){
        //write(path, type, data, createFlag)
        cs.write('genres/action/media.mp4','video/mp4','aaa', {create: true});
    });
}

//Test creating directory
function testCreateDir(cs){
    //create dir
    cs.getDir('genres/drama', {create: true}, function(){
        cs.getDir('genres/drama/extremedrama', {create: true}, function(){
            cs.write('genres/drama/extremedrama/extreme.txt', 'text/plain', 'this is extreme!!', {create: true});
            cs.getDir('genres/drama/blah', {create: true});
        });
    });

    //create dir 
    cs.getDir('genres/rock', {create: true}, function(){});
}

//Test deleting directory
function testDeleteDir(cs){
    cs.getDir('genres/deleteFolder', {create: true}, function(){
        //deleteDir(path,[callback])
        cs.deleteDir('genres/deleteFolder', {recursive: false});
    });
}

//Test deleting non empty directory
function testDeleteNonEmptyDir(cs){
    cs.getDir('genres/notEmpty', {create: true}, function(){
        cs.write('genres/notEmpty/media.mp4','video/mp4','aaa', {create: true}, function(){
            cs.deleteDir('genres/notEmpty', {recursive: true});
        });
    });
}

//Test renaming directory
function testRenameDir(cs){
    cs.getDir('genres/rap', {create: true}, function(){
        //renameDir(oldPath,newDirName,[callback])
        cs.renameDir('genres/rap','renamedDir');
    });
}

//Test creating file
function testCreateFile(cs){
    cs.getFile('fileCreate.txt', {create: true, exclusive: true}, function(){
        cs.write('fileCreate.txt', 'text/plain', 'test create file', {create: false});
    });
}

//Test deleting file
function testDeleteFile(cs){
    cs.getFile('fileDelete.txt', {create: true, exclusive: true}, function(){
        cs.write('fileDelete.txt', 'text/plain', 'test delete file', {create: false}, function(){
            cs.deleteFile('fileDelete.txt');
        });
    });
}

//Test renaming file
function testRenameFile(cs){
    cs.getFile('fileNotRenamed.txt', {create: true, exclusive: true}, function(){
        cs.write('fileNotRenamed.txt', 'text/plain', 'test rename file', {create: false}, function(){
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
    cs.getAndWrite(url, 'video.mp4', 'video/mp4', {create: true}, function(){
        
        console.log('Write video complete');
    });
}

//Test used and remaining
function testUsedRemaining(cs){
    cs.usedAndRemaining(function (used,remaining) {
        console.log("Used bytes: "+ used);
        console.log("Remaining bytes: "+ remaining);
    });
}

function testListFiles(cs){
    //create dir
    cs.getDir('genres/comedy', {create: true}, function(){
        cs.write('genres/comedy/listedfiles1.txt', 'text/plain', 'test list files 1', {create: true});
        cs.write('genres/comedy/listedfiles2.txt', 'text/plain', 'test list files 2', {create: true});
        cs.write('genres/comedy/listedfiles3.txt', 'text/plain', 'test list files 3', {create: true});

        //list all files inside genres/comedy
        cs.ls('genres/comedy', function(arr) {
            var length = arr.length;
            for(var i =0; i < length; ++i){
                console.log(arr[i].name);
            }
        });
    });
}


//Run tests
function tests(cs){
    testwrite(cs);
    testCreateDir(cs);
    testDeleteDir(cs);
    testDeleteNonEmptyDir(cs);
    testRenameDir(cs);
    testCreateFile(cs);
    testDeleteFile(cs);
    testRenameFile(cs);
    testUsedRemaining(cs);
    testListFiles(cs);
    //testGetData(cs);
    //testGetAndWrite(cs);
}


window.onload = function(){

    var cs = new ChromeStore([ {path: 'videos/clips'}, {path: 'audio/wav', callback: function(){console.log('finished creating audio structure')}} ]);
    cs.init(1024*1024*1024, tests);
    $("#purgeButton").on("click",function(){
        cs.purge();
    });

    //Run get data test
    $("#getDataButton").on("click",function(){
        testGetData(cs);
    });

    //Run get data and write test
    $("#getAndWriteDataButton").on("click",function(){
        testGetAndWrite(cs);
    });
}
