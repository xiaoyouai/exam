const Teacher = require('./../models/teachers');
const Paper = require('./../models/papers');
const Question = require('./../models/questions');
const Student = require('./../models/students');

// '4'3创造试卷失败'5'题库题目添加试卷失败'
// taddpaper的逻辑：
// 首先找到老师_id，没找到找到了就返回4，未查询到教师信息，找到了就开始创造试卷，创建完成了之后教师添加试卷的_id，然后看有没有手动添加的题目
//---- 有手动添加的题目，那首先题目加入教师和试卷信息，然后新增，然后试卷和老师填入题目信息，然后学生填入题目信息，然后看有没有题库添加的题目
// -------有题库添加的题目，那就题目加入试卷信息，然后修改，然后试卷填入题目信息并更新，然后学生填入题目信息，学生填入考试信息并更新返回
// -------没有题库添加的题目，那就更新题目和老师信息（前面的添加无更新），然后学生填入题目信息，学生填入考试信息并更新
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
                                    item._teacher = paperId;
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
                                                                        isSure: false,
                                                                        score: paperData.totalPoints, //考试分数
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
                                                    isSure: false,
                                                    score: paperData.totalPoints, //考试分数
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
                                                        isSure: false,
                                                        score: paperData.totalPoints, //考试分数
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