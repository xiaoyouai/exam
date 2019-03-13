// teacher.js生成数据库数据
for (let i = 1; i <= 20; i++) {
    var a = `{
    "userId" : ${i},
    "userName" : "王老师",
    "passWord" : "123",
    "_papers" : [
        ObjectId("5c3c5f77490eaa83ce72c716")
    ],
    "_v" : ${i}}`;
    console.log(a);
}
// "_id" : ObjectId("5b5a239dd8ca76b97dc${padding(i)}"),