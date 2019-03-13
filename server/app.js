var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sessionParser = require('express-session'); //加载解析session的中间件,用cookie来保存sessionID,认使用内存来存 session

require('./database/db') // 链接数据

var indexRouter = require('./routes/index');
var myrouter = require('./routes/routers');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 使用session
app.use(sessionParser({
    secret: 'gahtfhsg', // 用来对session id相关的cookie进行签名,防篡改
    name: 'myuser', //设置cookie中，保存session的字段名称
    cookie: { maxAge: 3600000 }, // 有效期，单位是毫秒
    resave: true, // 是否每次都重新保存会话
    rolling: true, //每个请求都重新设置一个cookie
    saveUninitialized: false //强制未初始化的session保存到数据库
}));
app.use((req, res, next) => {
    let id = req.session.userId;
    app.locals.userId = id;
    return next();
})

// app.use('/', indexRouter);
// app.use('/users', usersRouter);
indexRouter(app);
myrouter(app);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;