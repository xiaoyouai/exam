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
    app.get('/api/taddquestion', Teacher.taddquestion); //教师添加题目
    app.post('/api/taddpaper', Teacher.taddpaper); //教师添加试卷




    /*----------------------学生用户----------------------*/
    app.get('/api/look', Student.look);
    app.post('/api/slogin', Student.slogin);
    app.post('/api/sregister', Student.sregister);
    app.post('/api/smain', Student.smain); //学生个人中心--获取考试记录
    // app.post('/api/stest', Student.stest); //学生考试中心
    app.post('/api/schangeMsg', Student.schangeMsg); //学生修改个人信息
    app.get('/api/ssignout', Student.ssignout); //学生退出系统



}