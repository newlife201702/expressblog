/**
 * Created by Administrator on 2017/12/27.
 */
var express = require('express');
var mongoose = require('mongoose');
var multer = require('multer');
var articleModel = require('../model/article');
var fs = require('fs');
//这是一个路由的实例
var router = express.Router();
//指定文件元素的存储方式
var storage = multer.diskStorage({
    //保存文件的路径
    destination: function (req, file, cb) {
        cb(null, '../public/images')
    },
    //指定保存的文件名
    filename: function (req, file, cb) {
        cb(null, Date.now() + '.' + file.mimetype.slice(file.mimetype.indexOf('/') + 1))
    }
});
var upload = multer({storage: storage});

//请求一个空白发表文章页面
router.get('/add', function (req, res) {
    res.render('article/add', {article: {}});
});

//提交文章数据 里面放置的是文件域的名字
router.post('/add', upload.single('img'), function (req, res) {
    var article = req.body;
    var _id = article._id;
    //有值是表示修改
    if (_id) {
        //set要更新字段
        var set = {title: article.title, content: article.content};
        //如果新上传了文件，那么更新img字段
        if (req.file) {
            console.log(set);
            set.img = '/images/' + req.file.filename;
            console.log(set);
        }
        articleModel.update({_id: _id}, {$set: set}, function (err, article) {
            if (err) {
                req.flash('error', '更新文章失败');
                return res.redirect('back');
            } else {
                req.flash('success', '更新文章成功');
                return res.redirect('/');
            }
        });
    } else {//没有值是表示增加
        // 将 article._id 置为 null，不然在执行 create 方法时，会因为已经存在一个 _id 关键字段而保存数据失败
        article._id = null;
        if (req.file) {
            article.img = '/images/' + req.file.filename;
        }
        var user = req.session.user;
        article.user = user._id;//user是个对象，但保存进数据库里的是个ID字符串
        articleModel.create(article, function (err, article) {
            if (err) {
                req.flash('error', '发表文章失败');
                return res.redirect('back');
            } else {
                req.flash('success', '发表文章成功');
                return res.redirect('/');
            }
        });
    }
});

//增加文章的详情页
router.get('/detail/:_id', function (req, res) {
    articleModel.findById(req.params._id, function (err, article) {
        res.render('article/detail', {article: article});
    });
});

//删除此文章
router.get('/delete/:_id', function (req, res) {
    var img = null;
    // 最开始想通过findOne方法得到文章中图片的地址，然后在remove方法中进行文章删除操作成功提示前把图片也进行删除；但是通过findOne方法不能正确得到图片的地址的值，原因是findOne方法的回调函数中err,article均为null，也就不能通过article.img得到图片地址img额的值，所以最终使用findOneAndRemove方法实现删除图片功能
    // articleModel.findOne({_id: req.params._id}, function (err, article) {
    //     console.log(err); // null
    //     console.log(article); // null
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         img = article.img; // 报错：img of null
    //     }
    // });
    // articleModel.remove({_id: req.params._id}, function (err, result) {
    //     if (err) {
    //         req.flash('error', '删除失败');
    //         res.redirect('back');
    //     } else {
    //         fs.unlink('\\expressblog\\public\\' + img, function (err) {
    //             if (err) {
    //                 req.flash('error', '删除图片失败');
    //             }
    //             req.flash('success', '删除图片成功');
    //         });
    //         req.flash('success', '删除成功');
    //         res.redirect('/');
    //     }
    // });
    articleModel.findOneAndRemove({_id: req.params._id}, {select: img}, function (err, article) {
        img = article.img;
        if (err) {
            req.flash('error', '删除失败');
            res.redirect('back');
        } else {
            // 删除文章时同时把文章中包含的图片也删除，防止多余图片堆积
            fs.unlink('\\expressblog\\public\\' + img, function (err) {
                if (err) {
                    req.flash('error', '删除图片失败');
                }
                req.flash('success', '删除图片成功');
            });
            req.flash('success', '删除成功');
            res.redirect('/');
        }
    });
});

//增跳转到修改文章页面
router.get('/update/:_id', function (req, res) {
    articleModel.findById(req.params._id, function (err, article) {
        res.render('article/add', {article: article});
    });
});

module.exports = router;