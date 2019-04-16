const Teacher = require('./../models/teachers');
const Paper = require('./../models/papers');
const Question = require('./../models/questions');
const Student = require('./../models/students');

// taddpaper的逻辑：
// 首先找到老师_id，没找到就返回4和未查询到教师信息，找到了就开始创造试卷，创建完成了之后教师添加试卷的_id，然后看有没有手动添加的题目
//---- 有手动添加的题目，那首先题目加入教师和试卷信息，然后新增题目，然后试卷和老师填入题目信息（老师这里就保存了），然后学生填入题目信息，然后看有没有题库添加的题目
// -------有题库添加的题目，那就题目加入试卷信息，然后修改，然后试卷填入题目信息并更新，然后学生填入题目信息，学生填入考试信息并更新返回
// -------没有题库添加的题目，那就更新题目信息（前面的添加无更新），然后学生填入题目信息，学生填入考试信息并更新
//---- 没有手动添加的题目，那就题目加入试卷信息，然后修改，然后试卷填入题目信息并更新，然后学生填入题目信息，学生填入考试信息并更新返回


exports.taddpaper = function(req, res) { //添加试卷,taddPaper里调用
    let paperData = req.body.paperData;
    let userId = req.body.userId;
    let studentQuestion = []; //学生考卷对应的题目
    let updateQuestion = [];
    let addQuestion = [];
    let paperId = ''; //新创建的试卷的_id
    paperData._questions.forEach((item) => {
        if (item._id) {
            updateQuestion.push(item); //从题库添加的题目，不需要创建了所以分开
        } else {
            addQuestion.push(item);
        }
    })
    paperData._questions = addQuestion;

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
                    status: 0,
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
                            paperId = doc1._id;
                            doc._papers.push(paperId); // 教师中添加该试卷
                            doc.save(); // 很重要 不save则没有数据
                            if (paperData._questions.length > 0) { //有自主添加的题目
                                paperData._questions.forEach(item => {
                                    item._papers = [];
                                    item._papers.push(paperId);
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
                                            doc2.forEach(item => {
                                                doc1._questions.push(item._id) //试卷填入题目信息
                                                doc._questions.push(item._id) //老师表增加新出的题目信息
                                                studentQuestion.push({ //学生填入题目信息
                                                    _question: item._id,
                                                    answer: ''
                                                })
                                            });
                                            doc.save(); //更新老师
                                            let len = updateQuestion.length;
                                            let sum = -1;
                                            updateQuestion.forEach((item) => {
                                                doc1._questions.push(item._id) //试卷填入题目信息
                                                studentQuestion.push({ //学生填入题目信息
                                                    _question: item._id,
                                                    answer: ''
                                                })
                                            })
                                            doc1.save(); //更新试卷
                                            if (len > 0) { //有从题库添加的题目
                                                updateQuestion.forEach((item) => {
                                                    item._papers.push(paperId);
                                                    Question.update({
                                                        "_id": item._id
                                                    }, item, (err4, doc4) => {
                                                        if (err4) {
                                                            res.json({
                                                                status: '1',
                                                                msg: err4.message
                                                            })
                                                        } else {
                                                            if (doc4) {
                                                                sum++;
                                                                if (sum === len - 1) {
                                                                    let examData = {
                                                                        _paper: doc1._id, //试卷
                                                                        date: paperData.time, //考试时间
                                                                        isSure: 0,
                                                                        score: 0, //考试分数
                                                                        startTime: paperData.startTime,
                                                                        answers: studentQuestion
                                                                    }
                                                                    Student.updateMany({
                                                                        "class": parseInt(paperData.examclass)
                                                                    }, {
                                                                        '$push': {
                                                                            'exams': examData
                                                                        }
                                                                    }, (err3, doc3) => { //学生添加试卷和题目
                                                                        if (err3) {
                                                                            res.json({
                                                                                status: '1',
                                                                                msg: err3.message
                                                                            })
                                                                        } else {
                                                                            if (doc3) {
                                                                                res.json({
                                                                                    status: '0',
                                                                                    msg: 'success'
                                                                                })
                                                                            }
                                                                        }
                                                                    })
                                                                }
                                                            } else {
                                                                res.json({
                                                                    status: '4',
                                                                    msg: '题库题目添加试卷失败'
                                                                })
                                                            }
                                                        }
                                                    })
                                                })
                                            } else { //没有从题库添加的题目
                                                doc1.save();
                                                let examData = {
                                                    _paper: doc1._id, //试卷
                                                    date: paperData.time, //考试时间
                                                    isSure: 0,
                                                    score: 0, //考试分数
                                                    startTime: paperData.startTime,
                                                    answers: studentQuestion
                                                }
                                                Student.updateMany({
                                                    "class": parseInt(paperData.examclass)
                                                }, {
                                                    '$push': {
                                                        'exams': examData
                                                    }
                                                }, (err3, doc3) => { //学生添加试卷和题目
                                                    if (err3) {
                                                        res.json({
                                                            status: '1',
                                                            msg: err3.message
                                                        })
                                                    } else {
                                                        if (doc3) {
                                                            res.json({
                                                                status: '0',
                                                                msg: 'success'
                                                            })
                                                        }
                                                    }
                                                })
                                            }

                                        } else {
                                            res.json({
                                                status: '2',
                                                msg: '创造题目失败'
                                            })
                                        }
                                    }
                                })
                            } //有自主添加的题目
                            else { //无自主添加的题目
                                let len = updateQuestion.length;
                                let sum = -1;
                                updateQuestion.forEach((item) => {
                                    doc1._questions.push(item._id) //试卷填入题目信息
                                    studentQuestion.push({ //学生填入题目信息
                                        _question: item._id,
                                        answer: ''
                                    })
                                })
                                doc1.save(); //更新试卷
                                updateQuestion.forEach((item) => {
                                    item._papers.push(paperId);
                                    Question.update({
                                        "_id": item._id
                                    }, item, (err4, doc4) => {
                                        if (err4) {
                                            res.json({
                                                status: '1',
                                                msg: err4.message
                                            })
                                        } else {
                                            if (doc4) {
                                                sum++;
                                                if (sum === len - 1) {
                                                    let examData = {
                                                        _paper: doc1._id, //试卷
                                                        date: paperData.time, //考试时间
                                                        isSure: 0,
                                                        score: 0, //考试分数
                                                        startTime: paperData.startTime,
                                                        answers: studentQuestion
                                                    }
                                                    Student.updateMany({
                                                        "class": parseInt(paperData.examclass)
                                                    }, {
                                                        '$push': {
                                                            'exams': examData
                                                        }
                                                    }, (err3, doc3) => { //学生添加试卷和题目
                                                        if (err3) {
                                                            res.json({
                                                                status: '1',
                                                                msg: err3.message
                                                            })
                                                        } else {
                                                            if (doc3) {
                                                                res.json({
                                                                    status: '0',
                                                                    msg: 'success'
                                                                })
                                                            }
                                                        }
                                                    })
                                                }
                                            } else {
                                                res.json({
                                                    status: '5',
                                                    msg: '题库题目添加试卷失败'
                                                })
                                            }
                                        }
                                    })
                                })

                            }
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

