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

exports.tregister = function(req, res) { //tregister里调用
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

exports.tlogin = function(req, res) { //tlogin里调用
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
            } else {
                res.json({
                    status: '2',
                    msg: '请先注册',
                })
            }
        }
    })
}

//获取教师的主要信息
exports.tmain = function(req, res) { //tmain里调用
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

exports.tchangeMsg = function(req, res) { //tmodifyMsg里调用
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

exports.tsignout = function(req, res) { //tmain里调用
    req.session.userId = '';
    req.session.password = '';
    res.json({
        status: '0',
        msg: 'success',
    })
}

exports.taddpaper = function(req, res) { //添加试卷,taddPaper里调用
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
                                            msg: '创造题目失败'
                                        })
                                    }
                                }
                            })
                        } else {
                            res.json({
                                status: '3',
                                msg: '创造试卷失败'
                            })
                        }
                    }
                })
            } else {
                res.json({
                    status: '4',
                    login: false,
                    msg: '未查询到教师信息'
                })
            }
        }
    })
}

// 修改试卷-查找到_id对应的试卷
exports.tgetpapermsg = function(req, res) { //taddPaper里的init方法里调用
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

// exports.tupdatepaper = function(req, res) { // 修改试卷
//     let paperId = req.body.paperId;
//     let paperData = req.body.paperData;
//     let delQuestion = req.body.delQuestion;
//     let updateQuestion = [];
//     let addQuestion = [];
//     let teacherId = req.body.teacherId; //老师的_id
//     let paperParams = {
//         name: paperData.name,
//         totalPoints: paperData.totalPoints,
//         time: paperData.time,
//         examclass: paperData.examclass,
//         startTime: paperData.startTime
//     }
//     paperData._questions.forEach(item => {
//         if (item._id) {
//             updateQuestion.push(item);
//         } else {
//             addQuestion.push(item);
//         }
//     })
//     if (delQuestion.length > 0) {
//         // Paper.findOneAndUpdate({ _id: paperId }, paperParams, (err, doc) => {
//         //     if (err) {
//         //         res.json({
//         //             status: '1',
//         //             msg: err.message
//         //         })
//         //     } else {
//         //         if (doc) {
//         //             delQuestion.forEach(delitem => {
//         //                 doc = doc._questions.filter(item => item !== delitem);
//         //             })
//         //             doc.save();
//         //         }
//         //     }
//         // })
//     }
//     Paper.findOneAndUpdate({ _id: paperId }, paperParams, (err, doc) => {
//         if (err) {
//             res.json({
//                 status: '1',
//                 msg: err.message
//             })
//         } else {
//             if (doc) {
//                 updateQuestion.forEach((item, index) => {
//                     Question.update({ "_id": item._id }, item, (err2, doc2) => {
//                         if (err2) {
//                             res.json({
//                                 status: '1',
//                                 msg: err2.message
//                             })
//                         } else {
//                             if (doc2) {
//                                 if (index == (updateQuestion.length - 1)) {
//                                     if (addQuestion.length > 0) {
//                                         addQuestion.forEach(item => {
//                                             item._papers = [];
//                                             item._papers.push(doc._id); //放入试卷_id
//                                             item._teacher = teacherId;
//                                         })
//                                         Question.create(addQuestion, (err3, doc3) => {
//                                             if (err3) {
//                                                 res.json({
//                                                     status: '1',
//                                                     msg: err3.message
//                                                 })
//                                             } else {
//                                                 if (doc3) {
//                                                     doc3.forEach(item => {
//                                                             doc._questions.push(item._id); //试卷存入新增题目_id
//                                                         })
//                                                         // if (delQuestion.length > 0) {
//                                                         //     delQuestion.forEach(delitem => {
//                                                         //         doc = doc._questions.filter(item => item !== delitem)
//                                                         //     })
//                                                         // }
//                                                         // console.log(doc);
//                                                     doc.save(); //试卷存入新增题目_id
//                                                     res.json({
//                                                         status: '0',
//                                                         msg: 'success'
//                                                     })
//                                                 } else {
//                                                     res.json({
//                                                         status: '1',
//                                                         msg: 'error'
//                                                     })
//                                                 }
//                                             }
//                                         })
//                                     } else {
//                                         res.json({
//                                             status: '0',
//                                             msg: 'success'
//                                         })
//                                     }
//                                 }
//                             } else {
//                                 res.json({
//                                     status: '1',
//                                     msg: '没找到题目'
//                                 })
//                             }
//                         }
//                     })
//                 })
//             } else {
//                 res.json({
//                     status: '1',
//                     msg: '没找到试卷'
//                 })
//             }
//         }
//     })
// }

exports.tupdatepaper = function(req, res) { //修改试卷，taddPaper里调用
    let paperId = req.body.paperId;
    let paperData = req.body.paperData;
    let updateQuestion = [];
    let addQuestion = [];
    let teacherId = req.body.teacherId; //老师的_id
    let paperParams = {
        name: paperData.name,
        totalPoints: paperData.totalPoints,
        time: paperData.time,
        examclass: paperData.examclass,
        startTime: paperData.startTime,
        _questions: []
    }
    paperData._questions.forEach((item) => {
        if (item._id) {
            updateQuestion.push(item);
            paperParams._questions.push(item._id);
        } else {
            item._papers = [paperId];
            item._teacher = teacherId;
            addQuestion.push(item);
        }
    })

    if (addQuestion.length > 0) { //如果有新增题目就新增题目，
        Question.create(addQuestion, (err3, doc3) => {
            if (err3) {
                res.json({
                    status: '1',
                    msg: err3.message
                })
            } else {
                if (doc3) {
                    doc3.forEach(item => {
                        paperParams._questions.push(`${item._id}`); //试卷存入新增题目_id
                    })
                    Paper.findOneAndUpdate({ _id: paperId }, paperParams, (err2, doc2) => { //写到这里是因为异步，不写这里上面的push操作不起作用
                        if (err2) {
                            res.json({
                                status: '1',
                                msg: err.message
                            })
                        } else {
                            if (doc2) {
                                let len = updateQuestion.length;
                                let sum = -1;
                                if (len > 0) {
                                    updateQuestion.forEach((item) => {
                                        Question.update({ "_id": item._id }, item, (err, doc) => {
                                            if (err) {
                                                res.json({
                                                    status: '1',
                                                    msg: err2.message
                                                })
                                            } else {
                                                if (doc) {
                                                    sum++;
                                                    if (sum === len - 1) {
                                                        res.json({
                                                            status: '0',
                                                            msg: 'success'
                                                        })
                                                    }
                                                } else {
                                                    res.json({
                                                        status: '2',
                                                        msg: '没找到题目'
                                                    })
                                                }
                                            }
                                        })
                                    })
                                } else {
                                    res.json({
                                        status: '0',
                                        msg: 'success'
                                    })
                                }

                            } else {
                                res.json({
                                    status: '4',
                                    msg: '修改试卷失败'
                                })
                            }
                        }
                    })
                } else {
                    res.json({
                        status: '3',
                        msg: '新添加题目失败'
                    })
                }
            }
        })
    } else { //没有添加题目就直接改试卷
        Paper.findOneAndUpdate({ _id: paperId }, paperParams, (err2, doc2) => {
            if (err2) {
                res.json({
                    status: '1',
                    msg: err.message
                })
            } else {
                if (doc2) {
                    let len = updateQuestion.length;
                    let sum = -1;
                    if (len > 0) {
                        updateQuestion.forEach((item) => {
                            Question.update({ "_id": item._id }, item, (err, doc) => {
                                if (err) {
                                    res.json({
                                        status: '1',
                                        msg: err2.message
                                    })
                                } else {
                                    if (doc) {
                                        sum++;
                                        if (sum === len - 1) {
                                            res.json({
                                                status: '0',
                                                msg: 'success'
                                            })
                                        }
                                    } else {
                                        res.json({
                                            status: '2',
                                            msg: '没找到题目'
                                        })
                                    }
                                }
                            })
                        })
                    } else {
                        res.json({
                            status: '0',
                            msg: 'success'
                        })
                    }

                } else {
                    res.json({
                        status: '4',
                        msg: '修改试卷失败'
                    })
                }
            }
        })
    }
}


exports.tgetAllpaper = function(req, res) { //教师--我的试卷里获取所有的试卷信息，tmypaper里面调用
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
                        } else {
                            res.json({
                                status: '2',
                                msg: '暂未创建试卷'
                            })
                        }
                    }
                })
            }
        }
    })
}

