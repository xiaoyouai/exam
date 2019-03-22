<template>
<div>
  <el-row class="comBottom">
    <el-col :span="3"> <div class="grid-content bg-purple">
        <h1>
          <i class="el-icon-document"></i>&nbsp;&nbsp;试卷信息</h1>
      </div></el-col>
    <el-col :span="7" :offset="14">
      <div class="grid-content bg-purple-light" style="margin-top:1em;">
        <el-button type="primary" size="small" @click="save">保存</el-button>
        <el-button type="danger" size="small" @click="resetPaper">清空试卷题目</el-button>
        <el-button type="primary" size="small">
          <router-link to="/tmain/tmypaper">返回</router-link>
          </el-button>
        </div>
    </el-col>
  </el-row>

  <el-row>
    <el-form label-width="100px">
      <el-col :span="8">
        <div class="grid-content bg-purple">
          <el-form-item label="试卷名：">
            <el-input v-model="name" clearable></el-input>
          </el-form-item>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="grid-content bg-purple">
          <el-form-item label="试卷总分：">
            <el-input v-model="grade" clearable  placeholder="请输入数字">
              <template slot="append">分</template>
            </el-input>
          </el-form-item>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="grid-content bg-purple">
          <el-form-item label="考试班级：">
            <el-tooltip class="item" content="请认真填写班级，一经保存无法修改" placement="top-start" style="color:red" v-if="paperId=='-1'">
              <el-input v-model="myclass" clearable  placeholder="请输入数字" >
                <template slot="append">班</template>
              </el-input>
            </el-tooltip>
            <span v-if="paperId!=='-1'">{{myclass}}</span>
          </el-form-item>
        </div>
      </el-col>
    </el-form>
  </el-row>
  <el-row>
    <el-form label-width="100px">
      <el-col :span="8" :offset="4">
        <div class="grid-content bg-purple">
          <el-form-item label="开始时间：">
              <el-date-picker
                v-model="starttime"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm" format="yyyy-MM-dd HH:mm"
                placeholder="选择开始时间">
              </el-date-picker>
          </el-form-item>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="grid-content bg-purple">
          <el-form-item label="考试总时长：">
            <el-input v-model="sumtime" clearable  placeholder="请输入数字">
              <template slot="append">分钟</template>
            </el-input>
          </el-form-item>
        </div>
      </el-col>
    </el-form>
  </el-row>

  <div class="grid-content bg-purple">
    <h1 style="text-align:left;margin-left: 20px;">
    <i class="el-icon-document"></i>&nbsp;&nbsp;试卷题目</h1>
  </div>
  <el-row class="comBottom" >
    <el-col :span="9">
      <span class="type"><i class="fa-icon 	fa fa-hand-o-right"></i>&nbsp;&nbsp;从题库添加题目：</span>
      <el-autocomplete
        v-model="findQuestion"
        :fetch-suggestions="querySearchAsync"
        placeholder="请输入题目内容"
        @select="handleSelect"
      ></el-autocomplete>
    </el-col>
    <el-col :span="14" :offset="1">
      <div class="grid-content bg-purple-light">
         <span class="type"><i class="fa-icon 	fa fa-hand-o-right"></i>&nbsp;&nbsp;自主添加题目：</span>
        <el-button type="primary" size="medium" @click="single">单选题</el-button>
        <el-button type="primary" size="medium" @click="judgement">判断题</el-button>
        <el-button type="primary" size="medium" @click="apfill">填空题</el-button>
        <el-button type="primary" size="medium" @click="multi">多选题</el-button>
        <el-button type="primary" size="medium" @click="QA">简答题</el-button>
      </div>
    </el-col>
  </el-row>

  <!-- 试卷呈现 -->
  <el-container>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-row>
            <el-col :span="4"><div class="grid-content bg-purple"><span >试卷名：{{name}}</span></div></el-col>
            <el-col :span="3"><div class="grid-content bg-purple-light"><span>试卷总分：{{grade}}</span></div></el-col>
            <el-col :span="3"><div class="grid-content bg-purple-light"><span>考试班级：{{myclass}}</span></div></el-col>
            <el-col :span="5"><div class="grid-content bg-purple-light"><span>开始时间：{{starttime}}</span></div></el-col>
            <el-col :span="4"><div class="grid-content bg-purple"><span>考试时长：{{sumtime}}</span></div></el-col>

        </el-row>

      </div>
      <p v-if="paper==''">题目为空，请添加</p>
      <div v-for="(item,index) in paper" :key="index" class="text item">
          <div class="paperItem">
            <span>{{(index+1)}}、</span>
                  <span v-if="item.type=='single'">(单选题)</span>
                  <span v-if="item.type=='judgement'">(判断题)</span>
                  <span v-if="item.type=='apfill'">(填空题)</span>
                  <span v-if="item.type=='multi'">(多选题)</span>
                  <span v-if="item.type=='Q&A'">(简答题)</span>
            <span>{{item.content}}</span>
            <span>{{item.score}}</span>
            <span><i class="el-icon-edit editicon" @click="editPaperItem(item,index)"></i></span>
            <span><i class="el-icon-delete delicon" @click="delPaperItem(index)"></i></span>
          </div>
          <div v-if="item.type=='single'||item.type=='multi'" class="paperItemSel">
            <span v-for="(i,index) in item.selection">{{[i.value,index]|paperSelection }}</span>
          </div>
      </div>

    </el-card>
  </el-container>

  <!-- 添加问题弹窗 -->
  <el-dialog
  title="新增题目"
  :visible.sync="dialogVisible"
  width="30%">
    <el-form :model="myquestion" :rules="rules" ref="myquestion" label-width="100px" class="demo-ruleForm">
          <el-form-item prop="content" label="题目：">
            <el-input placeholder="请输入题目" v-model="myquestion.content" clearable></el-input>
          </el-form-item>
          <el-form-item prop="type" label="类型：">
            <el-select v-model="myquestion.type" style="width:100%">
                <el-option label="单选题" value="single"></el-option>
                <el-option label="判断题" value="judgement"></el-option>
                <el-option label="填空题" value="apfill"></el-option>
                <el-option label="多选题" value="multi"></el-option>
                <el-option label="简答题" value="Q&A"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :prop="'selection.' + index + '.value'"
              v-for="(item,index) in myquestion.selection"
              :rules="rules.selectionVal"
              :label="'选项'+(index+1)"
              :key="index"
              v-if="myquestion.type=='single'||myquestion.type=='multi'"
              >
                <el-input placeholder="请输入内容" v-model="myquestion.selection[index].value" style="width:85%"  clearable></el-input>
                <i class="el-icon-delete delicon" @click="delsel(index)"></i>
          </el-form-item>
          <el-form-item v-if="myquestion.type=='single'||myquestion.type=='multi'">
            <el-button @click="addsel" type="primary" size="small">新增选项</el-button>
          </el-form-item>
          <el-form-item prop="answer" label="答案：" v-if="myquestion.type!=='Q&A'&&myquestion.type!=='apfill'">
            <span class="tip" v-if="myquestion.type=='judgement'">判断题A(正确) 、 B(错误)</span>
            <el-input placeholder="请输入答案---A或A,B" v-model="myquestion.answer" clearable></el-input>
          </el-form-item>
          <el-form-item prop="score" label="分值：">
            <el-input placeholder="请输入分值" v-model="myquestion.score" clearable></el-input>
          </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="quit">取 消</el-button>
      <el-button type="primary" @click="addQuestion">确 定</el-button>
    </span>
  </el-dialog>
  <!-- 添加问题弹窗 -->
