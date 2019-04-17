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


// 修改试卷-查找到_id对应的试卷
exports.tgetpapermsg = function(req, res) { //taddPaper里的init方法里调用
    let paperId = req.body.paperId;
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



exports.tgetAllpaper = function(req, res) { //教师--我的试卷里获取所有的试卷信息，tmypaper里面调用
    let userId = req.param('userId');
    let name = req.param('name');
    let myclass = parseInt(req.param('class'));
    let pageSize = parseInt(req.param("pageSize")); //每页条数
    let pageNumber = parseInt(req.param("pageNumber")); //第几页
    let skip = (pageNumber - 1) * pageSize; // 跳过几条
    let reg = new RegExp(name, 'i');

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
                if (myclass > 0) {
                    Paper.find({
                            "_teacher": doc._id,
                            "name": reg,
                            "examclass": parseInt(myclass)
                        }).skip(skip).limit(pageSize)
                        .exec((err2, doc2) => {
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
                                        result: doc2,
                                        total: doc2.length
                                    })
                                } else {
                                    res.json({
                                        status: '2',
                                        msg: '暂未创建试卷'
                                    })
                                }
                            }
                        })
                } else {
                    Paper.find({
                            "_teacher": doc._id,
                            "name": reg
                        }).skip(skip).limit(pageSize)
                        .exec((err2, doc2) => {
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
                                        result: doc2,
                                        total: doc2.length
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
        }
    })
}



