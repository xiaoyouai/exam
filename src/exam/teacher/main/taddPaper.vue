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
        <el-button type="danger" size="small" v-if="paperId==='-1'" @click="resetPaper">清空试卷题目</el-button>
        <el-button type="primary" size="small">
          <router-link :to="'/tmain/tmypaper/'+userId">返回</router-link>
          </el-button>
        </div>
    </el-col>
  </el-row>

  <el-row>
    <el-form label-width="75px">
      <el-col :span="10">
        <div class="grid-content bg-purple">
          <el-form-item label="试卷名：">
            <el-input v-model.trim="name" clearable></el-input>
          </el-form-item>
        </div>
      </el-col>
      <el-col :span="5">
        <div class="grid-content bg-purple">
          <el-form-item label="总分：">
            <el-input v-model.trim="score" clearable  placeholder="请输入数字">
              <template slot="append">分</template>
            </el-input>
          </el-form-item>
        </div>
      </el-col>
      <el-col :span="9">
        <el-row>
          <el-col :span="10">
            <div class="grid-content bg-purple">
              <el-form-item label="年级：">
                <el-tooltip class="item" content="请认真选择年级，一经保存无法修改" placement="top" v-if="paperId=='-1'">
                  <el-select v-model="mygrade" placeholder="请选择">
                    <el-option label="1年级" value=1></el-option>
                    <el-option label="2年级" value=2></el-option>
                    <el-option label="3年级" value=3></el-option>
                    <el-option label="4年级" value=4></el-option>
                    <el-option label="5年级" value=5></el-option>
                    <el-option label="6年级" value=6></el-option>
                  </el-select>
                </el-tooltip>
                <span v-if="paperId!=='-1'">{{mygrade}}年级</span>
              </el-form-item>
            </div>
          </el-col>
          <el-col :span="14">
            <div class="grid-content bg-purple">
              <el-form-item label="班级：">
                <el-tooltip class="item" content="请认真填写班级，一经保存无法修改" placement="top" v-if="paperId=='-1'">
                  <el-input v-model.trim="myclass" clearable  placeholder="请输数字" >
                    <template slot="append" >班</template>
                  </el-input>
                </el-tooltip>
                <span v-if="paperId!=='-1'">{{myclass}}班</span>
              </el-form-item>
            </div>
          </el-col>
        </el-row>
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
          <el-form-item label="总时长：">
            <el-input v-model.trim="sumtime" clearable  placeholder="请输入数字">
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
    <el-col :span="10">
      <span class="type"><i class="fa-icon 	fa fa-hand-o-right"></i>&nbsp;&nbsp;从我的题库添加题目：</span>
      <el-autocomplete
        v-model="findQuestion"
        :fetch-suggestions="querySearchAsync"
        placeholder="请输入题目内容"
        @select="handleSelect"
      ></el-autocomplete>
    </el-col>
    <el-col :span="14" >
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
            <el-col :span="8"><div class="grid-content bg-purple"><span >试卷名：{{name}}</span></div></el-col>
            <el-col :span="3"><div class="grid-content bg-purple-light"><span>总分：{{score}}</span></div></el-col>
            <el-col :span="2"><div class="grid-content bg-purple-light"><span>年级：{{mygrade}}</span></div></el-col>
            <el-col :span="2"><div class="grid-content bg-purple-light"><span>班级：{{myclass}}</span></div></el-col>
            <el-col :span="6"><div class="grid-content bg-purple-light"><span>开始时间：{{new Date(starttime).toLocaleString()}}</span></div></el-col>
            <el-col :span="3"><div class="grid-content bg-purple"><span>总时长：{{sumtime}}</span></div></el-col>

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
            <span class="wrap">{{item.content}}</span>
            <span>&nbsp;&nbsp;({{item.score}}分)</span>
            <span><i class="el-icon-edit editicon" @click="editPaperItem(item,index)"></i></span>
            <span><i class="el-icon-delete delicon" @click="delPaperItem(index)"></i></span>
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

  <!-- 添加问题弹窗 -->
  <el-dialog
  title="新增题目"
  :visible.sync="dialogVisible"
  width="30%">
    <el-form :model="myquestion" :rules="rules" ref="myquestion" label-width="100px" :disabled="isAddFromHub" class="demo-ruleForm">
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
                <el-input placeholder="请输入内容" v-model.trim="myquestion.selection[index].value" style="width:85%"  clearable></el-input>
                <i class="el-icon-delete delicon" @click="delsel(index)"></i>
          </el-form-item>
          <el-form-item v-if="myquestion.type=='single'||myquestion.type=='multi'">
            <el-button @click="addsel" type="primary" size="small">新增选项</el-button>
          </el-form-item>
          <el-form-item prop="answer" label="答案：" v-if="myquestion.type!=='Q&A'&&myquestion.type!=='apfill'">
            <span class="tip" v-if="myquestion.type=='judgement'">判断题A(正确) 、 B(错误)</span>
            <el-input placeholder="请输入答案---A或A,B" v-model.trim="myquestion.answer" clearable></el-input>
          </el-form-item>
          <el-form-item prop="answer" :rules="rules.answer2" label="答案：" v-if="myquestion.type==='Q&A'||myquestion.type==='apfill'">
            <el-input type="textarea" placeholder="请输入参考答案" v-model.trim="myquestion.answer" clearable></el-input>
          </el-form-item>
          <el-form-item prop="score" label="分值：">
            <el-input placeholder="请输入分值" v-model.trim="myquestion.score" clearable></el-input>
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
      userId: "", //老师的id，唯一的用处是用于返回按钮
      paperId: "-1", //paperId为-1表示添加试卷
      teacherId: "", //teacher表对应的_id，后面修改试卷的时候添加题目了需要用到
      name: "", //试卷名称
      starttime: "", //考试开始时间
      sumtime: "", //考试总时长
      score: 100,
      myclass: "",
      mygrade: "",
      delQuestionId: [], //被初始化时已存在的后面又被删除的题目
      dialogVisible: false,
      findQuestion: "", //从题库添加题目对应输入栏
      editIndex: -1, //编辑试卷题目时题目的位置
      paper: [], //试卷题目
      allQuestion: [], //题库所有的题目
      timeout: null, //用于从题库搜搜题目的节流操作
      isAddFromHub: false, //是否是从题库添加题目，
      // 题目弹窗相关
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
        answer2: [{ validator: checkAnswer, trigger: "blur", required: true }],
        score: [
          { validator: checkScore, trigger: "blur", required: true },
          { pattern: /^[0-9]+$/, message: "分值必须为数字值" }
        ]
      }
      // 题目弹窗相关
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
      //我的题库
      this.$axios
        .get("/api/tgetMyQuestion", {
          params: {
            userId: this.userId,
            content: ""
          }
        })
        .then(response => {
          let res = response.data;
          if (res.msg == "success" && res.status == "0") {
            this.allQuestion = res.result.question;
            this.allQuestion = this.allQuestion.filter(item => {
              //把该试卷的题目过滤掉防止重复添加
              return item._papers.indexOf(this.paperId) === -1;
            });
            this.allQuestion.forEach(item => {
              let type = "";
              if (item.type === "single") {
                type = "单选";
              } else if (item.type === "multi") {
                type = "多选";
              } else if (item.type === "apfill") {
                type = "填空";
              } else if (item.type === "Q&A") {
                type = "简答";
              } else if (item.type === "judgement") {
                type = "判断";
              }
              item.value = `(${type})${item.content}（${item.score}分）`; //因为input的显示必须要有value这一项
            });
          } else if (res.status == "2") {
            this.$message({
              showClose: true,
              message: "还没有创建题目！！！",
              type: "warning",
              duration: 1000
            });
          } else {
            this.$message({
              showClose: true,
              message: "获取题目失败，请稍后再试！",
              type: "error",
              duration: 1000
            });
          }
        })
        .catch(err => {
          console.log(err);
          this.$message({
            showClose: true,
            message: "获取题目失败，请稍后再试！",
            type: "error",
            duration: 1000
          });
        });
    },
    // 从题库搜索出现结果
    querySearchAsync(queryString, cb) {
      let allQuestion = this.allQuestion;
      let results = [];
      let time = 0;
      if (queryString !== "") {
        allQuestion.forEach(item => {
          if (item.value.indexOf(queryString) > -1) {
            results.push(item);
          }
        });
        time = 1500;
      } else {
        results = allQuestion;
      }
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        cb(results);
      }, time * Math.random());
    },
    handleSelect(item) {
      // 编辑试卷中的题目
      this.dialogVisible = true;
      this.isAddFromHub = true;
      this.myquestion = this.$deepCopy(item);
    },
    // 从题库搜索出现结果

    // 添加题目弹窗相关
    single() {
      this.dialogVisible = true;
      this.isAddFromHub = false;
      this.myquestion.type = "single";
    },
    multi() {
      this.dialogVisible = true;
      this.isAddFromHub = false;
      this.myquestion.type = "multi";
    },
    judgement() {
      this.dialogVisible = true;
      this.isAddFromHub = false;
      this.myquestion.type = "judgement";
    },
    QA() {
      this.dialogVisible = true;
      this.isAddFromHub = false;
      this.myquestion.type = "Q&A";
    },
    apfill() {
      this.dialogVisible = true;
      this.isAddFromHub = false;
      this.myquestion.type = "apfill";
    },
    addsel() {
      //添加选项
      this.myquestion.selection.push({ value: "" });
    },
    delsel(index) {
      //删除选项
      if (this.isAddFromHub) {
        return;
      } else {
        this.myquestion.selection.splice(index, 1);
      }
    },
    quit() {
      //取消添加题目
      this.dialogVisible = false;
      if (this.isAddFromHub) {
        this.allQuestion = this.allQuestion.filter(
          item => item._id !== this.myquestion._id
        ); //过滤已经加入的题目
        this.isAddFromHub = false;
      }
      this.myquestion = {
        content: "", //题目内容
        type: "",
        selection: [{ value: "" }, { value: "" }, { value: "" }, { value: "" }],
        answer: "",
        score: ""
      };
      this.findQuestion = ""; //这里考虑从题库加题时的情况

      this.editIndex = -1;
    },
    addQuestion() {
      //添加题目
      this.$refs.myquestion.validate(valid => {
        if (valid) {
          if (
            this.myquestion.type == "single" ||
            this.myquestion.type == "judgement"
          ) {
            //确保单选和判断只选一个
            if (!/^[A-Z]*$/.test(this.myquestion.answer)) {
              this.$message({
                showClose: true,
                message: "该题目只有一个答案",
                type: "warning",
                duration: 1000
              });
              return;
            }
          }
          if (
            this.myquestion.type == "apfill" ||
            this.myquestion.type == "judgement" ||
            this.myquestion.type == "Q&A"
          ) {
            //把选项置空
            this.myquestion.selection = [
              { value: "" },
              { value: "" },
              { value: "" },
              { value: "" }
            ];
          }
          let item = this.$deepCopy(this.myquestion); //深度克隆，不然下面的值的置空会影响到push的值
          this.editIndex == -1
            ? this.paper.push(item)
            : this.paper.splice(this.editIndex, 1, item);
          this.quit(); //并不是真的取消，只是这里要用到一样的代码
        } else {
          this.$message({
            showClose: true,
            message: "请将正确填写信息！",
            type: "warning",
            duration: 1000
          });
        }
      });
    },
    // 添加题目弹窗相关

    editPaperItem(item, index) {
      // 编辑试卷中的题目
      if (item._id) {
        //编辑从题库添加的题目
        this.$confirm("您是因为题目有错所以修改题目?", "提示", {
          confirmButtonText: "是",
          cancelButtonText: "不是",
          type: "warning"
        })
          .then(() => {
            this.dialogVisible = true;
            this.myquestion.type = item.type;
            this.editIndex = index;
            this.myquestion = this.$deepCopy(item);
          })
          .catch(() => {
            this.$message({
              type: "warning",
              message: "请选择删除该题目然后新增题目",
              duration: 2000,
              showClose: true
            });
          });
      } else {
        this.dialogVisible = true;
        this.myquestion.type = item.type;
        this.editIndex = index;
        this.myquestion = this.$deepCopy(item);
      }
    },
    delPaperItem(index) {
      //删除试卷中的题目
      this.$confirm("确认删除?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          if (
            this.paper[index]._papers &&
            this.paper[index]._papers.indexOf(this.paperId) > -1
          ) {
            //新添加的题目不算
            this.delQuestionId.push(this.paper[index]._id);
          }
          if (this.paper[index]._id) {
            //说明是从题库添加的题目
            this.allQuestion.push(this.paper[index]); //把从题库添加的题目再添加回去
          }
          this.paper.splice(index, 1);
          this.$message({
            type: "success",
            message: "删除成功!",
            showClose: true,
            duration: 1000
          });
        })
        .catch(err => {
          console.log(err);
          this.$message({
            type: "info",
            message: "已取消删除",
            showClose: true,
            duration: 1000
          });
        });
    },

    // 清空试卷题目：
    resetPaper() {
      this.$confirm("确认清空试卷题目?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.allQuestion = [
            ...this.allQuestion,
            ...this.paper.filter(item => item._id)
          ];
          this.paper = [];
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
        !this.score ||
        !this.mygrade ||
        !this.myclass ||
        !this.sumtime ||
        !this.starttime ||
        !/^[0-9]*$/.test(this.score) ||
        !/^[0-9]*$/.test(this.myclass) ||
        !/^[0-9]*$/.test(this.sumtime)
      ) {
        this.$message({
          showClose: true,
          message: "请完整并正确的输入试卷信息",
          type: "warning",
          duration: 1000
        });
        return;
      }
      if (this.paper.length == 0) {
        this.$message({
          showClose: true,
          message: "请完善试卷题目",
          type: "warning",
          duration: 1000
        });
        return;
      }

      let now = new Date();
      if (now - new Date(this.starttime) > 0) {
        this.$message({
          showClose: true,
          message: "不可选择过去的时间,请重新选择时间",
          type: "warning",
          duration: 1000
        });
        return;
      }

      let sum = 0;
      this.paper.forEach(item => {
        sum += parseInt(item.score);
      });
      if (sum !== parseInt(this.score)) {
        this.$confirm(
          `试卷总分与题目总分不相等,是否修改题目总分为试卷总分?`,
          `试卷总分${this.score}--题目总分${sum}`,
          {
            confirmButtonText: "是",
            cancelButtonText: "否，我要修改题目",
            type: "warning",
            center: true
          }
        )
          .then(() => {
            this.score = sum;
            this.doSubmit();
          })
          .catch(err => {
            console.log(err);
            return;
          });
      } else {
        this.doSubmit();
      }
    },
    /**
     * 执行提交数据
     */
    doSubmit() {
      const loading = this.$loading({
        lock: true,
        text: "数据提交中",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      if (this.paperId == "-1") {
        this.$confirm(
          `确定新增试卷吗？请确认已正确选择年级和班级信息`,
          `您选择的--${this.mygrade}--年级--${this.myclass}--班`,
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
            center: true
          }
        )
          .then(() => {
            this.$axios
              .post("/api/taddpaper", {
                paperData: {
                  name: this.name,
                  totalPoints: this.score,
                  time: parseInt(this.sumtime),
                  examgrade: parseInt(this.mygrade),
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
                    duration: 1000
                  });
                  this.$router.push({
                    path: "/tmain/tmypaper/" + parseInt(this.$route.params.id)
                  });
                } else if (res.status == "2") {
                  this.$message({
                    showClose: true,
                    message: "创造题目失败，请稍后再试！",
                    type: "error",
                    duration: 1000
                  });
                } else if (res.status == "3") {
                  this.$message({
                    showClose: true,
                    message: "创造试卷失败，请稍后再试！",
                    type: "error",
                    duration: 1000
                  });
                } else if (res.status == "4") {
                  this.$message({
                    showClose: true,
                    message: "未查询到教师信息，请登陆重试！",
                    type: "error",
                    duration: 1000
                  });
                } else {
                  this.$message({
                    showClose: true,
                    message: "保存失败，请稍后再试！",
                    type: "error",
                    duration: 1000
                  });
                }
                loading.close();
              })
              .catch(err => {
                this.$message({
                  showClose: true,
                  message: "保存失败，请稍后再试！",
                  type: "warning",
                  duration: 1000
                });
                loading.close();
              });
          })
          .catch(() => {
            loading.close();
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
              totalPoints: this.score,
              time: parseInt(this.sumtime),
              examgrade: parseInt(this.mygrade),
              examclass: parseInt(this.myclass),
              startTime: this.starttime,
              _questions: this.paper
            },
            paperId: this.paperId,
            teacherId: this.teacherId,
            delQuestionId: this.delQuestionId
          })
          .then(response => {
            let res = response.data;
            if (res.msg == "success" && res.status == "0") {
              this.$message({
                showClose: true,
                message: "修改成功",
                type: "success",
                duration: 1000
              });
              this.$router.push({
                path: "/tmain/tmypaper/" + parseInt(this.$route.params.id)
              });
            } else if (res.status == "2") {
              this.$message({
                showClose: true,
                message: "没找到题目",
                type: "error",
                duration: 1000
              });
            } else if (res.status == "3") {
              this.$message({
                showClose: true,
                message: "新添加题目失败",
                type: "error",
                duration: 1000
              });
            } else {
              this.$message({
                showClose: true,
                message: "修改失败，请稍后重试",
                type: "error",
                duration: 1000
              });
            }
            loading.close();
          })
          .catch(err => {
            this.$message({
              showClose: true,
              message: "修改失败，请稍后重试",
              type: "warning",
              duration: 1000
            });
            loading.close();
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

