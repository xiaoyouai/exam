// paper.js生成数据库数据
for (let i = 1; i <= 20; i++) {
    var a =
        `{
        "name": "考试${i}",
        "totalPoints": 100,
        "time": 90,
        "startTime": "2018-05-04",
        "examnum": 0,
        "_teacher": ObjectId("5c3c60dd490eaa83ce72c79e"),
        "_questions": [
            ObjectId("5c3c608f490eaa83ce72c757")
        ],
        "_v": ${i}}`
    console.log(a);
}