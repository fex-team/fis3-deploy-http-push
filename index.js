/**
 * fis.baidu.com
 */
var _ = fis.util;

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

function upload(receiver, to, release, content, file, callback) {
  var subpath = file.subpath;
  fis.util.upload(
    //url, request options, post data, file
    receiver, null, {
      to: to + release
    }, content, subpath,
    function(err, res) {
      if (err || res.trim() != '0') {
        callback('upload file [' + subpath + '] to [' + to +
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

module.exports = function(options, modified, total, callback) {
  if (!options.to) {
    throw new Error('options.to is required!');
  } else if (!options.receiver) {
    throw new Error('options.receiver is required!');
  }

  // 处理缓存文件
  var cachePostSuccessFile;
  var cachePostSuccess;
  if (options.cacheDir) { // 配置了缓存目录
    mkdirp.sync(options.cacheDir);
    cachePostSuccessFile = path.join(options.cacheDir, 'postsuccess.txt');
    if (fs.existsSync(cachePostSuccessFile)) {
      cachePostSuccess = String(fs.readFileSync(cachePostSuccessFile)).split(/\n\r?/);
    }
  }

  var to = options.to;
  var receiver = options.receiver;

  var steps = [];

  modified.forEach(function(file) {
    var cacheHash;
    if (cachePostSuccessFile) { // 需要处理缓存
      // e.g. "http://127.0.0.1:8080/receiver,/home/public,/css/base.css"
      cacheHash = [receiver.replace(/\?.*$/, ''), to, file.getUrl()].join();
      if (cachePostSuccess && cachePostSuccess.indexOf(cacheHash) >= 0) {
        var time = '[' + fis.log.now(true) + ']';
        process.stdout.write(
          ' - '.green.bold +
          time.grey + ' ' +
          file.subpath.replace(/^\//, '') +
          ' cached '.cyan.bold +
          to + file.getHashRelease() +
          '\n'
        );
        return;
      }
    }
    var reTryCount = options.retry;

    steps.push(function(next) {
      var _upload = arguments.callee;

      upload(receiver, to, file.getHashRelease(), file.getContent(), file, function(error) {
        if (error) {
          if (!--reTryCount) {
            throw new Error(error);
          } else {
            _upload();
          }
        } else {
          if (cachePostSuccessFile) { // 需要处理缓存
            // 记录已经提交成功的文件
            fs.appendFileSync(cachePostSuccessFile, cacheHash + '\n');
          }
          next();
        }
      });
    });
  });

  _.reduceRight(steps, function(next, current) {
    return function() {
      current(next);
    };
  }, callback)();
};

module.exports.options = {
  // 允许重试两次。
  retry: 2
};
