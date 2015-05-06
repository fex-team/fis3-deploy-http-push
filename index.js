/**
 * fis.baidu.com
 */

var pth = require('path');

function getServerInfo() {
    var conf = pth.join(fis.project.getTempPath('server'), 'conf.json');
    if (fis.util.isFile(conf)) {
        return fis.util.readJSON(conf);
    }
    return {};
}

var serverRoot = (function(){
    var key = 'FIS_SERVER_DOCUMENT_ROOT';
    var serverInfo = getServerInfo();
    if(process.env && process.env[key]){
        var path = process.env[key];
        if(fis.util.exists(path) && !fis.util.isDir(path)){
            fis.log.error('invalid environment variable [' + key + '] of document root [' + path + ']');
        }
        return path;
    } else if (serverInfo['root'] && fis.util.is(serverInfo['root'], 'String')) {
        return serverInfo['root'];
    } else {
        return fis.project.getTempPath('www');
    }
})();

var cwd = fis.processCWD || process.cwd();

function normalizePath(to, root){
    if(to[0] === '.'){
        to = fis.util(cwd + '/' +  to);
    } else if(/^output\b/.test(to)){
        to = fis.util(root + '/' +  to);
    } else if(to === 'preview'){
        to = serverRoot;
    } else {
        to = fis.util(to);
    }
    return to;
}

function deliver(output, release, content, file, callback){
    if(!release){
        fis.log.error('unable to get release path of file['
            + file.realpath
            + ']: Maybe this file is neither in current project or releasable');
    }
    if(fis.util.exists(output) && !fis.util.isDir(output)){
        fis.log.error('unable to deliver file['
            + file.realpath + '] to dir['
            + output + ']: invalid output dir.');
    }
    var target;
    target = fis.util(output, release);
    fis.util.write(target, content);
    fis.log.debug(
        'release ' +
        file.subpath.replace(/^\//, '') +
        ' >> '.yellow.bold +
        target
    );
    callback();
}

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
    var to = normalizePath(dest.to, root);
    if(settings && settings.receiver) {
        upload(settings.receiver, to, dest.release, content, file, callback);
    } else {
        deliver(to, dest.release, content, file, callback);
    }
};