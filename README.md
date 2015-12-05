# fis3 http 部署插件

FIS 默认的部署插件，提供本地部署以及远程upload部署能力。

## 安装

全局安装或者本地安装都可以。

```
npm install fis3-deploy-http-push
```

## 使用方法

也可以使用统一的 deploy 插件配置方法

```js
fis.match('*.js', {
    deploy: fis.plugin('http-push', {
        // 如果配置了 receiver，FIS 会把文件逐个 post 到接收端上
        receiver: 'http://www.example.com:8080/receiver.php',
        // 这个参数会跟随 POST 请求一起发送
        to: '/home/fis/www',
        // 缓存目录，已经发送成功的文件会追加到 "postsuccess.txt"
        cacheDir: __dirname + '/.cache'
    })
})
```
