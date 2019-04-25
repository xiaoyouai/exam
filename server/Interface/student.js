// server-----Interface--student.js
const Student = require('./../models/students');
const Paper = require('./../models/papers');
const Question = require('./../models/questions');
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
exports.sexamLogs = function(req, res) { //smsgCenter里面的getExamData方法里调用,sexamCenter的getExamData方法里调用
    let userId = req.param("userId");
    let pageSize = parseInt(req.param("pageSize")); //每页条数
    let pageNumber = parseInt(req.param("pageNumber")); //第几页
    let skip = (pageNumber - 1) * pageSize; // 跳过几条

    let txt = req.param("txt");
    let reg = new RegExp(txt, 'i'); // 在nodejs中，必须要使用RegExp，来构建正则表达式对象。
    Student.findOne({
        "userId": userId,
    }, {
        "exams": {
            $slice: [skip, pageSize]
        }
    }).populate({
        path: 'exams._paper',
        select: 'name status _questions',
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
                let sum = -1;
                let len = doc1.exams.length;
                if (len === 0) {
                    res.json({
                        status: '0',
                        msg: 'success',
                        result: doc1.exams,
                        total: doc1.exams.length
                    })
                } else {
                    doc1.exams.forEach(item => {
                        sum++;
                        if ((new Date() - new Date(item.startTime)) / 60000 > item.date && item.answers.length === 0) {
                            //说明考试缺考了
                            item.examStatus = 2;
                            item._paper._questions.forEach((qid) => {
                                item.answers.push({ //学生填入题目信息
                                    _question: qid,
                                    answer: '考试缺考，无答案'
                                })
                            })
                        }
                        if (sum === len - 1) {
                            doc1.save();
                            res.json({
                                status: '0',
                                msg: 'success',
                                result: doc1.exams,
                                total: doc1.exams.length
                            })
                        }
                    })
                }


            } else {
                res.json({
                    status: '2',
                    msg: '没有该试卷'
                })
            }
        }
    })
}


exports.sgetExamInfo = function(req, res) { //获取考试题目等数据,sdoExam的init方法里面调用
    let paperId = req.param('paperId');
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
                let qid = [];
                doc1._questions.forEach((item) => {
                    qid.push(item._id);
                })
                Question.updateMany({
                    "_id": {
                        $in: qid
                    }
                }, {
                    '$set': {
                        "useState": 1
                    }
                }, (err2, doc2) => {
                    if (err2) {
                        res.json({
                            status: '1',
                            msg: err3.message
                        })
                    } else {
                        res.json({
                            status: '0',
                            msg: 'success',
                            result: doc1
                        })
                    }
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

// 提交考试
exports.sSubmitExam = function(req, res) {
    let userId = req.body.userId;
    let paperId = req.body.paperId; //paper的_id
    let score = req.body.score;
    let startTime = req.body.startTime;
    let examStatus = req.body.examStatus;
    let answers = req.body.answers;
    Student.update({ //学生添加题目,直接更新整个数组
        'userId': userId,
        "exams._paper": paperId
    }, {
        $set: {
            "exams.$.answers": answers,
            "exams.$.score": score,
            "exams.$.examStatus": examStatus,
        }
    }, (err, doc) => {
        if (err) {
            res.json({
                status: '1',
                msg: err.message
            })
        } else {
            if (doc.nModified === 1) {
                Paper.update({
                    '_id': paperId
                }, {
                    '$set': {
                        'status': examStatus
                    }
                }, (err1, doc1) => {
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
                                status: '1',
                                msg: '没有找到该试卷'
                            })
                        }
                    }
                })

            } else {
                res.json({
                    status: '1',
                    msg: '没找到当前用户!'
                })
            }
        }
    })
}



exports.sgetExamedInfo = function(req, res) { //获取考过的考试的题目，sexamRecord里面的init方法里面调用
    let paperId = req.param('paperId');
    let userId = req.param('userId');

    Paper.findOne({
        '_id': paperId
    }).populate({
        path: '_questions'
    }).exec((err1, doc1) => {
        if (err1) {
            res.json({
                status: '1',
                msg: err1.message
            })
        } else {
            if (doc1) {
                Student.findOne({
                    "userId": userId
                }, (err2, doc2) => {
                    if (err2) {
                        res.json({
                            status: '1',
                            msg: err2.message
                        })
                    } else {
                        if (doc2) {
                            doc2.exams = doc2.exams.filter(item1 => JSON.stringify(item1._paper) === JSON.stringify(paperId));
                            res.json({
                                status: '0',
                                msg: 'success',
                                result: {
                                    paperData: doc1,
                                    studentAnswer: doc2.exams[0].answers,
                                    score: doc2.exams[0].score,
                                }
                            })

                        } else {
                            res.json({
                                status: '2',
                                msg: '没有该学生'
                            })
                        }
                    }
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