// var express = require('express');
// var router = express.Router();

// const Student = require('./../Interface/student');
// const Teacher = require('./../Interface/teacher');

/* GET users listing. */
// router.get('/', function(req, res, next) {
//     res.send('respond with a resource');
// });
// module.exports = router;
// -------------------------------

//server---router/router.js

let Student = require('./../Interface/student');
let Teacher = require('./../Interface/teacher');

module.exports = function(app) {
    /*----------------------教师用户----------------------*/
    app.post('/api/tlogin', Teacher.tlogin);
    app.post('/api/tregister', Teacher.tregister);
    app.post('/api/tmain', Teacher.tmain);
    app.post('/api/tchangeMsg', Teacher.tchangeMsg); //修改信息
    app.get('/api/tsignout', Teacher.tsignout); //教师退出系统
    // app.get('/api/taddquestion', Teacher.taddquestion); //教师添加题目
    app.post('/api/taddpaper', Teacher.taddpaper); //教师添加试卷
    app.post('/api/tupdatepaper', Teacher.tupdatepaper); //教师更新试卷
    app.post('/api/tgetAllpaper', Teacher.tgetAllpaper); //教师获取所有的试卷
    app.post('/api/tgetmyquestion', Teacher.tgetmyquestion); //教师获取自己创造的题目
    app.post('/api/tgetpapermsg', Teacher.tgetpapermsg); //教师修改试卷信息，一开始进入页面需要获取试卷信息
    app.post('/api/tgetallquestion', Teacher.tgetallquestion); //公共题库获取所有题目
    app.post('/api/tdelpaper', Teacher.tdelpaper); //删除试卷


    /*----------------------学生用户----------------------*/
    app.get('/api/look', Student.look);
    app.post('/api/slogin', Student.slogin);
    app.post('/api/sregister', Student.sregister);
    app.post('/api/smain', Student.smain); //学生个人中心--获取考试记录
    // app.post('/api/stest', Student.stest); //学生考试中心
    app.post('/api/schangeMsg', Student.schangeMsg); //学生修改个人信息
    app.get('/api/ssignout', Student.ssignout); //学生退出系统



}