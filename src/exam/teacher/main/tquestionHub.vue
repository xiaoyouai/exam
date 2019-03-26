<template>
<div>
   <el-container>
    <el-main>
          <span slot="label"><i class="el-icon-date"></i>考试记录</span>
          <div class="comBottom">
            <el-row>
              <el-col :span="20">
                    题目关键词：
                <el-input placeholder="请输入题目关键词" v-model="test" clearable prefix-icon="el-icon-search"  size="small" style="width:30%">  </el-input>
                <el-button type="primary" size="small">搜索</el-button>
              </el-col>
              <el-col :span="4">
                <el-row>
                  <el-col :span="12"><el-button type="primary" size="small">新增题目</el-button></el-col>
                  <el-col :span="12"><el-button type="danger" size="small" @click="multiDel">批量删除</el-button></el-col>
                </el-row>
              </el-col>
            </el-row>
          </div>
          <el-table v-loading="loading" :data="tableData" height="420" border  style="width: 100%" :default-sort = "{prop: 'date', order: 'descending'}" @selection-change="handleSelectionChange">
            <el-table-column type="expand">
                <template slot-scope="props">
                  <el-form label-position="left" inline class="demo-table-expand">
                    <el-form-item label="题目类型">
                      <span>{{ transType(props.row) }}</span>
                    </el-form-item>
                    <el-form-item label="题目分值">
                      <span>{{ props.row.score }}</span>
                    </el-form-item>
                    <el-form-item label="题目答案">
                      <span>{{transAnswer(props.row)}}</span>
                    </el-form-item>
                    <el-form-item label="题目">
                      <span>{{ props.row.content }}</span>
                    </el-form-item>
                    <el-form-item label="题目选项" v-for="(item,index) in props.row.selection" :key="index" v-if="props.row.type=='multi'||props.row.type=='single'">
                      <span>{{(index + 10).toString(36).toUpperCase()}}：{{item.value}}</span>
                    </el-form-item>
                  </el-form>
                </template>
            </el-table-column>
            <el-table-column type="selection"> </el-table-column>
            <el-table-column label="题目类型" >
              <template slot-scope="props">
                <span>{{ transType(props.row) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="题目" >
              <template slot-scope="props">
                <span v-if="props.row.content.length<12">{{props.row.content}}</span>
                <span v-else>行首下拉查看详情</span>
              </template>
            </el-table-column>
            <el-table-column label="题目答案" >
              <template slot-scope="props">
                <span>{{transAnswer(props.row)}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="score" label="题目分值" > </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  @click="handleEdit(scope.row)">编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  @click="handleDelete(scope.row)">删除</el-button>
              </template>
            </el-table-column>
        </el-table>
    </el-main>
  </el-container>

  <!-- 编辑问题弹窗 -->
  <el-dialog
  title="修改题目"
  :visible.sync="dialogVisible"
  width="30%">
    <el-form :model="myquestion" :rules="rules" ref="myquestion" label-width="100px" class="demo-ruleForm">
          <el-form-item prop="content" label="题目：">
            <el-input placeholder="请输入题目" v-model.trim="myquestion.content" clearable></el-input>
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
      <el-button type="primary" @click="sureEditQuestion">确 定</el-button>
    </span>
  </el-dialog>
  <!-- 编辑问题弹窗 -->

</div>
</template>

<script>
export default {
  data() {
    // 弹窗验证规则
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
    }; // 弹窗验证规则
    return {
      content: "小明",
      myclass: 1,
      userId: "",
      test: "",
      questionData: [],
      tableData: [],
      loading: true,
      selQuestion: [], //所有选中的题目
      // 弹窗相关数据
      dialogVisible: false,
      myquestion: {
        questionId: "", //题目的_id
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
      }
      // 弹窗相关数据
    };
  },
  computed: {
    transType() {
      //用于显示不同的类型
      return function(row) {
        if (row.type == "single") {
          return "单选题";
        } else if (row.type == "multi") {
          return "多选题";
        } else if (row.type == "apfill") {
          return "填空题";
        } else if (row.type == "Q&A") {
          return "简答题";
        } else if (row.type == "judgement") {
          return "判断题";
        }
      };
    },
    transAnswer() {
      //用于在类型为判断题时显示对或者错或者该类型未保存答案
      return function(row) {
        if (row.type == "judgement") {
          return row.answer == "A" ? "对" : "错";
        } else if (row.type == "apfill" || row.type == "Q&A") {
          return "该类型未保存答案";
        } else {
          return row.answer;
        }
      };
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.userId = this.$route.params.id;
      this.$axios
        .post("/api/tgetmyquestion", {
          userId: this.userId
        })
        .then(response => {
          let res = response.data;
          if (res.msg == "success" && res.status == "0") {
            this.questionData = res.result;
            if (this.questionData.length > 0) {
              this.questionData.forEach(item => {
                this.tableData.push({
                  questionId: item._id, //用于编辑和删除
                  type: item.type,
                  content: item.content,
                  score: item.score,
                  answer: item.answer,
                  selection: item.selection
                });
              });
            } else {
              this.$message({
                showClose: true,
                message: "还没有创建题目！！！",
                type: "warning",
                duration: 2000
              });
            }
          } else if (res.status == "2") {
            this.$message({
              showClose: true,
              message: "还没有创建题目！！！",
              type: "warning",
              duration: 2000
            });
          } else {
            this.$message({
              showClose: true,
              message: "获取题目失败，请稍后再试！",
              type: "error",
              duration: 2000
            });
          }
          this.loading = false;
        })
        .catch(err => {
          console.log(err);
          this.loading = false;
          this.$message({
            showClose: true,
            message: "获取题目失败，请稍后再试！",
            type: "warning",
            duration: 2000
          });
        });
    },
    handleSelectionChange(val) {
      //val为所有的选中项[{...},{...}...]
      this.selQuestion = val;
    },
    handleEdit(row) {
      this.dialogVisible = true; //唤起弹窗
      this.myquestion = this.$deepCopy(row); //给数据
    },
    handleDelete(row) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.tableData = this.tableData.filter(
            item => item.questionId !== row.questionId
          );
          let data = this.questionData.filter(
            item => item._id === row.questionId
          );
          this.$axios
            .post("/api/tdelQuestion", { questionData: data[0] })
            .then(response => {
              let res = response.data;
              if (res.msg == "success" && res.status == "0") {
                this.$message({
                  showClose: true,
                  type: "success",
                  message: "删除成功!",
                  duration: 2000
                });
              } else {
                this.$message({
                  showClose: true,
                  message: "修改失败",
                  type: "error",
                  duration: 2000
                });
              }
            })
            .catch(err => {
              this.$message({
                showClose: true,
                message: "修改失败",
                type: "warning",
                duration: 2000
              });
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    multiDel() {
      //批量删除----未完成
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$axios
            .post("/api/tdelQuestion", { questionData: this.selQuestion })
            .then(response => {
              let res = response.data;
              if (res.msg == "success" && res.status == "0") {
                this.selQuestion.forEach(data => {
                  this.questionData = this.questionData.filter(
                    item => item._id !== data.questionId
                  );
                  this.tableData = this.tableData.filter(
                    item => item._id !== data.questionId
                  );
                });

                this.$message({
                  showClose: true,
                  type: "success",
                  message: "删除成功!",
                  duration: 2000
                });
              } else {
                this.$message({
                  showClose: true,
                  message: "删除失败",
                  type: "error",
                  duration: 2000
                });
              }
            })
            .catch(err => {
              this.$message({
                showClose: true,
                message: "删除失败",
                type: "warning",
                duration: 2000
              });
            });
        })
        .catch(err => {
          console.log(err);
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    // 弹窗相关
    addsel() {
      //添加选项
      this.myquestion.selection.push({ value: "" });
    },
    delsel(index) {
      //删除选项
      this.myquestion.selection.splice(index, 1);
    },
    quit() {
      //取消编辑题目
      this.dialogVisible = false;
      this.myquestion.content = "";
      this.myquestion.answer = "";
      this.myquestion.score = "";
      this.myquestion.selection.forEach(item => (item.value = ""));
    },
    sureEditQuestion() {
      //确认编辑题目
      this.$refs.myquestion.validate(valid => {
        if (valid) {
          if (this.myquestion.type == "single"||this.myquestion.type == "judgement") {//确保单选和判断只选一个
            if (!/^[A-Z]*$/.test(this.myquestion.answer)) {
              this.$message({
                showClose: true,
                message: "该题目只有一个答案",
                type: "warning",
                duration: 2000
              });
              return;
            }
          }
          let questiondata = this.$deepCopy(this.myquestion); //深度克隆
          for (let i = 0, len = this.tableData.length; i < len; i++) {
            if (this.tableData[i].questionId === questiondata.questionId) {
              this.tableData.splice(i, 1, questiondata); //替换表格的值
              break;
            }
          }
          for (let i = 0, len = this.questionData.length; i < len; i++) {
            if (this.questionData[i]._id === questiondata.questionId) {
              (this.questionData[i].type = questiondata.type),
                (this.questionData[i].content = questiondata.content),
                (this.questionData[i].score = questiondata.score),
                (this.questionData[i].answer = questiondata.answer),
                (this.questionData[i].selection = questiondata.selection);
              break;
            }
          }
          let data = this.questionData.filter(
            item => item._id === questiondata.questionId
          );
          this.$axios
            .post("/api/tupdateQuestion", { questionData: data[0] })
            .then(response => {
              let res = response.data;
              if (res.msg == "success" && res.status == "0") {
                this.$message({
                  showClose: true,
                  type: "success",
                  message: "修改成功!",
                  duration: 2000
                });
              } else {
                this.$message({
                  showClose: true,
                  message: "修改失败",
                  type: "error",
                  duration: 2000
                });
              }
            })
            .catch(err => {
              this.$message({
                showClose: true,
                message: "修改失败",
                type: "warning",
                duration: 2000
              });
            });
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
    }
    // 弹窗相关
  }
};
</script>
<style scoped>
.demo-table-expand {
  font-size: 0;
}
.demo-table-expand label {
  width: 90px;
}
.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 33.3%;
  color: #0a2f5f;
}
.demo-table-expand .el-form-item:last-child {
  width: 100%;
}

/* 题目弹窗相关样式 */
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
/* 题目弹窗相关样式 */
</style>