</div>
</template>

<script>
export default {
  data() {
    var checkContent = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("题目不能为空"));
      } else {
        callback();
      }
    };
    var checkSelection = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("选项不能为空"));
      } else {
        callback();
      }
    };
    var checkAnswer = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("答案不能为空"));
      } else {
        callback();
      }
    };
    var checkScore = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("分值不能为空"));
      } else {
        callback();
      }
    };
    return {
      paperId: "-1", //paperId为-1表示添加试卷
      teacherId:"",//teacher表对应的_id，后面修改试卷的时候添加题目了需要用到
      delQuestion:[],//存放删除的题目的_id，便于后面接口里对试卷进行修改
      name: "",//试卷名称
      starttime: "", //考试开始时间
      sumtime: "", //考试总时长
      grade: 100,
      myclass: "",
      dialogVisible: false,
      findQuestion: "", //从题库添加题目对应输入栏
      editIndex: -1, //编辑试卷题目时题目的位置
      myquestion: {
        content: "", //题目内容
        type: "",
        selection: [{ value: "" }, { value: "" }, { value: "" }, { value: "" }],
        answer: "",
        score: ""
      },
      rules: {
        content: [{ validator: checkContent, trigger: "blur", required: true }],
        selectionVal: [
          { validator: checkSelection, trigger: "blur", required: true }
        ],
        answer: [
          { validator: checkAnswer, trigger: "blur", required: true },
          {
            pattern: /(^[A-Z]|[A-Z],[A-Z])+$/,
            message: "请按正确格式(A或A,B)输入答案"
          }
        ],
        score: [
          { validator: checkScore, trigger: "blur", required: true },
          { pattern: /^[0-9]+$/, message: "分值必须为数字值" }
        ]
      },
      paper: []
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      //初始化
      this.paperId = this.$route.params.paperId;
      if (this.paperId !== "-1") {
        this.$axios
          .post("/api/tgetpapermsg", { paperId: this.paperId })
          .then(response => {
            let res = response.data;
            if (res.msg == "success" && res.status == "0") {
              let data = res.result;
              this.name = data.name;
              this.starttime = data.startTime; //考试开始时间
              this.sumtime = data.time; //考试总时长
              this.grade = data.totalPoints;
              this.myclass = data.examclass;
              this.paper = data._questions;
              this.teacherId=data._questions[0]._teacher;
            } else {
              this.$message({
                showClose: true,
                message: "获取试卷信息失败，请返回重试",
                type: "error",
                duration: 2000
              });
            }
          })
          .catch(err => {
            this.$message({
              showClose: true,
              message: "获取试卷信息失败，请返回重试",
              type: "warning",
              duration: 2000
            });
          });
      }
    },
    // 从题库搜索出现结果
    querySearchAsync(queryString, cb) {
      var findQuestion = this.findQuestion;
      var results = queryString
        ? findQuestion.filter(this.createStateFilter(queryString))
        : findQuestion;

      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        cb(results);
      }, 3000 * Math.random());
    },
    createStateFilter(queryString) {
      return state => {
        return (
          state.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        );
      };
    },
    handleSelect(item) {
      console.log(item);
    },
    // 从题库搜索出现结果

    // 添加题目相关
    single() {
      this.dialogVisible = true;
      this.myquestion.type = "single";
    },
    multi() {
      this.dialogVisible = true;
      this.myquestion.type = "multi";
    },
    judgement() {
      this.dialogVisible = true;
      this.myquestion.type = "judgement";
    },
    QA() {
      this.dialogVisible = true;
      this.myquestion.type = "Q&A";
    },
    apfill() {
      this.dialogVisible = true;
      this.myquestion.type = "apfill";
    },
    addsel() {
      //添加选项
      this.myquestion.selection.push({ value: "" });
    },
    delsel(index) {
      //删除选项
      this.myquestion.selection.splice(index, 1);
    },
    quit() {
      //取消添加题目
      this.dialogVisible = false;
      this.myquestion.content = "";
      this.myquestion.answer = "";
      this.myquestion.score = "";
      this.myquestion.selection.forEach(item => (item.value = ""));
    },
    addQuestion() {
      //添加题目
      this.$refs.myquestion.validate(valid => {
        if (valid) {
          let item = this.$deepCopy(this.myquestion); //深度克隆，不然下面的值的置空会影响到push的值
          this.editIndex == -1
            ? this.paper.push(item)
            : this.paper.splice(this.editIndex, 1, item);
          this.editIndex == -1;
          this.quit(); //并不是真的取消，只是这里要用到一样的代码
        } else {
          this.$message({
            showClose: true,
            message: "请将正确填写信息！",
            type: "warning",
            duration: 2000
          });
        }
      });
    },
    // 添加题目相关

    editPaperItem(item, index) {
      // 编辑试卷中的题目
      this.dialogVisible = true;
      this.myquestion.type = item.type;
      this.editIndex = index;
      this.myquestion = this.$deepCopy(item);
    },
    delPaperItem(index) {
      //删除试卷中的题目
      this.$confirm("确认删除?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.delQuestion.push(this.paper[index]._id);//放入删除试卷的_id，便于后续接口里实现删除题目
          this.paper.splice(index, 1);
          this.$message({
            type: "success",
            message: "删除成功!",
            showClose: true,
            duration: 1000
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
            showClose: true,
            duration: 1000
          });
        });
    },

    // 清空试卷：
    resetPaper() {
      this.$confirm("确认清空?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.paper = "";
          this.$message({
            type: "success",
            message: "删除成功!",
            showClose: true,
            duration: 1000
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
            showClose: true,
            duration: 1000
          });
        });
    },
    save() {
      //保存试卷
      if (
        !this.name ||
        !this.grade ||
        !this.myclass ||
        !this.sumtime ||
        !this.starttime ||
        !/^[0-9]*$/.test(this.grade) ||
        !/^[0-9]*$/.test(this.myclass) ||
        !/^[0-9]*$/.test(this.sumtime)
      ) {
        this.$message({
          showClose: true,
          message: "请完整并正确的输入试卷信息",
          type: "warning",
          duration: 2000
        });
        return;
      }
      if (this.paper.length == 0) {
        this.$message({
          showClose: true,
          message: "请完善试卷题目",
          type: "warning",
          duration: 2000
        });
        return;
      }

      if (this.paperId == "-1") {
        this.$confirm("确定新增试卷吗？请确认已正确选择班级信息", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type:'warning'
        })
          .then(() => {
            this.$axios
              .post("/api/taddpaper", {
                paperData: {
                  name: this.name,
                  totalPoints: this.grade,
                  time: parseInt(this.sumtime),
                  examclass: parseInt(this.myclass),
                  startTime: this.starttime,
                  _questions: this.paper
                },
                userId: parseInt(this.$route.params.id)
              })
              .then(response => {
                let res = response.data;
                if (res.msg == "success" && res.status == "0") {
                  this.$message({
                    showClose: true,
                    message: "保存成功",
                    type: "success",
                    duration: 2000
                  });
                  // this.$mySessionStorage.set("currentUser", res.result, "json");
                  this.$router.push({
                    path: "/tmain/tmypaper/" + parseInt(this.$route.params.id)
                  });
                } else {
                  this.$message({
                    showClose: true,
                    message: "保存失败，请稍后再试！",
                    type: "error",
                    duration: 2000
                  });
                }
              })
              .catch(err => {
                this.$message({
                  showClose: true,
                  message: "保存失败，请稍后再试！",
                  type: "warning",
                  duration: 2000
                });
              });
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消操作"
            });
          });
      } else {
        //修改试卷接口
        this.$axios
          .post("/api/tupdatepaper", {
            paperData: {
              name: this.name,
              totalPoints: this.grade,
              time: parseInt(this.sumtime),
              examclass: parseInt(this.myclass),
              startTime: this.starttime,
              _questions: this.paper
            },
            paperId: this.paperId,
            teacherId: this.teacherId,
            delQuestion:this.delQuestion
          })
          .then(response => {
            let res = response.data;
            if (res.msg == "success" && res.status == "0") {
              this.$message({
                showClose: true,
                message: "修改成功",
                type: "success",
                duration: 2000
              });
              // this.$mySessionStorage.set("currentUser", res.result, "json");
              this.$router.push({
                path: "/tmain/tmypaper/" + parseInt(this.$route.params.id)
              });
            } else {
              this.$message({
                showClose: true,
                message: "修改失败，请稍后重试",
                type: "error",
                duration: 2000
              });
            }
          })
          .catch(err => {
            this.$message({
              showClose: true,
              message: "修改失败，请稍后重试",
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
.type {
  font-size: 1.17em;
  margin-left: 10px;
}
.tip {
  color: red;
  font-size: 11px;
  position: absolute;
  top: -27px;
}
.delicon {
  color: red;
  width: 30px;
  font-size: 20px;
}

/* 试卷相关样式 */
.text {
  font-size: 16px;
  text-align: left;
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
/* 试卷相关样式 */
</style>

var a=[1,2,3,4,5];
a.forEach((item,index)=>{
  a[index]=100;
  console.log(item);
})
