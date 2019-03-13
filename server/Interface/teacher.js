// server-----Interface--teacher.js
const Teacher = require('./../models/teachers');
const Paper = require('./../models/papers');
const Question = require('./../models/questions');

const crypto = require('crypto');

function md5(str) {
    let obj = crypto.createHash('md5');
    obj.update(str);
    return obj.digest('hex');
}

exports.tregister = function(req, res) {
    let user = req.body.user;
    Teacher.findOne({
        userId: user.userId
    }, (err, doc) => {
        if (err) {
            res.json({
                status: '1',
                msg: err.message
            })
        } else {
            if (doc) {
                res.json({
                    status: '2',
                    msg: '用户已存在',
                })
            } else {
                user.password = md5(user.password);
                user._papers = [];
                user._questions = [];

                Teacher.create(user, (err1, doc1) => {
                    if (err1) {
                        res.json({
                            status: '1',
                            msg: err1.message
                        })
                    } else {
                        if (doc1) {
                            res.json({
                                status: '0',
                                msg: 'success'
                            })
                        } else {
                            res.json({
                                status: '3',
                                msg: '注册失败'
                            })
                        }
                    }
                })
            }
        }
    })
}

exports.tlogin = function(req, res) {
    let id = req.body.userId;
    let pwd = req.body.password;
    Teacher.findOne({
        userId: id
    }, (err, doc) => {
        if (err) {
            res.json({
                status: '1',
                msg: err.message
            })
        } else {
            if (doc) {
                if (doc.password == md5(pwd)) {
                    req.session.userId = doc.userId;
                    req.session.password = doc.password;
                    res.json({
                        status: '0',
                        msg: 'success',
                        result: {
                            userName: doc.userName,
                            userId: doc.userId,
                            grade: 0,
                            class: 0
                        }
                    })
                } else {
                    res.json({
                        status: '0',
                        msg: 'fail',
                    })
                }

            }
        }
    })
}

//获取教师的主要信息
exports.tmain = function(req, res) {
    let userId = req.body.userId;
    Teacher.findOne({
        userId: userId
    }, (err, doc) => {
        if (err) {
            res.json({
                status: '1',
                msg: err.message
            })
        } else {
            if (doc) {
                res.json({
                    status: '0',
                    msg: '',
                    result: doc._papers
                })
            }
        }
    })
}

exports.tchangeMsg = function(req, res) {
    let user = req.body.user;
    let password = md5(req.body.password); //原密码
    user.password = md5(user.password); //新密码
    Teacher.findOne({
        userId: user.userId
    }, (err, doc) => {
        if (err) {
            res.json({
                status: '1',
                msg: err.message
            })
        } else {
            if (doc) {
                if (doc.password == password) {
                    Teacher.update({
                        "userId": user.userId
                    }, user, (err2, doc2) => {
                        if (err2) {
                            res.json({
                                status: '1',
                                msg: err.message
                            })
                        } else {
                            req.session.password = user.password;
                            res.json({
                                status: '0',
                                msg: 'success',
                                result: {
                                    userName: user.userName,
                                    userId: user.userId,
                                    grade: 0,
                                    class: 0
                                }
                            })
                        }
                    })
                } else {
                    res.json({
                        status: '2',
                        msg: '原密码输入错误，无法修改',
                    })
                }

            }
        }
    })
}

exports.tsignout = function(req, res) {
    req.session.userId = '';
    req.session.password = '';
    res.json({
        status: '0',
        msg: 'success',
    })
}

exports.taddpaper = function(req, res) { //添加试卷
    let paperData = req.body.paperData;
    let userId = req.body.userId;
    Teacher.findOne({
        userId: userId
    }, (err, doc) => {
        if (err) {
            res.json({
                status: '1',
                msg: err.message
            })
        } else {
            if (doc) {
                let data = {
                    name: paperData.name,
                    totalPoints: paperData.totalPoints,
                    time: paperData.time,
                    examclass: paperData.examclass,
                    startTime: paperData.startTime,
                    _teacher: doc._id,
                    _questions: []
                }
                Paper.create(data, (err1, doc1) => {
                    if (err1) {
                        res.json({
                            status: '1',
                            msg: err1.message
                        })
                    } else {
                        if (doc1) {
                            doc._papers.push(doc1._id); // 教师中添加该试卷
                            doc.save(); // 很重要 不save则没有数据
                            paperData._questions.forEach(item => {
                                item._papers = [];
                                item._papers.push(doc1._id);
                                item._teacher = doc._id;
                            })
                            Question.create(paperData._questions, function(err2, doc2) {
                                if (err2) {
                                    res.json({
                                        status: '1',
                                        msg: err2.message
                                    })
                                } else {
                                    if (doc2) {
                                        doc2.forEach(item => { doc1._questions.push(item._id) });
                                        doc1.save();
                                        res.json({
                                            status: '0',
                                            msg: 'success'
                                        })
                                    } else {
                                        res.json({
                                            status: '2',
                                            msg: '没找到题目'
                                        })
                                    }
                                }
                            })
                        } else {
                            res.json({
                                status: '2',
                                msg: '没找到试卷'
                            })
                        }
                    }
                })
            } else {
                res.json({
                    status: '2',
                    login: false,
                    msg: '请登录'
                })
            }
        }
    })
}

exports.taddquestion = function(req, res) {

}