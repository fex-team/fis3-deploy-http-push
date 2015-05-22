/**
 * fis.baidu.com
 */

function upload(receiver, to, release, content, file, callback){
    var subpath = file.subpath;
    fis.util.upload(
        //url, request options, post data, file
        receiver, null, { to : to + release }, content, subpath,
        function(err, res){
            if(err || res.trim() != '0'){
                fis.log.error('upload file [' + subpath + '] to [' + to +
                    '] by receiver [' + receiver + '] error [' + (err || res) + ']');
            } else {
                var time = '[' + fis.log.now(true) + ']';
                process.stdout.write(
                    ' - '.green.bold +
                    time.grey + ' ' + 
                    subpath.replace(/^\//, '') +
                    ' >> '.yellow.bold +
                    to + release +
                    '\n'
                );
                callback();
            }
        }
    );
}

module.exports = function (dest, file, content, settings, callback) {
    var root = fis.project.getProjectPath();
    var to = fis.util(dest.to);
    if(settings && settings.receiver) {
        upload(settings.receiver, to, dest.release, content, file, callback);
    }
};