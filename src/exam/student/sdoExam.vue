<template>
  <div class="exam">
    <h3 class="text-center marginT10">{{paperData.name}}</h3>
     <el-row>
      <el-col :span="16">
       <div class="grid-content bg-purple">
        <el-row>
         <el-col :span="6">
          <div class="grid-content bg-purple">
           {{userData.userName}}同学
          </div>
         </el-col>
         <el-col :span="6">
          <div class="grid-content bg-purple-light">
           学号：{{userData.userId}}
          </div>
         </el-col>
         <el-col :span="6">
          <div class="grid-content bg-purple">
            年级：{{userData.grade}}
          </div>
         </el-col>
         <el-col :span="6">
          <div class="grid-content bg-purple-light">
           班级：{{userData.class}}班
          </div>
         </el-col>
        </el-row>
       </div>
      </el-col>
      <el-col :span="8">
       <div class="grid-content bg-purple">
        <el-row>
         <el-col :span="12">
          <div class="grid-content bg-purple">
            考试时长：{{paperData.time}}分钟
          </div>
         </el-col>
         <el-col :span="12">
          <div class="grid-content bg-purple-light">
           总分：{{paperData.totalPoints}}分
          </div>
         </el-col>
        </el-row>
       </div>
      </el-col>
     </el-row>
    <div class="submit-box" ref="submitBox">
      <el-button @click="submit" type="primary" class="submit-btn">提交试卷</el-button>
      <div class="timeout">
        <p>距离考试结束</p>
        <p>{{time}}</p>
      </div>
    </div>
    <div class="main">
    <el-tabs type="border-card">
     <el-tab-pane>
      <div class="single" v-if="singleQuestions.length>0">
        <h3><i class="fa-icon 	fa fa-hand-o-right"></i>&nbsp;&nbsp;单选题（只有一个正确答案）</h3>
        <ul class="question-item">
          <li class="marginB10" v-for="(item,index) in singleQuestions" :key="item._id">
            <p class="question-title">{{index+1}} 、{{item.content}}&nbsp;（{{item.score}}分）</p>
            <span
              class="option"
              v-if="item.type!='judgement'&&item.type!='Q&A'"
              item
              v-for="(item1,index1) in item.selection"
              :key="(index1+1000)"
            >
              <el-radio
                v-model="item.sanswer"
                :label="options[index1]"
                :key="(index1*index)"
              >{{options[index1]}}、{{item1.value}}</el-radio>
            </span>
          </li>
        </ul>
      </div>
      <div class="multi" v-if="multiQuestions.length>0">
        <h3><i class="fa-icon 	fa fa-hand-o-right"></i>&nbsp;&nbsp;多选题（有多个正确答案）</h3>
        <ul class="question-item">
          <li class="marginB10" v-for="(item,index) in multiQuestions" :key="item._id">
            <p class="question-title">{{index+1}} 、{{item.content}}&nbsp;（{{item.score}}分）</p>

            <span
              class="option"
              v-if="item.type!='judgement'&&item.type!='Q&A'"
              item
              v-for="(item1,index1) in item.selection"
              :key="(index1+1000)"
            >
              <el-checkbox
                v-model="item.sanswer"
                :label="options[index1]"
                :key="(index1*index)"
              >{{options[index1]}}、{{item1.value}}</el-checkbox>
            </span>
          </li>
        </ul>
      </div>
      <div class="judge" v-if="judgeQuestions.length>0">
        <h3><i class="fa-icon 	fa fa-hand-o-right"></i>&nbsp;&nbsp;判断题</h3>
        <ul class="question-item">
          <li class="marginB10" v-for="(item,index) in judgeQuestions" :key="item._id">
            <p class="question-title">{{index+1}} 、{{item.content}}&nbsp;（{{item.score}}分）</p>
            <el-radio v-model="item.sanswer" label="A" :key="(index+1)">正确</el-radio>
            <el-radio v-model="item.sanswer" label="B" :key="index">错误</el-radio>
          </li>
        </ul>
      </div>
      <div class="judge" v-if="apfillQuestions.length>0">
        <h3><i class="fa-icon 	fa fa-hand-o-right"></i>&nbsp;&nbsp;填空题</h3>
        <ul class="question-item">
          <li class="marginB10" v-for="(item,index) in apfillQuestions" :key="item._id">
            <p class="question-title">{{index+1}} 、{{item.content}}&nbsp;（{{item.score}}分）</p>
            <el-input
            class="apfill"
              placeholder="请输入内容"
              v-model="item.sanswer"
            ></el-input>
          </li>
        </ul>
      </div>
      <div class="judge" v-if="QAQuestions.length>0">
        <h3><i class="fa-icon 	fa fa-hand-o-right"></i>&nbsp;&nbsp;简答题</h3>
        <ul class="question-item">
          <li class="marginB10" v-for="(item,index) in QAQuestions" :key="item._id">
            <p class="question-title">{{index+1}} 、{{item.content}}&nbsp;（{{item.score}}分）</p>
            <el-input
              class="textarea"
              type="textarea"
              :rows="3"
              placeholder="请输入内容"
              v-model="item.sanswer"
            ></el-input>
          </li>
        </ul>
      </div>
      </el-tab-pane>
    </el-tabs>
  </div>

    <div class="scroll_top" @click="scrollTop" v-if="scroll>100">
      <i class="el-icon-caret-top"></i>
    </div>

    <el-dialog title="提示" :visible.sync="dialogVisible" width="30%">
      <span>这是一段信息</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script type="text/ecmascript-6">
