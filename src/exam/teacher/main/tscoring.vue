<template>
<div>
   <el-container>
    <el-main>
          <span slot="label"><i class="el-icon-date"></i>考试记录</span>
          <div class="comBottom">
                    学生学号：
                <el-input placeholder="请输入学号" v-model.number="studentId" clearable prefix-icon="el-icon-search"  size="small" style="width:33%">  </el-input>
                <el-button type="primary" size="small" @click="search">搜索</el-button>

          </div>
          <el-table v-loading="loading" element-loading-text="数据加载中，请稍等" :data="tableData" height="420" border  style="width: 100%;margin-bottom:10px;">
            <el-table-column label="考试时长" width="80"><template slot-scope="props"><span>{{props.row.exams[0].date}}分钟</span></template></el-table-column>
            <el-table-column label="试卷名称" ><template slot-scope="props"><span>{{paperName}}</span></template></el-table-column>
            <el-table-column prop="grade" label="考试年级" width="80"> </el-table-column>
            <el-table-column prop="class" label="考试班级" width="80"> </el-table-column>
            <el-table-column prop="userId" label="学生学号" width="90"> </el-table-column>
            <el-table-column  label="阅卷" width="110">
              <template slot-scope="props">
                <span v-if="props.row.exams[0].examStatus===2">{{props.row.exams[0].score}}分--已阅卷</span>
                <el-button
                  size="mini"
                  type="primary"
                  @click="checkPaper(props.$index,props.row)"  v-if="props.row.exams[0].examStatus===1">阅卷</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="block">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[pageTotal,7, 14, 20, 30]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="pageTotal">
            </el-pagination>
          </div>
    </el-main>
  </el-container>

    <el-dialog title="阅卷" :visible.sync="dialogVisible">
      <ul>
        <li class="question" v-for="(item, index) in questions">
          <p class="wrap"><i class="fa-icon 	fa fa-hand-o-right"></i>&nbsp;&nbsp;{{item._question.content}} <span>&nbsp;&nbsp;({{item._question.score}}分)</span></p>
          <p class="wrap"> 学生答案: <span>{{item.answer}}</span></p>
          <p class="wrap"> 题目参考答案: <span style="color:orange">{{item._question.answer}}</span></p>
          打分：<el-input class="input" size="small" @change="checkType(item.score,item._question.score)" v-model="item.score"></el-input>
          <span v-if='isNumber' class="error">*只能是数字</span>
          <span v-if='isMore' class="error">*不能大于题目总分</span>
        </li>
      </ul>
      <el-button type="primary" style="margin-top:20px;margin-bottom:10px;" size="small" @click="submit">提交</el-button>
      <el-button type="danger"
        style="margin-top:10px;margin-bottom:10px;margin-right:10px;" size="small"
        @click="quitCheck"
      >取消</el-button>
    </el-dialog>
</div>
</template>

