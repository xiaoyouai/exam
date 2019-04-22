const mongoose = require('mongoose');
let Schema = mongoose.Schema;
let paperSchema = new Schema({
    name: String, //试卷名
    totalPoints: Number, //试卷总分
    time: Number, //考试总时长
    startTime: Date, //考试开始时间
    examgrade: Number, //考试年级
    examclass: Number, //考试班级
    status: Number, //状态，0表示没开考，1表示开考了但是没阅卷，2表示已阅卷
    _teacher: {
        type: Schema.Types.ObjectId,
        ref: 'Teacher'
    }, // 出卷老师
    _questions: [{
        type: Schema.Types.ObjectId,
        ref: 'Question'
    }]
})
module.exports = mongoose.model('Paper', paperSchema);