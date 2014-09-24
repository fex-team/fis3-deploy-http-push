# fis-deploy-default

## 说明

FIS默认的部署插件，提供本地部署以及远程upload部署能力，无需手动安装就可以在FIS中直接使用

## 使用方法

兼容原有的deploy配置方法

```javascript
fis.config.set('deploy', {
    local : {
        to : './output'
    }
});
```

也可以使用统一的deploy插件配置方法

```javascript
fis.config.set('settings.deploy.default', {
    static : [
        {
            from : '/js',
            to: './output/static'
        },
        {
            from : '/css',
            to: './output/static'
        }
    ],
    remote : {
        //如果配置了receiver，fis会把文件逐个post到接收端上
        receiver : 'http://www.example.com:8080/receiver.php',
        //从产出的结果的static目录下找文件
        from : '/',
        //保存到远端机器的/home/fis/www/static目录下
        //这个参数会跟随post请求一起发送
        to : '/home/fis/www',
        //通配或正则过滤文件，表示只上传所有的js文件
        include : '**.js',
        //widget目录下的那些文件就不要发布了
        exclude : /\/widget\//i,
        //支持对文件进行字符串替换
        replace : {
            from : 'http://www.online.com',
            to : 'http://www.offline.com'
        }
    }
});
```