<script>
export default {
  data() {
    return {
      userId: "",
      mygrade: 1,
      studentId: "", //搜索框对应的输入的学生学号
      tableData: [],
      loading: false,
      paperName: "", //试卷名
      paperId: "", //试卷的_id

      currentPage: 1, //当前页码
      pageSize: 10000, //每页条数,初始化为10000
      pageTotal: 0, //总条数

      dialogVisible: false,
      questions: [], //阅卷时要看的题目
      isNumber: false, //打分时输入框是否填入数字
      isMore: false, //打分是否超过总分

      currentCheckIndex: -1 //目前被阅卷的学生在表格中的index
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    getData() {
      this.userId = this.$route.params.id;
      this.paperId = this.$route.params.paperId;
      this.loading = true;
      this.$axios
        .get("/api/tgetCheckPaperList", {
          params: {
            paperId: this.paperId,
            pageNumber: this.currentPage,
            pageSize: this.pageSize
          }
        })
        .then(response => {
          let res = response.data;
          this.pageSize = this.pageSize === 10000 ? res.total : this.pageSize;
          this.pageTotal = this.pageTotal === 0 ? res.total : this.pageTotal;
          if (res.msg == "success" && res.status == "0") {
            this.$set(this.$data, "tableData", res.result);
            // this.tableData = res.result;
            this.paperName = res.paperName;
          } else if (res.status == "2") {
            this.$message({
              showClose: true,
              message: `${res.msg}`,
              type: "error",
              duration: 1000
            });
          } else {
            this.$message({
              showClose: true,
              message: "获取信息失败，请稍后再试！",
              type: "error",
              duration: 1000
            });
          }
          this.loading = false;
        })
        .catch(err => {
          console.log(err);
          this.loading = false;
          this.$message({
            showClose: true,
            message: "获取信息失败，请稍后再试！",
            type: "warning",
            duration: 1000
          });
        });
    },
    search() {
      this.currentPage = 1; //当前页码
      this.pageSize = 10000; //每页条数
      this.pageTotal = 0; //总条数
      this.getData();
    },
    /**
     * 分页
     */
    handleSizeChange(val) {
      this.pageSize = val;
      this.getData();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getData();
    },

    /**
     * 取消打分
     */
    quitCheck() {
      this.dialogVisible = false;
      this.currentCheckIndex = -1;
      this.questions = [];
    },
    checkPaper(index, row) {
      this.dialogVisible = true;
      this.currentCheckIndex = index;
      this.questions = [];
      let data = this.$deepCopy(row.exams[0].answers);
      for (let i = 0, len = row.exams[0].answers.length; i < len; i++) {
        if (
          data[i]._question.type === "apfill" ||
          data[i]._question.type === "Q&A"
        ) {
          this.questions.push(data[i]);
        }
      }
    },
    /**
     * 输入判断
     */
    checkType(value, score) {
      let reg = /^[0-9]+$/gi;
      if (!reg.test(value)) {
        this.isNumber = true;
      } else {
        this.isNumber = false;
        if (value > score || value < 0) {
          this.isMore = true;
        } else {
          this.isMore = false;
        }
      }

      if (value == "") {
        this.isNumber = false;
        this.isMore = false;
      }
    },
    submit() {
      // 2019-04-07 15:18
      let isFinish = false;
      this.questions.forEach(item => {
        if (item.score === undefined) {
          isFinish = true;
        }
      });
      if (isFinish) {
        this.$message({
          showClose: true,
          message: "请打完分再提交",
          type: "error",
          duration: 1000
        });
      } else if (!this.isNumber && !this.isMore) {
        let newScore = this.tableData[this.currentCheckIndex].exams[0].score;
        this.questions.forEach(item => {
          newScore += parseInt(item.score);
        });
        this.$axios
          .post("/api/tsubmitCheckPapers", {
            userId: this.tableData[this.currentCheckIndex].userId,
            score: newScore,
            paperId: this.tableData[this.currentCheckIndex].exams[0]._paper
          })
          .then(response => {
            let res = response.data;
            if (res.status == "0" && res.msg == "success") {
              this.$message({
                showClose: true,
                message: "修改成功",
                type: "success",
                duration: 1000
              });

              let newData = this.tableData[this.currentCheckIndex];
              console.log(newData);
              newData.exams[0].examStatus = 2;
              newData.exams[0].score = newScore;
              this.tableData.splice(this.currentCheckIndex, 1, newData);

              this.hasScoreAll();
              this.quitCheck();
            } else {
              this.$message({
                showClose: true,
                message: "修改失败，稍后再试",
                type: "error",
                duration: 1000
              });
            }
          })
          .catch(err => {
            console.log(err);
            this.$message({
              showClose: true,
              message: "修改失败，稍后再试",
              type: "error",
              duration: 1000
            });
          });
      }
    },
    /**
     * 已阅卷完毕
     */
    hasScoreAll() {
      let data = this.tableData.filter(item => item.exams[0].examStatus !== 2);
      if (data.length === 0) {
        this.$axios
          .post("/api/tupdatePaperStatus", { paperId: this.paperId })
          .then(response => {
            let res = response.data;
            if (res.msg == "success" && res.status == "0") {
              this.$message({
                showClose: true,
                message: "您已阅卷完毕",
                type: "success",
                duration: 2000
              });
            } else {
              this.$message({
                showClose: true,
                message: "出现错误，请刷新",
                type: "error",
                duration: 2000
              });
            }
          })
          .catch(err => {
            this.$message({
              showClose: true,
              message: "出现错误，请刷新",
              type: "warning",
              duration: 2000
            });
          });
      }
    }
  }
};
</script>
<style scoped>
.input {
  width: 100px;
}
.question p {
  margin-bottom: 10px;
}
.question p:first-child {
  font-size: 16px;
}
.question p:nth-child(2) span {
  color: #20a0ff;
}
.error {
  font-size: 12px;
  color: red;
}
ul,
li {
  padding: 0;
  margin: 0;
}
li {
  list-style: none;
}

.wrap {
  width: 100%;
  display: inline-block;
  word-wrap: break-word;
  white-space: normal;
}
</style>
