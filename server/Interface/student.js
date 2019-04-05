// server-----Interface--student.js
const Student = require('./../models/students');
const Paper = require('./../models/papers');
const crypto = require('crypto');

function md5(str) {
    let obj = crypto.createHash('md5');
    obj.update(str);
    return obj.digest('hex');
}

exports.sregister = function(req, res) {
    let user = req.body.user;
    Student.findOne({
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
                user.exams = [];
                Student.create(user, (err1, doc1) => {
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

exports.slogin = function(req, res) {
    let id = req.body.userId;
    let pwd = req.body.password;
    Student.findOne({
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
                            grade: doc.grade,
                            class: doc.class
                        }
                    })
                } else {
                    res.json({
                        status: '0',
                        msg: 'fail',
                    })
                }

            } else {
                res.json({
                    status: '2',
                    msg: '请先注册',
                })
            }
        }
    })
}

exports.schangeMsg = function(req, res) { //smsgCenter里面的submit方法里调用
    let user = req.body.user;
    let password = md5(req.body.password); //原密码
    user.password = md5(user.password); //新密码
    Student.findOne({
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
                    Student.update({
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

exports.ssignout = function(req, res) { //smsgCenter里面调用
    req.session.userId = '';
    req.session.password = '';
    res.json({
        status: '0',
        msg: 'success',
    })
}


// 获取考试记录
exports.sexamLogs = function(req, res) { //smsgCenter里面的getExamData方法里调用
    let userId = req.param("userId");

    let pageSize = parseInt(req.param("pageSize")); //每页条数
    let pageNumber = parseInt(req.param("pageNumber")); //第几页
    let skip = (pageNumber - 1) * pageSize; // 跳过几条

    let txt = req.param("txt");
    let reg = new RegExp(txt, 'i'); // 在nodejs中，必须要使用RegExp，来构建正则表达式对象。
    Student.findOne({
        "userId": userId
    }, {
        "exams": {
            $slice: [skip, pageSize]
        }
    }).populate({
        path: 'exams._paper',
        select: 'name',
        match: {
            name: reg
        }
    }).exec((err1, doc1) => {
        if (err1) {
            res.json({
                status: '1',
                msg: err1.message
            })
        } else {
            if (doc1) {
                res.json({
                    status: '0',
                    msg: 'success',
                    result: doc1.exams,
                    total: doc1.exams.length
                })
            } else {
                res.json({
                    status: '2',
                    msg: '没有该试卷'
                })
            }
        }
    })
}

// exports.sexamTotal = function(req, res) { //获取符合条件的考试的总条数,smsgCenter里面的getExamTotal方法里调用
//     let userId = req.param("userId");
//     let txt = req.param("txt");
//     let reg = new RegExp(txt, 'i'); // 在nodejs中，必须要使用RegExp，来构建正则表达式对象。

//     Student.findOne({
//         "userId": userId
//     }).populate({
//         path: 'exams._paper',
//         select: 'name',
//         match: {
//             name: reg
//         }
//     }).exec((err1, doc1) => {
//         if (err1) {
//             res.json({
//                 status: '1',
//                 msg: err1.message
//             })
//         } else {
//             if (doc1) {
//                 console.log(doc1);
//                 res.json({
//                     status: '0',
//                     msg: 'success',
//                     result: doc1.exams.length,
//                 })
//             } else {
//                 res.json({
//                     status: '2',
//                     msg: '没有该试卷'
//                 })
//             }
//         }
//     })
// }

exports.sgetExamInfo = function(req, res) { //获取考试题目等数据,sdoExam的init方法里面调用
    let paperId = req.param('paperId');
    let questionData = [];
    Paper.findOne({
        '_id': paperId
    }).populate({
        path: '_questions'
    }).exec((err1, doc1) => {
        if (err1) {
            res.json({
                status: '1',
                msg: err.message
            })
        } else {
            if (doc1) {
                res.json({
                    status: '0',
                    msg: 'success',
                    result: doc1
                })
            } else {
                res.json({
                    status: '2',
                    msg: '没有该试卷'
                })
            }
        }
    })
}