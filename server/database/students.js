// students.js生成数据库数据
for (let i = 1; i <= 20; i++) {
    var a = `{
        "userId": 15092${i},
        "userName": "张三",
        "password": "123",
        "grade": 1,
        "class": 3,
        "exams": [{
            "_paper" : ObjectId("5c3c608f490eaa83ce72c757"),
            "date": "2018-05-02",
            "examStatus": "true",
            "score": 60,
            "_id": ObjectId("5c3c608f490eaa83ce72c757"),
            "answers": []
        }]}`;
    console.log(a);
}
// "_id": ObjectId("58e705cd98dabd1bd33${padding(i)}"),