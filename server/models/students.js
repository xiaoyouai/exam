const mongoose = require('mongoose');
let Schema = mongoose.Schema;
let studentSchema = new Schema({
    userId: Number, //学号
    userName: String, //姓名
    password: String, //密码
    grade: Number, //年级
    class: Number, //班级
    exams: [{ //参加的考试
        _paper: {
            type: Schema.Types.ObjectId,
            ref: 'Paper'
        }, //试卷
        date: Number, //考试总时长
        examStatus: Number, //0表示没开考，为1表示开考了没阅卷，为2表示阅卷了，为3表示试卷没有主观题且暂存答案，为4表示试卷有主观题且暂存答案
        score: Number, //考试分数
        startTime: Date,
        answers: [{
            _question: {
                type: Schema.Types.ObjectId,
                ref: 'Question'
            },
            answer: String
        }]
    }]
});
module.exports = mongoose.model('Student', studentSchema);