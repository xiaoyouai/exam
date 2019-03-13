const mongoose = require('mongoose');
let Schema = mongoose.Schema;
let teacherSchema = new Schema({
    userId: Number, // 教师工号
    userName: String, // 用户名
    password: String, // 密码
    _papers: [{ type: Schema.Types.ObjectId, ref: 'Paper' }], //试卷
    _questions: [{
            type: Schema.Types.ObjectId,
            ref: 'Question'
        }] //问题
});
module.exports = mongoose.model('Teacher', teacherSchema);