exports.tgetmyquestion = function(req, res) { //tquestionHub里面调用
    let userId = req.body.userId;
    Teacher.findOne({ userId: userId }, (err, doc) => {
        if (err) {
            res.json({
                status: '1',
                msg: err.message
            })
        } else {
            if (doc) {
                Question.find({ _teacher: doc._id }, (err2, doc2) => {
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
                        } else {
                            res.json({
                                status: '2',
                                msg: '请创建题目'
                            })
                        }
                    }
                })
            }
        }
    })
}
exports.tgetallquestion = function(req, res) { //tcomQuestionHub里面调用
    Question.find((err, doc) => {
        if (err) {
            res.json({
                status: '1',
                msg: err.message
            })
        } else {
            if (doc) {
                res.json({
                    status: '0',
                    msg: 'success',
                    result: doc
                })
            } else {
                res.json({
                    status: '2',
                    msg: '暂未创建题目'
                })
            }
        }
    })
}

exports.tdelpaper = function(req, res) { //tmypaper里面调用
    let paperId = req.body.paperId;
    let userId = req.body.userId;
    let myclass = parseInt(req.body.class);
    Teacher.update({ "userId": userId }, { '$pull': { '_papers': { $in: paperId } } }, (err, doc) => {
        if (err) {
            res.json({
                status: '1',
                msg: err.message
            })
        } else {
            if (doc) {
                Paper.remove({ "_id": { $in: paperId } }, function(err1, doc1) {
                    if (err1) {
                        res.json({
                            status: '1',
                            msg: err1.message
                        })
                    } else {
                        if (doc1) {
                            Question.updateMany({ '_papers': { $in: paperId } }, { '$pull': { '_papers': { $in: paperId } } }, function(err2, doc2) {
                                if (err2) {
                                    res.json({
                                        status: '1',
                                        msg: err2.message
                                    })
                                } else {
                                    if (doc2) {
                                        Student.updateMany({ "class": myclass }, { '$pull': { 'exams': { "_paper": paperId } } }, (err3, doc3) => {
                                            if (err3) {
                                                res.json({
                                                    status: '1',
                                                    msg: err3.message
                                                })
                                            } else {
                                                res.json({
                                                    status: '0',
                                                    msg: 'success'
                                                })
                                            }
                                        })

                                    } else {
                                        res.json({
                                            status: '4',
                                            msg: '题目删除试卷失败'
                                        })
                                    }
                                }
                            })
                        } else {
                            res.json({
                                status: '3',
                                msg: '没有该试卷'
                            })
                        }
                    }
                })
            } else {
                res.json({
                    status: '2',
                    msg: '没有该用户'
                })
            }
        }
    })
}


