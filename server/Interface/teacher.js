// server-----Interface--teacher.js
const Teacher = require('./../models/teachers');
const Paper = require('./../models/papers');
const Question = require('./../models/questions');
const Student = require('./../models/students');

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
                Paper.create(data, (err1, doc1) => { //创造试卷
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
                            Question.create(paperData._questions, function(err2, doc2) { //创造题目
                                if (err2) {
                                    res.json({
                                        status: '1',
                                        msg: err2.message
                                    })
                                } else {
                                    if (doc2) {
                                        let studentQuestion = []; //学生考卷对应的题目
                                        doc2.forEach(item => {
                                            doc1._questions.push(item._id) //试卷填入题目信息
                                            doc._questions.push(item._id) //老师表增加出的题目信息
                                            studentQuestion.push({ //学生填入题目信息
                                                _question: item._id,
                                                answer: ''
                                            })
                                        });
                                        doc1.save();
                                        doc.save();
                                        let examData = {
                                                _paper: doc1._id, //试卷
                                                date: paperData.time, //考试时间
                                                isSure: false,
                                                score: paperData.totalPoints, //考试分数
                                                startTime: paperData.startTime,
                                                answers: studentQuestion
                                            }
                                            // Student.update({ class: paperData.examclass }, { $push: { exams: examData } }, { multi: true });
                                            // res.json({
                                            //         status: '4',
                                            //         msg: 'success'
                                            //     })
                                            // db.getCollection('students').update({ class: 1 }, { $push: { exams: { _paper: ObjectId("5c8df52e170dbb09f8465612"), date: 20, isSure: false, score: 100, startTime: "2017-09-12 15:30", answers: [{ _question: ObjectId("5c8df52e170dbb09f8465613"), answer: '' }] } } }, { multi: true })
                                        Student.find({ //学生添加题目和试卷
                                            class: paperData.examclass
                                        }, (err3, doc3) => {
                                            if (err3) {
                                                res.json({
                                                    status: '1',
                                                    msg: err3.message
                                                })
                                            } else {
                                                if (doc3) {
                                                    doc3.forEach(item => {
                                                        item.exams.push(examData);
                                                        item.save();
                                                        // Student.update({ "userId": item.userId }, item, (err4, doc4) => {})
                                                        // .update({
                                                        //     "userId": user.userId
                                                        // }, user, (err2, doc2) => {
                                                    })
                                                    res.json({
                                                        status: '0',
                                                        msg: 'success'
                                                    })
                                                }
                                            }
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

// 修改试卷-查找试卷
exports.tgetpapermsg = function(req, res) {
    let paperId = req.body.paperId;
    let questionData = [];
    Paper.findOne({ '_id': paperId }).populate({ path: '_questions' }).exec((err1, doc1) => {
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

exports.tupdatepaper = function(req, res) { // 修改试卷
    let paperId = req.body.paperId;
    let paperData = req.body.paperData;
    let delQuestion = req.body.delQuestion;
    let updateQuestion = [];
    let addQuestion = [];
    let teacherId = req.body.teacherId; //老师的_id
    let paperParams = {
        name: paperData.name,
        totalPoints: paperData.totalPoints,
        time: paperData.time,
        examclass: paperData.examclass,
        startTime: paperData.startTime
    }
    paperData._questions.forEach(item => {
        if (item._id) {
            updateQuestion.push(item);
        } else {
            addQuestion.push(item);
        }
    })
    if (delQuestion.length > 0) {
        // Paper.findOneAndUpdate({ _id: paperId }, paperParams, (err, doc) => {
        //     if (err) {
        //         res.json({
        //             status: '1',
        //             msg: err.message
        //         })
        //     } else {
        //         if (doc) {
        //             delQuestion.forEach(delitem => {
        //                 doc = doc._questions.filter(item => item !== delitem);
        //             })
        //             doc.save();
        //         }
        //     }
        // })
    }
    Paper.findOneAndUpdate({ _id: paperId }, paperParams, (err, doc) => {
        if (err) {
            res.json({
                status: '1',
                msg: err.message
            })
        } else {
            if (doc) {
                updateQuestion.forEach((item, index) => {
                    Question.update({ "_id": item._id }, item, (err2, doc2) => {
                        if (err2) {
                            res.json({
                                status: '1',
                                msg: err2.message
                            })
                        } else {
                            if (doc2) {
                                if (index == (updateQuestion.length - 1)) {
                                    if (addQuestion.length > 0) {
                                        addQuestion.forEach(item => {
                                            item._papers = [];
                                            item._papers.push(doc._id); //放入试卷_id
                                            item._teacher = teacherId;
                                        })
                                        Question.create(addQuestion, (err3, doc3) => {
                                            if (err3) {
                                                res.json({
                                                    status: '1',
                                                    msg: err3.message
                                                })
                                            } else {
                                                if (doc3) {
                                                    doc3.forEach(item => {
                                                            doc._questions.push(item._id); //试卷存入新增题目_id
                                                        })
                                                        // if (delQuestion.length > 0) {
                                                        //     delQuestion.forEach(delitem => {
                                                        //         doc = doc._questions.filter(item => item !== delitem)
                                                        //     })
                                                        // }
                                                        // console.log(doc);
                                                    doc.save(); //试卷存入新增题目_id
                                                    res.json({
                                                        status: '0',
                                                        msg: 'success'
                                                    })
                                                } else {
                                                    res.json({
                                                        status: '1',
                                                        msg: 'error'
                                                    })
                                                }
                                            }
                                        })
                                    } else {
                                        res.json({
                                            status: '0',
                                            msg: 'success'
                                        })
                                    }
                                }
                            } else {
                                res.json({
                                    status: '1',
                                    msg: '没找到题目'
                                })
                            }
                        }
                    })
                })
            } else {
                res.json({
                    status: '1',
                    msg: '没找到试卷'
                })
            }
        }
    })
}
exports.tgetAllpaper = function(req, res) { //教师--我的试卷里获取所有的试卷信息
    let userId = req.body.userId;
    Teacher.findOne({ userId: userId }, (err, doc) => {
        if (err) {
            res.json({
                status: '1',
                msg: err.message
            })
        } else {
            if (doc) {
                Paper.find({ _teacher: doc._id }, (err2, doc2) => {
                    if (err2) {
                        res.json({
                            status: '1',
                            msg: err2.message
                        })
                    } else {
                        if (doc2) {
                            res.json({
                                status: '0',
                                msg: 'success',
                                result: doc2
                            })
                        }
                    }
                })
            }
        }
    })
}

exports.tgetmyquestion = function(req, res) {
    let userId = req.body.userId;
    Teacher.findOne({ userId: userId }, (err, doc) => {
        if (err) {
            res.json({
                status: '1',
                msg: err.message
            })
        } else {
            if (doc) {
                let questionData = [{ "name": 1 }];
                doc._questions.forEach(item => {
                    console.log(item);
                    Question.findOne({ _id: item }, (err2, doc2) => {
                        if (err2) {
                            res.json({
                                status: '1',
                                msg: err2.message
                            })
                        } else {
                            if (doc2) {
                                // console.log(doc2);
                                questionData.push(doc2);
                                console.log(questionData);
                            }
                        }
                    })
                })
                res.json({
                    status: '0',
                    msg: 'success',
                    result: questionData
                })
            }
        }
    })
}