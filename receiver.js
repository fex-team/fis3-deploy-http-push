router.post("/deploy", uploads.single('file'), (req, res) => {
  log.debug("=======================");
  log.debug("req.body.to", req.body.to);
  log.debug("req.body.type", req.body.type);
  log.debug("req.file", req.file.path);
  let to = req.body && req.body.to,
      type = req.body && req.body.type,
      tmpfile = req.file && req.file.path;

  if (!to || !tmpfile) {
    return res.status(500).json({ "error": "request body must have to property and file object" });
  }

  if(type === "zip"){
    fs.existsAsync(to).then((exists) => {
      log.debug("file exists: ", to, ", exists: ", exists);
      if (!exists) {
        return mkdirp.mkdirpAsync(to);
      }
    }).then(function(){
        var zip = new admZip(tmpfile);
        zip.extractAllTo(to, true);
      })
      .then(() => {
        res.status(200).send('0');
      })
      .catch(err => {
        log.error(err.stack, err.message);
        return res.status(500).send("mkdirp fail: " + to)
      });
  }else{
    to = decodeURIComponent(to);
    fs.existsAsync(to).then((exists) => {
      log.debug("file exists: ", to, ", exists: ", exists);
      if (exists) {
        return fs.unlinkAsync(to);
      } else {
        return mkdirp.mkdirpAsync(path.dirname(to));
      }
    }).then(() => fs.renameAsync(tmpfile, to))
      .then(() => res.status(200).send('0'))
      .catch(err => {
        log.error(err.stack, err.message);
        return res.status(500).send("mkdirp fail: " + to)
      });
  }
});