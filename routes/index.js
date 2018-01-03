var express = require('express');
var articleModel = require('../model/article');
//当一个 schema 中引用了另一个 shema，需要在使用populate方法转成对象所在的js文件中引入被引用的那个model
//不然会报错：MissingSchemaError: Schema hasn't been registered for model "user"
var user = require('../model/user');
var markdown = require('markdown').markdown;
//这是一个路由的实例
var router = express.Router();

/* GET home page. */
//当用户访问/的时候，执行对应的回调函数
router.get('/', function (req, res) {
    //先配置参数，然后再执行查询
    //我们查出来的article.user是ID，需要通过populate转成对象
    articleModel.find().populate('user').exec(function (err, articles) {
        if (articles === null) {
            req.flash('error', err);
            return res.redirect('/');
        }
        articles.forEach(function (article) {
            article.content = markdown.toHTML(article.content);
        });
        //第二个参数对象最后会合并到res.locals对象上，并渲染模板
        res.render('index', {articles: articles});
    });
    // res.render('index');
});

module.exports = router;
