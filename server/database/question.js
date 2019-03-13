// question.js生成数据库数据
for (let i = 1; i <= 20; i++) {
    var a = `{
    "name" : "第一题",
    "_teacher" : "王老师",
    "_papers" : [
        ObjectId("5c3c608f490eaa83ce72c757")
    ],
    "content":"1+1=？",
    "type":"single",
    "score":10,
    "answer":"A",
    "_v" : ${i}}`;
    console.log(a);
}