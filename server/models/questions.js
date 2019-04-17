const mongoose = require('mongoose');
let Schema = mongoose.Schema;
let questionSchema = new Schema({
    _teacher: {
        type: Schema.Types.ObjectId,
        ref: 'Teacher'
    }, //出题老师
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
    answer: String, //答案
    selection: Array, //选项
    canused: Boolean, //是否失效，true表示失效了，失效的题目就是题目存在所属试卷，但是老师又把它删了，失效的也不能修改了
});
module.exports = mongoose.model('Question', questionSchema);