export default {
  data() {
    return {
      paperId: "",
      userData: {},
      dialogVisible: false,
      paperData: {
        name: "",
        time: "",
        totalPoints: ""
      },
      startTime: "",
      nowTime: "",
      examTime: "",
      timer: null,
      singleQuestions: [],
      multiQuestions: [],
      QAQuestions: [],
      judgeQuestions: [],
      apfillQuestions: [], //填空题
      options: [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T"
      ],
      scroll: document.documentElement.scrollTop || document.body.scrollTop
    };
  },
  computed: {
    time: function() {
      let time = this.examTime;
      let hour = 0;
      let mm = 0;
      let ss = 0;
      hour = Math.floor(time / 3600);
      mm = Math.floor((time / 60) % 60);
      ss = Math.floor(time % 60);

      return `${hour}小时${mm}分钟${ss}秒`;
    }
  },
  watch: {
    time(curVal, oldVal) {
      if (curVal == "0小时0分钟0秒") {
        this.$message({
          showClose: true,
          message: "考试时间到，强制提交!",
          type: "error",
          duration: 1000
        });
        let isMust = true;
        this.submit(isMust);
      }
    }
  },
  mounted() {
    this.userData = this.$getUserData();
    this.nowTime = new Date();
    this.paperId = this.$route.params.id;
    this.init();
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    /**
     * 初始化
     */
    init() {
      const loading = this.$loading({
        lock: true,
        text: "数据加载中，请稍等",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      this.$axios
        .get("/api/sgetExamInfo", {
          params: {
            paperId: this.paperId
          }
        })
        .then(response => {
          let res = response.data;
          if (res.status == "0") {
            for (let key in this.paperData) {
              this.paperData[key] = res.result[key];
            }
            this.startTime = res.result.startTime;
            this.examTime =
              this.paperData.time * 60 -
              (this.nowTime - new Date(this.startTime)) / 1000;
            let time = (new Date() - new Date(this.startTime)) / 60000; //时间差化为分钟
            if (time - this.paperData.time >= 0) {
              this.$message({
                showClose: true,
                message: "考试时间已过!",
                type: "error",
                duration: 1000
              });
              this.$router.go(-1);
            }
            this.getCode();
            // this.timeOut();
            res.result._questions.forEach(item => {
              if (item.type == "single") {
                item.sanswer = "";
                this.singleQuestions.push(item);
              } else if (item.type == "multi") {
                item.sanswer = [];
                this.multiQuestions.push(item);
              } else if (item.type == "Q&A") {
                item.sanswer = "";
                this.QAQuestions.push(item);
              } else if (item.type == "judgement") {
                item.sanswer = "";
                this.judgeQuestions.push(item);
              } else if (item.type == "apfill") {
                item.sanswer = "";
                this.apfillQuestions.push(item);
              }
            });
          }
          loading.close();
        })
        .catch(err => {
          this.$message.error(err);
          loading.close();
        });
    },
    /**
     * 回到顶部
     * @return {[type]} [description]
     */
    scrollTop() {
      let timer = setInterval(() => {
        let top = document.body.scrollTop || document.documentElement.scrollTop;
        let speed = Math.ceil(top / 5);
        document.body.scrollTop = top - speed;
        document.documentElement.scrollTop = top - speed;

        if (top === 0) {
          clearInterval(timer);
        }
      }, 20);
    },
    getCode() {
      const TIME_COUNT = this.examTime;
      if (!this.timer) {
        this.timer = setInterval(() => {
          if (this.examTime > 0 && this.examTime <= TIME_COUNT) {
            this.examTime--;
          } else {
            clearInterval(this.timer);
            this.timer = null;
          }
        }, 1000);
      }
    },
    handleScroll() {
      this.scroll =
        document.documentElement.scrollTop || document.body.scrollTop;
      if (this.scroll > 250) {
        this.$refs.submitBox.style.top = 10 + "px";
      } else {
        this.$refs.submitBox.style.top = 250 + "px";
      }
    },
    /**
     * 提交试卷
     * @return {[type]} [description]
     */
    submit(isMust) {
      let isAllAnswer = true;
      let single = true;
      let mutil = true;
      let judge = true;
      let QA = true;
      let apfill = true;
      this.singleQuestions.some(item => {
        single = !item.sanswer == "";
      });
      this.multiQuestions.some(item => {
        mutil = !item.sanswer.length == 0;
      });
      this.judgeQuestions.some(item => {
        judge = !item.sanswer == "";
      });
      this.QAQuestions.some(item => {
        QA = !item.sanswer == "";
      });
      this.apfillQuestions.some(item => {
        apfill = !item.sanswer == "";
      });
      if (single && mutil && judge && QA && apfill) {
        isAllAnswer = true;
      } else {
        isAllAnswer = false;
      }
      console.log(isAllAnswer, isMust);
      if (isAllAnswer === false && isMust !== true) {
        this.$message({
          showClose: true,
          message: "考试时间未到，请完成所有题目再提交!",
          type: "warning",
          duration: 1000
        });
      } else {
        let score = 0; // 得分
        let answers = [];
        this.singleQuestions.forEach(item => {
          if (item.sanswer === item.answer) {
            score += item.score;
          }
          answers.push({
            _question: item._id,
            answer: item.sanswer
          });
        });
        this.multiQuestions.forEach(item => {
          let answer = item.answer.split(",");
          console.log(item.sanswer);
          if (answer.equals(item.sanswer)) {
            score += item.score;
          }
          answers.push({
            _question: item._id,
            answer: item.sanswer
          });
        });
        this.judgeQuestions.forEach(item => {
          if (item.sanswer === item.answer) {
            score += item.score;
          }
          answers.push({
            _question: item._id,
            answer: item.sanswer
          });
        });
        if (this.QAQuestions.length > 0) {
          this.QAQuestions.forEach(item => {
            answers.push({
              _question: item._id,
              answer: item.sanswer
            });
          });
        }
        if (this.apfillQuestions.length > 0) {
          this.apfillQuestions.forEach(item => {
            answers.push({
              _question: item._id,
              answer: item.sanswer
            });
          });
        }
        if (isMust === true) {
          this.submitApi(score, answers);
        } else {
          this.$confirm("是否提前交卷？", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消"
          })
            .then(() => {
              this.submitApi(score, answers);
            })
            .catch(() => {
              this.$message({
                type: "info",
                message: "已取消操作"
              });
            });
        }
      }
    },
    /**@argument score answers
     * 提交试卷api请求
     */
    submitApi(score, answers) {
      this.$axios
        .post("/api/sSubmitExam", {
          userId: this.userData.userId,
          paperId: this.paperId,
          score: score,
          answers: answers,
          startTime: this.startTime,
          examStatus:
            this.apfillQuestions.length == 0 && this.QAQuestions.length == 0
              ? 2
              : 1
        })
        .then(response => {
          let res = response.data;
          if (res.status == "0") {
            this.$message({
              showClose: true,
              message: "您的试卷提交成功!",
              type: "success",
              duration: 3000
            });
            this.$router.push({ path: "/smsgCenter" });
          }
        })
        .catch(err => {
          this.$message({
            showClose: true,
            message: "提交失败，请联系老师!",
            type: "error",
            duration: 1000
          });
        });
    }
  }
};
</script>
<style scoped>
.exam {
  padding: 20px 0;
}

.main {
  padding: 20px 40px;
  text-align: left;
}

.main .question-title {
  font-size: 18px;
  margin-bottom: 5px;
  width: 100%;
  display: inline-block;
  word-wrap: break-word;
  white-space: normal;
}

.main .option {
  display: block;
  margin: 5px 0 0 15px;
}

.main .question-item {
  margin-left: 40px;
}

.main .textarea {
  width: 500px;
}

.scroll_top {
  background-color: pink;
  position: fixed;
  right: 100px;
  bottom: 150px;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  cursor: pointer;
  transition: 0.3s;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.12);
  z-index: 5;
}

.scroll_top i {
  color: #409eff;
  display: block;
  line-height: 40px;
  text-align: center;
  font-size: 18px;
}

.submit-box {
  position: fixed;
  right: 40px;
  padding: 30px;
  transition: 1s;
  text-align: center;
  border: 1px solid #ffffff;
  box-shadow: 1px 1px 1px #c5c5c5;
  background: rgba(193, 193, 193, 0.1);
  border-radius: 20px;
  z-index: 10;
}

.submit-box .timeout {
  margin-top: 10px;
  text-align: center;
}

.marginT10 {
  margin-top: 10px;
}
.marginB10 {
  margin-bottom: 10px;
}
.text-center {
  text-align: center;
}
ul,
li {
  padding: 0;
  margin: 0;
}
li {
  list-style: none;
}
.apfill {
  width: 70%;
}
h3 {
  margin-left: 20px;
}
</style>
