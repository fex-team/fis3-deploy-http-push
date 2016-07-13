/**
 * fis.baidu.com
 */
var _ = fis.util;
var path = require('path');

function upload(receiver, to, data, release, content, file, callback) {
  var subpath = file.subpath;
  data['to'] = path.join(to, release);
  fis.util.upload(
      //url, request options, post data, file
      receiver, null, data, content, subpath,
      function(err, res) {
        if (err || res.trim() != '0') {
          callback('upload file [' + subpath + '] to [' + to + '] by receiver [' + receiver + '] error [' + (err || res) + ']');
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

  var to = options.to;
  var receiver = options.receiver;
  var data = options.data || {};

  var steps = [];

  modified.forEach(function(file) {
    var reTryCount = options.retry;

    steps.push(function(next) {
      var _upload = arguments.callee;

      upload(receiver, to, data, file.getHashRelease(), file.getContent(), file, function(error) {
        if (error) {
          if (options.retry && !--reTryCount) {
            throw new Error(error);
          } else {
            _upload();
          }
        } else {
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
