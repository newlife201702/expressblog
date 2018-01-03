/**
 * Created by Administrator on 2017/12/27.
 */
// 引入此模块
var mongoose = require('mongoose');
// 原生的ES6 Promise
mongoose.Promise = Promise;
//mongoose mpromise被废弃警告,使用 bluebird promise
const connection = mongoose.createConnection('mongodb://127.0.0.1:27017/expressblog');
//定义模型 确定数据库里表结构
var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    avatar: String
});
//再定义model 第一个参数：集合的名称
var userModel = connection.model("user", userSchema);
module.exports = userModel;