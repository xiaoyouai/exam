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
    useState: Number, //使用状态，0表示可以使用并没有开考的试卷，1表示题目对应有试卷开考了，2表示题目失效了，失效的题目就是题目存在所属试卷，但是老师又把它删了,目前看来状态0和1好像没用了，因为只要题目被试卷引用了，题目就设置为失效，但是因为相关代码都写了，就不删了，怕后面又要用到这俩状态。
});
module.exports = mongoose.model('Question', questionSchema);