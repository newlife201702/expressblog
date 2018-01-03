var express = require('express');
var path = require('path');
//处理收藏夹图标的
var favicon = require('serve-favicon');
//写日志的
var logger = require('morgan');
//解释cookier的  req.cookie方法用来设置cookie req.cookies  把请求中的cookie封装成对象
var cookieParser = require('cookie-parser');
//解析请求体的 req.body
var bodyParser = require('body-parser');
//加载路由 根据请求的路径不同，进行不同的处理
var index = require('./routes/index');
var users = require('./routes/users');
var articles = require('./routes/articles');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');

var app = express();

// view engine setup
//设置模板文件的存放路径
app.set('views', path.join(__dirname, 'views'));
// 设置模板引擎
app.set('view engine', 'html');
//设置一下对于html格式的文件，渲染的时候委托ejs的渲染方面来进行渲染
app.engine('html', require('ejs').renderFile);
//使用了会话中间件之后，req.session
var mongoose = require('mongoose');
// 原生的ES6 Promise
mongoose.Promise = global.Promise;
// mongoose.Promise = require('bluebird');
//mongoose mpromise被废弃警告,使用 bluebird promise
const connection = mongoose.createConnection('mongodb://127.0.0.1:27017/expressblog');
app.use(session({
    secret: 'expressblog',
    resave: false,
    saveUninitialized: true,
    //指定保存的位置
    store: new MongoStore({mongooseConnection: connection})
}));
app.use(flash());
// uncomment after placing your favicon in /public
//需要你把收藏夹的图标文件放在 public下面，如果没有放置文件直接打开注释的话会报错
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//使用日志中间件
app.use(logger('dev'));
//解析JSON类型的请求 通过请求中的Content-Type {}
app.use(bodyParser.json());
//解析urlencoded类型的请求 通过请求中的Content-Type name=zfpx
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
//静态文件服务中间件 指定静态文件根目录
app.use(express.static(path.join(__dirname, 'public')));
//配置模板的中间件
app.use(function (req, res, next) {
    //res.locals才是真正的渲染模板的对象
    res.locals.user = req.session.user; // req.session.user 是一个对象，res.locals.user 指向了它的引用，所以值会跟着变
    //flash取出来的是一个数组
    res.locals.success = req.flash("success").toString();
    res.locals.error = req.flash("error").toString();
    next();
});

//路由配置
app.use('/', index);
//这里的/才是一级路径，真正的根目录
app.use('/users', users);
app.use('/articles', articles);

// catch 404 and forward to error handler
//捕获404的错误并且转发到错误处理中 间件里去
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
//错误处理
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