exports.tgetMyQuestion = function(req, res) { //tquestionHub，taddmypaper里面调用
    let userId = req.param("userId");
    let content = req.param("content");

    let pageSize = parseInt(req.param("pageSize")); //每页条数
    let pageNumber = parseInt(req.param("pageNumber")); //第几页
    let skip = (pageNumber - 1) * pageSize; // 跳过几条

    let reg = new RegExp(content, 'i');
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
                Question.find({
                        "_id": {
                            $in: doc._questions
                        },
                        "content": reg
                    }).skip(skip).limit(pageSize)
                    .exec((err2, doc2) => {
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
                                    result: {
                                        question: doc2,
                                        teacher: doc._id,
                                        total: doc2.length
                                    }
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


exports.tgetAllQuestion = function(req, res) { //tcomQuestionHub里面调用
    let userId = req.param("userId");
    let content = req.param("content");

    let pageSize = parseInt(req.param("pageSize")); //每页条数
    let pageNumber = parseInt(req.param("pageNumber")); //第几页
    let skip = (pageNumber - 1) * pageSize; // 跳过几条

    let reg = new RegExp(content, 'i');

    Teacher.findOne({
        "userId": userId
    }, (err, doc) => {
        if (err) {
            res.json({
                status: '1',
                msg: err2.message
            })
        } else {
            if (doc) {
                Question.find({
                        "content": reg
                    }).skip(skip).limit(pageSize)
                    .exec((err2, doc2) => {
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
                                    result: {
                                        questionData: doc2,
                                        teacherId: doc._id,
                                        total: doc2.length
                                    }
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
        }
    })

}

exports.tdelpaper = function(req, res) { //tmypaper里面调用
    let data = req.body.paperId; //随便用paperId或者class都行
    let paperId = [];
    let myclass = [];
    let userId = req.body.userId;
    data.forEach(item => {
        paperId.push(item._id);
        myclass.push(item.examclass);
    })
    Teacher.update({
        "userId": userId
    }, {
        '$pull': {
            '_papers': {
                $in: paperId
            }
        }
    }, (err, doc) => {
        if (err) {
            res.json({
                status: '1',
                msg: err.message
            })
        } else {
            if (doc) {
                Paper.remove({
                    "_id": {
                        $in: paperId
                    }
                }, function(err1, doc1) {
                    if (err1) {
                        res.json({
                            status: '1',
                            msg: err1.message
                        })
                    } else {
                        if (doc1) {
                            Question.updateMany({
                                '_papers': {
                                    $in: paperId
                                }
                            }, {
                                '$pull': {
                                    '_papers': {
                                        $in: paperId
                                    }
                                }
                            }, function(err2, doc2) {
                                if (err2) {
                                    res.json({
                                        status: '1',
                                        msg: err2.message
                                    })
                                } else {
                                    if (doc2) {
                                        Student.updateMany({
                                            "class": {
                                                $in: myclass
                                            }
                                        }, {
                                            '$pull': {
                                                'exams': {
                                                    "_paper": {
                                                        $in: paperId
                                                    }
                                                }
                                            }
                                        }, (err3, doc3) => {
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
    Question.update({
        "_id": data._id
    }, data, (err, doc) => {
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

exports.tdelQuestion = function(req, res) { //tquestionHub里面调用
    let data = req.body.questionData;
    let len = data.length;
    let questionId = [];
    let studentQuestion = []; //存储学生的试卷对应的题目
    for (let i = 0; i < len; i++) {
        questionId.push(data[i]._id); //题目的_id
    }
    Teacher.update({
        "_id": data[0]._teacher
    }, {
        '$pull': {
            "_questions": {
                $in: questionId
            }
        }
    }, (err, doc) => {
        if (err) {
            res.json({
                status: '11',
                msg: err.message
            })
        } else {
            if (doc) {
                Question.remove({
                    "_id": {
                        $in: questionId
                    }
                }, function(err1, doc1) {
                    if (err1) {
                        res.json({
                            status: '12',
                            msg: err1.message
                        })
                    } else {
                        if (doc1) {
                            Paper.updateMany({ //修改试卷------
                                    "_questions": {
                                        $in: questionId
                                    }
                                }, {
                                    '$pull': {
                                        "_questions": {
                                            $in: questionId
                                        }
                                    }
                                }, (err3, doc3) => {
                                    if (err3) {
                                        res.json({
                                            status: '15',
                                            msg: err3.message
                                        })
                                    } else {
                                        res.json({ //题目暂无试卷
                                            status: '0',
                                            msg: 'success'
                                        })
                                    }
                                }) //-------
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



exports.taddQuestionToHub = function(req, res) { //tcomQuestionHub里面调用，把题目添加到我的题库里面去，但是题目的出题人（_teacher）保持不变
    let questionId = req.body.questionData;
    let teacherId = req.body.teacherId;
    Teacher.update({
        "_id": teacherId,
    }, {
        "$addToSet": {
            "_questions": {
                "$each": questionId
            }
        }
    }, (err, doc) => {
        if (err) {
            res.json({
                status: '1',
                msg: err.message
            })
        } else {
            if (doc) {
                if (doc.nModified === 0) {
                    res.json({
                        status: '3',
                        msg: '已经在你的题库了'
                    })
                } else {
                    res.json({
                        status: '0',
                        msg: 'success'
                    })
                }

            } else {
                res.json({
                    status: '2',
                    msg: '添加失败'
                })
            }
        }
    })
}

exports.tdelQuestionFromHub = function(req, res) { //tcomQuestionHub里面调用，把题目从我的题库中移出去
    let questionId = req.body.questionId; //---格式固定为数组
    let teacherId = req.body.teacherId;
    Teacher.update({
        "_id": teacherId,
    }, {
        "$pull": {
            "_questions": {
                "$in": questionId
            }
        }
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
                    msg: 'success'
                })
            } else {
                res.json({
                    status: '2',
                    msg: '移出失败'
                })
            }
        }
    })
}

exports.taddQuestion = function(req, res) { //tquestionHub里面调用，添加新的题目
    let teacherId = req.body.teacherId;
    let questionData = req.body.questionData;
    questionData._papers = [];

    Teacher.findOne({
        "userId": teacherId,
    }, (err2, doc2) => {
        if (err2) {
            res.json({
                status: '1',
                msg: err2.message
            })
        } else {
            if (doc2) {
                questionData._teacher = doc2._id;
                questionData.canused = false;

                Question.create(questionData, function(err, doc) { //创造题目
                    if (err) {
                        res.json({
                            status: '1',
                            msg: err.message
                        })
                    } else {
                        if (doc) {
                            doc2._questions.push(doc._id);
                            doc2.save();
                            res.json({
                                status: '0',
                                msg: "success",
                                result: doc
                            })
                        } else {
                            res.json({
                                status: '2',
                                msg: "添加题目失败"
                            })
                        }
                    }
                })
            } else {
                res.json({
                    status: '2',
                    msg: "教师添加题目失败"
                })
            }
        }
    })

}

exports.tgetCheckPaperList = function(req, res) { //获取需要打分的试卷的学生信息
    let paperId = req.param('paperId');
    let pageSize = parseInt(req.param("pageSize")); //每页条数
    let pageNumber = parseInt(req.param("pageNumber")); //第几页
    let skip = (pageNumber - 1) * pageSize; // 跳过几条

    Paper.findOne({
        '_id': paperId,
    }, (err2, doc2) => {
        if (err2) {
            res.json({
                status: '1',
                msg: err.message
            })
        } else {
            if (doc2) {
                Student.find({
                        "class": doc2.examclass
                    }).skip(skip).limit(pageSize).populate({
                        path: 'exams.answers._question',
                        select: 'content type score answer',
                    })
                    .exec((err3, doc3) => {
                        if (err3) {
                            res.json({
                                status: '1',
                                msg: err3.message
                            })
                        } else {
                            if (doc3) {
                                let sum = -1;
                                let len = doc3.length;
                                doc3.forEach(item => {
                                    sum++;
                                    item.exams = item.exams.filter(item1 => JSON.stringify(item1._paper) === JSON.stringify(doc2._id));
                                    if (sum === len - 1) {
                                        res.json({
                                            status: '0',
                                            result: doc3,
                                            paperName: doc2.name,
                                            total: doc3.length,
                                            msg: 'success'
                                        })
                                    }
                                })

                            } else {
                                res.json({
                                    status: '2',
                                    msg: '没找到试卷有关的学生'
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
}


exports.tsubmitCheckPapers = function(req, res) { //提交打分，tscoring里面的submit方法调用
    let userId = req.body.userId;
    let paperId = req.body.paperId; //paper的_id
    let score = req.body.score;
    Student.update({ //学生添加题目,直接更新整个数组
        'userId': userId,
        "exams._paper": paperId
    }, {
        $set: {
            "exams.$.score": score,
            "exams.$.isSure": 2,
        }
    }, (err, doc) => {
        if (err) {
            res.json({
                status: '1',
                msg: err.message
            })
        } else {
            if (doc.nModified === 1) {
                res.json({
                    status: '0',
                    msg: 'success'
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


exports.tupdatePaperStatus = function(req, res) { //将试卷的打分状态改为已打完分
    let paperId = req.body.paperId;
    Paper.update({
        '_id': paperId
    }, {
        '$set': {
            'status': 2
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
}

/**
 * 教师--获取已打分（status=2）和未打分的试卷（status=1或status<0）,tgradeMan和tscoreList的init方法调用
 */
exports.tgetScorePaper = function(req, res) {
    let userId = req.param('userId');
    let name = req.param('name');
    let myclass = parseInt(req.param('class'));
    let status = req.param('status');

    let pageSize = parseInt(req.param("pageSize")); //每页条数
    let pageNumber = parseInt(req.param("pageNumber")); //第几页
    let skip = (pageNumber - 1) * pageSize; // 跳过几条

    let reg = new RegExp(name, 'i');

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
                if (myclass > 0) {
                    Paper.find({
                            "_teacher": doc._id,
                            "status": parseInt(status),
                            "name": reg,
                            "examclass": parseInt(myclass)
                        }).skip(skip).limit(pageSize)
                        .exec((err2, doc2) => {
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
                                        result: doc2,
                                        total: doc2.length
                                    })
                                } else {
                                    res.json({
                                        status: '2',
                                        msg: '暂未创建试卷'
                                    })
                                }
                            }
                        })
                } else {
                    Paper.find({
                            "_teacher": doc._id,
                            "status": parseInt(status),
                            "name": reg
                        }).skip(skip).limit(pageSize)
                        .exec((err2, doc2) => {
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
                                        result: doc2,
                                        total: doc2.length
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
        }
    })
}


exports.tgetStudentScore = function(req, res) { //获取学生成绩，tgradeMan里面的handlelook方法调用
    let myclass = req.param("class");
    let paperId = req.param("paperId"); //paper的_id
    Student.find({ //学生添加题目,直接更新整个数组
        'class': myclass,
        "exams._paper": paperId
    }, (err, doc) => {
        if (err) {
            res.json({
                status: '1',
                msg: err.message
            })
        } else {
            if (doc) {
                let sum = -1;
                let len = doc.length;
                doc.forEach(item => {
                    sum++;
                    item.exams = item.exams.filter(item1 => JSON.stringify(item1._paper) === JSON.stringify(paperId));
                    if (sum === len - 1) {
                        res.json({
                            status: '0',
                            result: doc,
                            msg: 'success'
                        })
                    }
                })
            } else {
                res.json({
                    status: '1',
                    msg: '没找到学生!'
                })
            }
        }
    })
}