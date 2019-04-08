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
let Addpaper = require("./../Interface/taddpaper")

module.exports = function(app) {
    /*----------------------教师用户----------------------*/
    app.post('/api/tlogin', Teacher.tlogin);
    app.post('/api/tregister', Teacher.tregister);
    app.post('/api/tmain', Teacher.tmain);
    app.post('/api/tchangeMsg', Teacher.tchangeMsg); //修改信息
    app.get('/api/tsignout', Teacher.tsignout); //教师退出系统

    app.post('/api/taddpaper', Addpaper.taddpaper); //教师添加试卷,代码太复杂所以抽到Addpaper
    app.post('/api/tupdatepaper', Addpaper.tupdatepaper); //教师更新试卷，代码太复杂所以也抽到Addpaper

    app.get('/api/tgetAllpaper', Teacher.tgetAllpaper); //教师获取所有的试卷,搜索我的题库中的试卷也在这里实现

    app.get('/api/tgetMyQuestion', Teacher.tgetMyQuestion); //教师获取自己题库的题目,包含了搜索操作
    app.post('/api/tgetpapermsg', Teacher.tgetpapermsg); //教师修改试卷信息，一开始进入页面需要获取试卷信息
    app.post('/api/tdelpaper', Teacher.tdelpaper); //删除试卷

    app.get('/api/tgetAllQuestion', Teacher.tgetAllQuestion); //公共题库获取所有题目,包括了搜索操作

    app.post('/api/tupdateQuestion', Teacher.tupdateQuestion); //修改我的题库中的题目
    app.post('/api/tdelQuestion', Teacher.tdelQuestion); //删除我的题库中的题目
    app.post('/api/taddQuestion', Teacher.taddQuestion); //添加我的题库中的题目
    app.post('/api/taddQuestionToHub', Teacher.taddQuestionToHub); //添加公共题库的题库中的题目到我的题库，出题老师不变
    app.post('/api/tdelQuestionFromHub', Teacher.tdelQuestionFromHub); //移出我的题库中的不是我出的题目

    app.get('/api/tgetCheckPaperList', Teacher.tgetCheckPaperList); //获取需要打分的学生信息
    app.post('/api/tsubmitCheckPapers', Teacher.tsubmitCheckPapers); //提交打分
    app.post('/api/tupdatePaperStatus', Teacher.tupdatePaperStatus); //阅卷完毕，将试卷的status改为2(已阅卷)


    app.get('/api/tgetScorePaper', Teacher.tgetScorePaper); //获取需要打分的试卷和已经打分的试卷
    app.get('/api/tgetStudentScore', Teacher.tgetStudentScore); //查看成绩---获取学生成绩


    /*----------------------学生用户----------------------*/
    app.post('/api/slogin', Student.slogin);
    app.post('/api/sregister', Student.sregister);
    app.get('/api/sexamLogs', Student.sexamLogs); //学生个人中心--获取考试记录
    // app.get('/api/sexamTotal', Student.sexamTotal); //获取学生考试记录总数目
    app.post('/api/schangeMsg', Student.schangeMsg); //学生修改个人信息
    app.get('/api/ssignout', Student.ssignout); //学生退出系统
    app.get('/api/sgetExamInfo', Student.sgetExamInfo); //学生进入考试，获取考试信息
    app.post('/api/sSubmitExam', Student.sSubmitExam); //学生提交考试答案


}