//生成主题颜色变量，供生成过程中使用
// require('./make-element-theme.js')();

var args = require('yargs').argv;
require('./check-versions')()
var config = require('./config')

var isMock = args.mock;
var port = args.port;
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = JSON.parse(config.env.NODE_ENV)
}
var utils = require('./utils')
var opn = require('opn')
var path = require('path')
var express = require('express')
var webpack = require('webpack')
var proxyMiddleware = require('http-proxy-middleware')
var webpackConfig = process.env.NODE_ENV === 'production'
    ? require('./webpack.prod.conf')
    : require('./webpack.dev.conf')

// default port where dev server listens for incoming traffic
var port = port || process.env.PORT || config.port
// automatically open browser, if not set will be false
var autoOpenBrowser = !!config.autoOpenBrowser
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
var proxyTable = config.proxyTable

var app = express()
var compiler = webpack(webpackConfig);

// mock

// 设置代理

// var routes = require('../mock/router');
// var router = express.Router();
// app.get('/', function (req, res, next) {
//   	res.send('> hello welcome to dev server');
// })

// app.use(router);
// isMock && routes(router);

//进度
var readline = require('readline');
compiler.apply(new webpack.ProgressPlugin((percentage, msg) => {
    //移动光标
    readline.clearLine(process.stdout);
    console.log('  ' + (percentage * 100).toFixed(2) + '%', msg);
    readline.moveCursor(process.stdout, 0, -1);
}));

var devMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    quiet: true,
    serverSideRender: false,
    watchOptions: {
        //ignored: 'node_modules/**/*.js', //忽略不用监听变更的目录
        aggregateTimeout: 500, //防止重复保存频繁重新编译,500毫秒内重复保存不打包
        poll: 1000 //每秒询问的文件变更的次数
    },
    writeToDisk: false,
})

var hotMiddleware = require('webpack-hot-middleware')(compiler, {
    log: () => {
    }
})
/* webpack 4 reload everytime*/
// force page reload when html-webpack-plugin template changes
// compiler.plugin('compilation', function (compilation) {
//     compilation.plugin('html-webpack-plugin-after-emit', function (data) {
//         hotMiddleware.publish({action: 'reload'})
//     })
// })

// proxy api requests
proxyTable && Object.keys(proxyTable).forEach(function (context) {
    var options = proxyTable[context]
    if (typeof options === 'string') {
        options = {target: options}
    }
    app.use(proxyMiddleware(options.filter || context, options))
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// serve pure static assets
app.use('/static/', express.static(path.join(__dirname, '../src/static')));

// 这里将dev的目录设置为静态目录，方便自己手动声称文件
app.use(express.static(config.assetsRoot));
var uri = 'http://localhost:' + port

var _resolve
var readyPromise = new Promise(resolve => {
    _resolve = resolve
})


console.log('> Starting dev server...')
devMiddleware.waitUntilValid(() => {
    console.log('> Listening at ' + uri + '\n')
    console.log('> Listening at IP ' + utils.getIPAdress())
    let entries = webpackConfig.entry;

	Object.keys(entries).map((entry, index) => {
		console.log('> Module ' + index + ' :' + '/' + entry + '/index.html');
	})
    // when env is testing, don't need open it
    if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
        opn(uri)
    }
    _resolve()
})

var server = app.listen(port)

module.exports = {
    ready: readyPromise,
    close: () => {
        server.close()
    }
}

// if (process.argv.indexOf('--mock') > -1)
//     require('dynamic-mocker').checkStart('./mock/mock-config.js')