exports.tupdateQuestion = function(req, res) { //我的题库里面修改题目，tquestionHub里面调用
    let data = req.body.questionData;
    Question.update({ "_id": data._id }, data, (err, doc) => {
        if (err) {
            res.json({
                status: '1',
                msg: err.message
            })
        } else {
            if (doc) {
                res.json({
                    status: '0',
                    msg: 'success'
                })
            } else {
                res.json({
                    status: '1',
                    msg: '修改失败'
                })
            }
        }
    })
}

exports.tdelQuestion = function(req, res) { //tcomQuestionHub里面调用
    let data = req.body.questionData;
    let questionId = data._id; //题目的_id
    let teacherId = data._teacher; //老师的_id
    Teacher.update({ "_id": teacherId }, { '$pull': { '_questions': { $in: questionId } } }, (err, doc) => {
        if (err) {
            res.json({
                status: '1',
                msg: err.message
            })
        } else {
            if (doc) {
                Question.remove({ "_id": { $in: questionId } }, function(err1, doc1) {
                    if (err1) {
                        res.json({
                            status: '1',
                            msg: err1.message
                        })
                    } else {
                        if (doc1) {
                            Paper.updateMany({ '_questions': { $in: questionId } }, { '$pull': { '_questions': { $in: questionId } } }, function(err2, doc2) {
                                if (err2) {
                                    res.json({
                                        status: '1',
                                        msg: err2.message
                                    })
                                } else {
                                    if (doc2) {
                                        res.json({
                                            status: '0',
                                            msg: 'success'
                                        })
                                    } else {
                                        res.json({
                                            status: '4',
                                            msg: '试卷删除题目失败'
                                        })
                                    }
                                }
                            })
                        } else {
                            res.json({
                                status: '3',
                                msg: '没有该题目'
                            })
                        }
                    }
                })
            } else {
                res.json({
                    status: '2',
                    msg: '没有该教师'
                })
            }
        }
    })
}