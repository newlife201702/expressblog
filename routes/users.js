var express = require('express');
var userModel = require('../model/user');
var validate = require('../middle/index.js');
var crypto = require('crypto');
//生成一个路由实例
var router = express.Router();
//当一个
var mongoose = require('mongoose');
var user = mongoose.model('user');

function md5(str) {
    return crypto.createHash('md5')
        .update(str).digest('hex');//hex十六进制
}

/* GET users listing. */
//用户注册 当用户通过get方法请求 /users/reg的时候，执行此回调
//要求登陆前才能访问
router.get('/reg', validate.checkNotLogin, function (req, res) {
    res.render('user/reg');
});

//提交用户注册的表单
router.post('/reg', validate.checkNotLogin, function (req, res) {
    var user = req.body;
    user.avatar = 'https://secure.gravatar.com/avatar/' + md5(user.email);
    user.password = md5(user.password);
    userModel.create(user, function (err, doc) {
        if (err) {
            req.flash("error", err);
            res.redirect("back");//返回到上一个页面
        } else {
            //把保存之后的用户放置到此用户会话的user属性上
            req.session.user = doc;
            req.flash("success", "注册成功");
            res.redirect("/");
        }
    });
});

//用户登录 当用户通过get方法请求 /users/reg的时候，执行此回调
router.get('/login', validate.checkNotLogin, function (req, res) {
    res.render('user/login');
});

//提交用户登录的表单
router.post('/login', validate.checkNotLogin, function (req, res) {
    var user = req.body;
    user.password = md5(user.password);
    userModel.findOne(user, function (err, user) {
        if (user === null) {
            req.flash("error", "登录失败");
            return res.redirect("back");//返回到上一个页面
        } else {
            //把用户放置到此用户会话的user属性上
            req.session.user = user;
            req.flash("success", "登录成功");
            res.redirect("/");
        }
    });
});

//退出登录
router.get('/logout', validate.checkLogin, function (req, res) {
    req.session.user = null;
    res.redirect("/");
});

module.exports = router;
