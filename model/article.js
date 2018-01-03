/**
 * Created by Administrator on 2017/12/27.
 */
// 引入此模块
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

mongoose.Promise = Promise;
const connection = mongoose.createConnection('mongodb://127.0.0.1:27017/expressblog');

//定义模型 确定数据库里表结构
var articleSchema = new mongoose.Schema({
    title: String,
    content: String,
    img: String,
    //类型是主键类型，引用的模型是user
    user: {type: ObjectId, ref: 'user'},
    //发表日期 类型是Date,默认值是now,当前时间
    createAt: {type: Date, default: Date.now}
});

//再定义model
var articleModel = connection.model('article', articleSchema);
module.exports = articleModel;