// tupdatepaper实现逻辑
// 首先看有没有自主添加的题目，
// ------有的话就添加题目，然后老师添加题目，然后试卷把题目信息更新为发过来的题目信息，然后学生跟着把题目信息改为发过来的题目信息，然后题目进行修改，题库新增的题目就加上paperId,不是新增的题目也改成发过来的题目，然后看有没有删除的题目，有删除就题目删掉paperId然后返回去，没有删除就直接返回去
// ------没有的话就试卷把题目信息更新为发过来的题目信息，然后学生跟着把题目信息改为发过来的题目信息，然后题目进行修改，题库新增的题目就加上paperId,不是新增的题目也改成发过来的题目，然后看有没有删除的题目，有删除就题目删掉paperId然后返回去，没有删除就直接返回去

exports.tupdatepaper = function(req, res) { //修改试卷，taddPaper里调用
    let paperId = req.body.paperId;
    let paperData = req.body.paperData;
    let delQuestionId = req.body.delQuestionId;
    let teacherId = req.body.teacherId; //老师的_id

    let updateQuestion = [];
    let addQuestion = [];
    let studentQuestion = []; //有添加题目的话，学生也需要把题目加进去

    let paperParams = {
        name: paperData.name,
        totalPoints: paperData.totalPoints,
        time: paperData.time,
        examclass: paperData.examclass,
        startTime: paperData.startTime,
        status: 0,
        _questions: []
    }
    paperData._questions.forEach((item) => {
        if (item._id) { //非自主添加的题目
            updateQuestion.push(item);
            paperParams._questions.push(item._id);
        } else { //自主添加的题目
            item._papers = [paperId];
            item._teacher = teacherId;
            addQuestion.push(item);
        }
    })

    if (addQuestion.length > 0) { //如果有自主添加的新题目就新增题目，
        Teacher.findOne({
            "_id": teacherId
        }, (err9, doc9) => {
            if (err9) {
                res.json({
                    status: '1',
                    msg: err9.message
                })
            } else {
                if (doc9) {
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
                                    doc9._questions.push(item); //老师放入新加的题目
                                })
                                doc9.save(); //老师放入新加的题目
                                Paper.findOneAndUpdate({
                                    _id: paperId
                                }, paperParams, (err2, doc2) => { //写到这里是因为异步，不写这里上面的push操作不起作用
                                    if (err2) {
                                        res.json({
                                            status: '1',
                                            msg: err.message
                                        })
                                    } else {
                                        if (doc2) {
                                            paperParams._questions.forEach(item => {
                                                studentQuestion.push({ //学生填入题目信息
                                                    _question: item,
                                                    answer: ''
                                                })
                                            })
                                            Student.updateMany({ //学生添加题目,直接更新整个数组
                                                    'class': parseInt(paperData.examclass),
                                                    "exams._paper": paperId
                                                }, {
                                                    $set: {
                                                        "exams.$.answers": studentQuestion,
                                                        "exams.$.date": paperData.time,
                                                        "exams.$.score": 0,
                                                        "exams.$.startTime": paperData.startTime,
                                                        "exams.$.isSure": 0,
                                                    }
                                                }, (err4, doc4) => {
                                                    if (err4) {
                                                        res.json({
                                                            status: '1',
                                                            msg: err4.message
                                                        })
                                                    } else {
                                                        if (doc4) {
                                                            let len = updateQuestion.length;
                                                            let sum = -1;
                                                            if (len > 0) {
                                                                updateQuestion.forEach((item) => {
                                                                    if (item._papers.indexOf(paperId) === -1) {
                                                                        item._papers.push(paperId); //说明这是从题库新增的题目
                                                                    }
                                                                    Question.update({
                                                                        "_id": item._id
                                                                    }, item, (err, doc) => {
                                                                        if (err) {
                                                                            res.json({
                                                                                status: '1',
                                                                                msg: err2.message
                                                                            })
                                                                        } else {
                                                                            if (doc) {
                                                                                sum++;
                                                                                if (sum === len - 1) {
                                                                                    if (delQuestionId.length > 0) {
                                                                                        Question.updateMany({
                                                                                            "_id": {
                                                                                                $in: delQuestionId
                                                                                            }
                                                                                        }, {
                                                                                            $pull: {
                                                                                                "_papers": paperId
                                                                                            }
                                                                                        }, (err5, doc5) => {
                                                                                            if (err5) {
                                                                                                res.json({
                                                                                                    status: '1',
                                                                                                    msg: err2.message
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
                                                                                            status: '0',
                                                                                            msg: 'success'
                                                                                        })
                                                                                    }

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
                                                                if (delQuestionId.length > 0) {
                                                                    Question.updateMany({
                                                                        "_id": {
                                                                            $in: delQuestionId
                                                                        }
                                                                    }, {
                                                                        $pull: {
                                                                            "_papers": paperId
                                                                        }
                                                                    }, (err5, doc5) => {
                                                                        if (err5) {
                                                                            res.json({
                                                                                status: '1',
                                                                                msg: err2.message
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
                                                                        status: '0',
                                                                        msg: 'success'
                                                                    })
                                                                }
                                                            }
                                                        } else {
                                                            res.json({
                                                                status: '4',
                                                                msg: '学生的考试信息添加题目失败'
                                                            })
                                                        }
                                                    }
                                                }) //学生操作的终点


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
                }
            }
        })

    } else { //没有添加题目就直接改试卷
        Paper.findOneAndUpdate({
            _id: paperId
        }, paperParams, (err2, doc2) => {
            if (err2) {
                res.json({
                    status: '1',
                    msg: err.message
                })
            } else {
                if (doc2) {
                    paperParams._questions.forEach(item => {
                        studentQuestion.push({ //学生填入题目信息
                            _question: item,
                            answer: ''
                        })
                    })
                    Student.updateMany({ //学生添加题目,直接更新整个数组
                            'class': parseInt(paperData.examclass),
                            "exams._paper": paperId
                        }, {
                            $set: {
                                "exams.$.answers": studentQuestion,
                                "exams.$.date": paperData.time,
                                "exams.$.score": 0,
                                "exams.$.startTime": paperData.startTime,
                                "exams.$.isSure": 0,
                            }
                        }, (err4, doc4) => {
                            if (err4) {
                                res.json({
                                    status: '1',
                                    msg: err4.message
                                })
                            } else {
                                if (doc4) {
                                    let len = updateQuestion.length;
                                    let sum = -1;
                                    if (len > 0) {
                                        updateQuestion.forEach((item) => {
                                            if (item._papers.indexOf(paperId) === -1) {
                                                item._papers.push(paperId); //说明这是从题库新增的题目
                                            }
                                            Question.update({
                                                "_id": item._id
                                            }, item, (err, doc) => {
                                                if (err) {
                                                    res.json({
                                                        status: '1',
                                                        msg: err2.message
                                                    })
                                                } else {
                                                    if (doc) {
                                                        sum++;
                                                        if (sum === len - 1) {
                                                            if (delQuestionId.length > 0) {
                                                                Question.updateMany({
                                                                    "_id": {
                                                                        $in: delQuestionId
                                                                    }
                                                                }, {
                                                                    $pull: {
                                                                        "_papers": paperId
                                                                    }
                                                                }, (err5, doc5) => {
                                                                    if (err5) {
                                                                        res.json({
                                                                            status: '1',
                                                                            msg: err2.message
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
                                                                    status: '0',
                                                                    msg: 'success'
                                                                })
                                                            }
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
                                        if (delQuestionId.length > 0) {
                                            Question.updateMany({
                                                "_id": {
                                                    $in: delQuestionId
                                                }
                                            }, {
                                                $pull: {
                                                    "_papers": paperId
                                                }
                                            }, (err5, doc5) => {
                                                if (err5) {
                                                    res.json({
                                                        status: '1',
                                                        msg: err2.message
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
                                                status: '0',
                                                msg: 'success'
                                            })
                                        }
                                    }
                                } else {
                                    res.json({
                                        status: '4',
                                        msg: '学生的考试信息添加题目失败'
                                    })
                                }
                            }
                        }) //学生操作的终点
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