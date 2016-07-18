# fis3 http 部署插件

FIS 默认的部署插件，提供本地部署以及远程upload部署能力。

## 安装

全局安装或者本地安装都可以。

```
npm install fis3-deploy-http-push --save-dev
```

## 使用方法

也可以使用统一的 deploy 插件配置方法

```javascript
fis.match('*.js', {
    deploy: fis.plugin('http-push', {
        //如果配置了receiver，fis会把文件逐个post到接收端上
        receiver: 'http://www.example.com:8080/receiver.php',
        //这个参数会跟随post请求一起发送
        to: '/home/fis/www',
        // 附加参数, 后端通过 $_POST['xx'] 获取
        // 如果 data 中 含有 to 这个 key, 那么上面那个to参数会覆盖掉data里面的to
        data: {
            token : 'abcdefghijk',
            user : 'maxming',
            uid : 1
        }
    })
})
```

## 另类使用方法

比如: 部署时需要 token 输入

举一反三

```javascript
const crypto = require('crypto');
const readlineSync = require('readline-sync');
fis.match('**', {
  deploy: [
    function (options, modified, total, next) {
      var token = readlineSync.question('\r\n请输入授权token : ', {
        hideEchoBack: true
      });
      if (!token) {
        return false;
      }
      var md5 = crypto.createHash('md5');
      fis.set('project.token', md5.update(token).digest('hex'));
      next();
    },
    function () {
      arguments[0] = {
        //如果配置了receiver，fis会把文件逐个post到接收端上
        receiver: 'http://127.0.0.1/receiver.php?debug=false',
        // receiver: 'http://127.0.0.1/receiver.php',
        //这个参数会跟随post请求一起发送
        to: '/home/fis/www',
        // to: '/Users/fis/www',
        // 附加参数, 后端通过 $_POST['xx'] 获取
        data: {
          token: fis.get('project.token')
        }
      };
      require('fis3-deploy-http-push').apply(this, arguments);
    }
  ]
});
```
