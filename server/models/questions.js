const mongoose = require('mongoose');
let Schema = mongoose.Schema;
let questionSchema = new Schema({
    name: String, //问题名
    _teacher: {
        type: Schema.Types.ObjectId,
        ref: 'Teacher'
    }, //所属老师
    _papers: [{
        type: Schema.Types.ObjectId,
        ref: 'Paper'
    }], //所属试卷
    content: String, //内容
    type: {
        type: String,
        enum: [ //类型
            'single', //单选
            'multi', //多选
            'apfill', //填空题
            'Q&A', //简答
            'judgement' //判断
        ]
    },
    score: Number, //分数
    answer: String //答案
});
module.exports = mongoose.model('Question', questionSchema);