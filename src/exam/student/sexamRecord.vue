<template>
  <div class="exam">
    <h3 class="text-center marginT10">{{paperData.name}}</h3>
     <el-row>
         <el-col :span="3">
          <div class="grid-content bg-purple">
           {{userData.userName}}同学
          </div>
         </el-col>
         <el-col :span="3">
          <div class="grid-content bg-purple-light">
           学号：{{userData.userId}}
          </div>
         </el-col>
         <el-col :span="3">
          <div class="grid-content bg-purple">
            年级：{{userData.grade}}
          </div>
         </el-col>
         <el-col :span="3">
          <div class="grid-content bg-purple-light">
           班级：{{userData.class}}班
          </div>
         </el-col>
         <el-col :span="3">
          <div class="grid-content bg-purple">
            考试时长：{{paperData.time}}分钟
          </div>
         </el-col>
         <el-col :span="3">
          <div class="grid-content bg-purple-light">
           总分：{{paperData.totalPoints}}分
          </div>
         </el-col>
         <el-col :span="3">
          <div class="grid-content bg-purple-light">
           您的得分：{{score}}分
          </div>
         </el-col>
      <el-col :span="3">
           <div class="grid-content bg-purple-light">
            <el-button type="primary" size="mini" style="position: relative;top: -3px;">
                 <router-link to="/smsgCenter">返回</router-link>
            </el-button>
           </div>
      </el-col>
     </el-row>
    <div class="main">
    <el-tabs type="border-card">
     <el-tab-pane>
      <div class="single" v-if="singleQuestions.length>0">
        <h3><i class="fa-icon 	fa fa-hand-o-right"></i>&nbsp;&nbsp;单选题（只有一个正确答案）</h3>
        <ul class="question-item">
          <li class="marginB10" v-for="(item,index) in singleQuestions" :key="item._id">
            <p class="question-title">
                {{index+1}} 、{{item.content}}&nbsp;（{{item.score}}分）
                <span style="color:red">正确答案：{{item.answer}}</span>&nbsp;&nbsp;
                <span style="color:#409eff">您的答案：{{item.sanswer}}</span>
            </p>
            <span
              class="option"
              v-if="item.type!='judgement'&&item.type!='Q&A'"
              item
              v-for="(item1,index1) in item.selection"
              :key="(index1+1000)"
            >
              <span>{{options[index1]}}、{{item1.value}}</span>
            </span>
          </li>
        </ul>
      </div>
      <div class="multi" v-if="multiQuestions.length>0">
        <h3><i class="fa-icon 	fa fa-hand-o-right"></i>&nbsp;&nbsp;多选题（有多个正确答案）</h3>
        <ul class="question-item">
          <li class="marginB10" v-for="(item,index) in multiQuestions" :key="item._id">
            <p class="question-title">
                {{index+1}} 、{{item.content}}&nbsp;（{{item.score}}分）
                <span style="color:red">正确答案：{{item.answer}}</span>&nbsp;&nbsp;
                <span style="color:#409eff">您的答案：{{item.sanswer}}</span>
            </p>
            <span
              class="option"
              v-if="item.type!='judgement'&&item.type!='Q&A'"
              item
              v-for="(item1,index1) in item.selection"
              :key="(index1+1000)"
            >
              <span>{{options[index1]}}、{{item1.value}}</span>
            </span>
          </li>
        </ul>
      </div>
      <div class="judge" v-if="judgeQuestions.length>0">
        <h3><i class="fa-icon 	fa fa-hand-o-right"></i>&nbsp;&nbsp;判断题</h3>
        <ul class="question-item">
          <li class="marginB10" v-for="(item,index) in judgeQuestions" :key="item._id">
            <p class="question-title">{{index+1}} 、{{item.content}}&nbsp;（{{item.score}}分）</p>
             <span style="color:red">正确答案：{{item.answer==="A"?"对":"错"}}</span>&nbsp;&nbsp;
             <span style="color:#409eff">您的答案：{{item.sanswer==="A"?"对":"错"}}</span>
          </li>
        </ul>
      </div>
      <div class="judge" v-if="apfillQuestions.length>0">
        <h3><i class="fa-icon 	fa fa-hand-o-right"></i>&nbsp;&nbsp;填空题</h3>
        <ul class="question-item">
          <li class="marginB10" v-for="(item,index) in apfillQuestions" :key="item._id">
            <p class="question-title">{{index+1}} 、{{item.content}}&nbsp;（{{item.score}}分）</p>
            <p class="question-title" style="color:#409eff">您的答案：{{item.sanswer}}</p>
             <p class="question-title" style="color:red">参考答案：{{item.answer}}</p>
          </li>
        </ul>
      </div>
      <div class="judge" v-if="QAQuestions.length>0">
        <h3><i class="fa-icon 	fa fa-hand-o-right"></i>&nbsp;&nbsp;简答题</h3>
        <ul class="question-item">
          <li class="marginB10" v-for="(item,index) in QAQuestions" :key="item._id">
            <p class="question-title">{{index+1}} 、{{item.content}}&nbsp;（{{item.score}}分）</p>
             <p class="question-title" style="color:#409eff">您的答案：{{item.sanswer}}</p>
             <p class="question-title" style="color:red">参考答案：{{item.answer}}</p>
          </li>
        </ul>
      </div>
      </el-tab-pane>
    </el-tabs>
  </div>

    <div class="scroll_top" @click="scrollTop" v-if="scroll>100">
      <i class="el-icon-caret-top"></i>
    </div>

  </div>
</template>
<script type="text/ecmascript-6">
export default {
  data() {
    return {
      paperId: "",
      userData: {},
      paperData: {
        name: "",
        time: "",
        totalPoints: ""
      },
      score: 0,
      startTime: "",
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

  mounted() {
    this.userData = this.$getUserData();
    this.paperId = this.$route.params.paperId;
    this.init();
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
        .get("/api/sgetExamedInfo", {
          params: {
            paperId: this.paperId,
            userId: this.userData.userId
          }
        })
        .then(response => {
          let res = response.data;
          if (res.status == "0") {
            for (let key in this.paperData) {
              this.paperData[key] = res.result.paperData[key];
            }
            this.score = res.result.score;
            this.startTime = res.result.paperData.startTime;
            res.result.paperData._questions.forEach(item => {
              item.sanswer = res.result.studentAnswer.filter(
                item2 => item2._question == item._id
              )[0].answer;
              if (item.type == "single") {
                this.singleQuestions.push(item);
              } else if (item.type == "multi") {
                this.multiQuestions.push(item);
              } else if (item.type == "Q&A") {
                this.QAQuestions.push(item);
              } else if (item.type == "judgement") {
                this.judgeQuestions.push(item);
              } else if (item.type == "apfill") {
                this.apfillQuestions.push(item);
              }
            });
            console.log(this.QAQuestions);
          }
          loading.close();
        })
        .catch(err => {
          console.log(err);
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
    }
    // handleScroll() {
    //   this.scroll =
    //     document.documentElement.scrollTop || document.body.scrollTop;
    //   if (this.scroll > 250) {
    //     this.$refs.submitBox.style.top = 10 + "px";
    //   } else {
    //     this.$refs.submitBox.style.top = 250 + "px";
    //   }
    // }
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
