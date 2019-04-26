<template>
<div>
  <el-row class="comBottom">
    <el-col :span="3"> <div class="grid-content bg-purple">
        <h1>
          <i class="el-icon-document"></i>&nbsp;&nbsp;试卷信息</h1>
      </div></el-col>
    <el-col :span="7" :offset="14">
      <div class="grid-content bg-purple-light" style="margin-top:1em;">
        <el-button type="primary" size="small">
          <router-link :to="'/tmain/tmypaper/'+userId">返回</router-link>
          </el-button>
        </div>
    </el-col>
  </el-row>

  <el-container>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-row>
            <el-col :span="8"><div class="grid-content bg-purple"><span >试卷名：{{name}}</span></div></el-col>
            <el-col :span="3"><div class="grid-content bg-purple-light"><span>总分：{{score}}</span></div></el-col>
            <el-col :span="2"><div class="grid-content bg-purple-light"><span>年级：{{mygrade}}</span></div></el-col>
            <el-col :span="2"><div class="grid-content bg-purple-light"><span>班级：{{myclass}}</span></div></el-col>
            <el-col :span="6"><div class="grid-content bg-purple-light"><span>开始时间：{{new Date(starttime).toLocaleString()}}</span></div></el-col>
            <el-col :span="3"><div class="grid-content bg-purple"><span>总时长：{{sumtime}}</span></div></el-col>

        </el-row>

      </div>

      <div v-for="(item,index) in paper" :key="index" class="text item">
          <div class="paperItem">
            <span>{{(index+1)}}、</span>
                  <span v-if="item.type=='single'">(单选题)</span>
                  <span v-if="item.type=='judgement'">(判断题)</span>
                  <span v-if="item.type=='apfill'">(填空题)</span>
                  <span v-if="item.type=='multi'">(多选题)</span>
                  <span v-if="item.type=='Q&A'">(简答题)</span>
            <span class="wrap">{{item.content}}</span>
            <span>&nbsp;&nbsp;({{item.score}}分)</span>
            <span style="color:#409eff" v-if="item.type=='single'||item.type=='judgement'||item.type=='multi'">&nbsp;&nbsp;答案：{{item.answer}}</span>
          </div>
          <div v-if="item.type=='single'||item.type=='multi'" class="paperItemSel">
            <span v-for="(i,index) in item.selection">{{[i.value,index]|paperSelection }}</span>
          </div>
          <div v-if="item.type=='apfill'||item.type=='Q&A'">
            <p class="wrap" style="margin-top:5px;margin-bottom:0;color:#409eff">答案：{{item.answer}}</p>
          </div>
      </div>

    </el-card>
  </el-container>

</div>
</template>

<script>
export default {
  data() {
    return {
      userId: "", //老师的id，唯一的用处是用于返回按钮
      paperId: "-1", //paperId为-1表示添加试卷
      teacherId: "", //teacher表对应的_id，后面修改试卷的时候添加题目了需要用到
      name: "", //试卷名称
      starttime: "", //考试开始时间
      sumtime: "", //考试总时长
      score: 100,
      myclass: "",
      mygrade: "",
      paper: [] //试卷题目
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.userId = parseInt(this.$route.params.id);
      //初始化
      this.paperId = this.$route.params.paperId;
      if (this.paperId !== "-1") {
        const loading = this.$loading({
          lock: true,
          text: "数据加载中，请稍等",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.7)"
        });
        this.$axios
          .post("/api/tgetpapermsg", { paperId: this.paperId })
          .then(response => {
            let res = response.data;
            if (res.msg == "success" && res.status == "0") {
              let data = res.result;
              this.name = data.name;
              this.starttime = new Date(data.startTime); //考试开始时间
              this.sumtime = data.time; //考试总时长
              this.score = data.totalPoints;
              this.mygrade = data.examgrade;
              this.myclass = data.examclass;
              this.paper = data._questions;
              this.teacherId = this.$getUserData().grade;
            } else if (res.status == "2") {
              this.$message({
                showClose: true,
                message: "没有该试卷",
                type: "error",
                duration: 1000
              });
            } else {
              this.$message({
                showClose: true,
                message: "获取试卷信息失败，请返回重试",
                type: "error",
                duration: 1000
              });
            }
            loading.close();
          })
          .catch(err => {
            console.log(err);
            loading.close();
            this.$message({
              showClose: true,
              message: "获取试卷信息失败，请返回重试",
              type: "warning",
              duration: 1000
            });
          });
      }
    }
  }
};
</script>
<style scoped>
.type {
  font-size: 1.17em;
  margin-left: 10px;
}

/* 试卷相关样式 */
.text {
  font-size: 16px;
  text-align: left;
}

.is-dark {
  color: red !important;
  font-size: 20px;
}
.item {
  margin-bottom: 18px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}

.box-card {
  width: 100%;
}

.editicon {
  color: #409eff;
  width: 30px;
  font-size: 20px;
}

.paperItemSel {
  margin-top: 5px;
}
.paperItemSel span {
  margin-right: 10px;
}
.wrap {
  max-width: 100%;
  display: inline-block;
  word-wrap: break-word;
  white-space: normal;
}
/* 试卷相关样式 */
</style>

