<template>
<div>
   <el-container>
    <el-main>
          <div class="comBottom">
            <el-row>
              <el-col :span="13">
                    题目关键词：
                <el-input placeholder="请输入题目关键词" v-model="searchTxt" clearable prefix-icon="el-icon-search"  size="small" style="width:70%">  </el-input>
                <el-button type="primary" size="small" @click="search">搜索</el-button>
              </el-col>
              <el-col :span="3">
                <el-select v-model="questionType" style="height:100%;width:100px"  size="small" @change="changeType">
                    <el-option label="全部题型" value="all"></el-option>
                    <el-option label="单选题" value="single"></el-option>
                    <el-option label="判断题" value="judgement"></el-option>
                    <el-option label="填空题" value="apfill"></el-option>
                    <el-option label="多选题" value="multi"></el-option>
                    <el-option label="简答题" value="Q&A"></el-option>
                </el-select>
              </el-col>
              <el-col :span="8">
                <el-row>
                  <el-col :span="6"><el-button type="primary" size="small" @click="addQuestion">新增题目</el-button></el-col>
                  <el-col :span="6"><el-button type="danger" size="small" @click="multiDel">批量删除</el-button></el-col>
                  <el-col :span="6"><el-button type="primary" size="small" @click="uploadDialogVisible=true">导入题库</el-button></el-col>
                  <el-col :span="6"><el-button type="primary" size="small" @click="confirmEXport">导出题库</el-button></el-col>
                </el-row>
              </el-col>
            </el-row>
          </div>
          <el-table v-loading="loading" element-loading-text="数据加载中，请稍等" :data="tableData" height="410" border  style="width: 100%;margin-bottom:10px;"  @selection-change="handleSelectionChange">
            <el-table-column type="expand">
                <template slot-scope="props">
                  <el-form label-position="left" inline class="demo-table-expand">
                    <el-form-item label="题目类型">
                      <span>{{ transType(props.row) }}</span>
                    </el-form-item>
                    <el-form-item label="题目分值">
                      <span>{{ props.row.score }}</span>
                    </el-form-item>
                    <el-form-item label="题目">
                      <span class="wrap">{{ props.row.content }}</span>
                    </el-form-item>
                    <el-form-item label="题目答案">
                      <span  class="wrap">{{transAnswer(props.row)}}</span>
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
                <span v-if="props.row.answer.length<12">{{transAnswer(props.row)}}</span>
                <span v-else>行首下拉查看详情</span>
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
          <el-form-item prop="answer" :rules="rules.answer2" label="答案：" v-if="myquestion.type==='Q&A'||myquestion.type==='apfill'">
            <el-input type="textarea" placeholder="请输入参考答案" v-model.trim="myquestion.answer" clearable></el-input>
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

  <!-- 上传题库弹窗 -->
  <el-dialog
    title="上传题库"
    :visible.sync="uploadDialogVisible"
    width="30%">
    <div style="text-align:left">
      <h3><i class="fa-icon 	fa fa-hand-o-right"></i>&nbsp;&nbsp;1、下载模板</h3>
      &nbsp;&nbsp;<span><i class="el-icon-info"></i>&nbsp;建议多次分批导入，请使用微软office编辑</span><br><br>
      <el-button
          icon="el-icon-download"
          size="small"
          type="primary">
          <a href="./../../../../static/example.xlsx" download>下载EXCEL模板</a>
      </el-button>
    </div>
    <div style="text-align:left">
      <h3><i class="fa-icon 	fa fa-hand-o-right"></i>&nbsp;&nbsp;2、上传文件</h3>
      &nbsp;&nbsp;<el-upload ref="upload" action="/"
        :show-file-list="false"
        :on-change="importExcel"
        :auto-upload="false">
        <el-button
          slot="trigger"
          icon="el-icon-upload"
          size="small"
          type="primary">
          导入题库
        </el-button>
    </el-upload>
    </div>
  </el-dialog>
  <!-- 上传题库弹窗 -->

</div>
</template>

<script>
export default {
  data() {
    // 弹窗验证规则
    var checkContent = (rule, value, callback) => {
      if (value === "") {
        return callback(new Error("题目不能为空"));
      } else {
        callback();
      }
    };
    var checkSelection = (rule, value, callback) => {
      if (value === "") {
        return callback(new Error("选项不能为空"));
      } else {
        callback();
      }
    };
    var checkAnswer = (rule, value, callback) => {
      if (value === "") {
        return callback(new Error("答案不能为空"));
      } else {
        callback();
      }
    };
    var checkScore = (rule, value, callback) => {
      if (value === "") {
        return callback(new Error("分值不能为空"));
      } else {
        callback();
      }
    }; // 弹窗验证规则
    return {
      content: "小明",
      teacherId: "", //老师的_id,可用于编辑和删除时判断是不是自己出的题目
      userId: "",
      searchTxt: "", //搜索input的文本
      tableData: [],
      loading: true,
      selQuestion: [], //所有选中的题目

      questionType: "all", //选择的题目类型

      xlsxJson: "", //上传的excel的解析数据
      uploadDialogVisible: false, //控制上传题库弹窗

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
        answer2: [{ validator: checkAnswer, trigger: "blur", required: true }],
        score: [
          { validator: checkScore, trigger: "blur", required: true },
          { pattern: /^[0-9]+$/, message: "分值必须为数字值" }
        ]
      },
      // 弹窗相关数据

      currentPage: 1, //当前页码
      pageSize: 10000, //每页条数,初始化为10000
      pageTotal: 0 //总条数
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
      this.loading = true;
      this.$axios
        .get("/api/tgetMyQuestion", {
          params: {
            userId: this.userId,
            content: this.searchTxt,
            pageNumber: this.currentPage,
            pageSize: this.pageSize
          }
        })
        .then(response => {
          let res = response.data;
          this.pageSize =
            this.pageSize === 10000 ? res.result.total : this.pageSize;
          this.pageTotal =
            this.pageTotal === 0 ? res.result.total : this.pageTotal;
          if (res.msg == "success" && res.status == "0") {
            this.tableData =
              this.questionType === "all"
                ? res.result.question
                : res.result.question.filter(
                    item => item.type === this.questionType
                  );
            if (this.questionType !== "all") {
              this.pageTotal = this.tableData.length;
            }

            this.teacherId = res.result.teacher;
            if (this.tableData.length === 0) {
              this.$message({
                showClose: true,
                message: "还没有创建题目！！！",
                type: "warning",
                duration: 1000
              });
            }
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
          this.loading = false;
        })
        .catch(err => {
          console.log(err);
          this.loading = false;
          this.$message({
            showClose: true,
            message: "获取题目失败，请稍后再试！",
            type: "warning",
            duration: 1000
          });
        });
    },
    handleSelectionChange(val) {
      //val为所有的选中项[{...},{...}...]
      this.selQuestion = val;
    },
    handleEdit(row) {
      if (row._teacher !== this.teacherId) {
        this.$message({
          showClose: true,
          type: "warning",
          message: "该题目不是您出的，您无法编辑和删除，只能将题目移出题库!",
          duration: 1000
        });
        return;
      }
      this.$confirm("您是因为题目有错所以修改题目?", "提示", {
        confirmButtonText: "是",
        cancelButtonText: "不是",
        type: "warning"
      })
        .then(() => {
          this.dialogVisible = true; //唤起弹窗
          this.myquestion = this.$deepCopy(row); //给数据
        })
        .catch(() => {
          this.$message({
            type: "warning",
            message: "请选择新增题目",
            duration: 2000,
            showClose: true
          });
        });
    },
    handleDelete(row) {
      if (row._teacher !== this.teacherId) {
        this.$confirm("该题目不是您出的，仅能将它移出题库，是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            this.doRemoveQuestionFromHub([row._id]);
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消移除"
            });
          });
      } else {
        this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            this.doDelQuestion([row]);
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消删除"
            });
          });
      }
    },
    doRemoveQuestionFromHub(data) {
      //调用接口把题目从题库移出，multiDel和handleDelete中调用
      this.$axios
        .post("/api/tdelQuestionFromHub", {
          questionId: data,
          teacherId: this.teacherId
        })
        .then(response => {
          let res = response.data;
          if (res.msg == "success" && res.status == "0") {
            data.forEach(ids => {
              this.tableData = this.tableData.filter(item => item._id !== ids);
            });

            this.$message({
              showClose: true,
              type: "success",
              message: "移除成功!",
              duration: 1000
            });
          } else {
            this.$message({
              showClose: true,
              message: "移除失败",
              type: "error",
              duration: 1000
            });
          }
        })
        .catch(err => {
          this.$message({
            showClose: true,
            message: "移除失败",
            type: "warning",
            duration: 1000
          });
        });
    },
    doDelQuestion(data) {
      //调用接口删除题目，multiDel和handleDelete中调用
      this.$axios
        .post("/api/tdelQuestion", { questionData: data })
        .then(response => {
          let res = response.data;
          if (res.msg == "success" && res.status == "0") {
            data.forEach(datas => {
              this.tableData = this.tableData.filter(
                item => item._id !== datas._id
              );
            });
            this.$message({
              showClose: true,
              type: "success",
              message: "删除成功!",
              duration: 1000
            });
            this.currentPage = 1; //当前页码
            this.pageSize = 10000; //每页条数
            this.pageTotal = 0; //总条数
            this.init();
          } else {
            this.$message({
              showClose: true,
              message: "删除失败",
              type: "error",
              duration: 1000
            });
          }
        })
        .catch(err => {
          this.$message({
            showClose: true,
            message: "删除失败",
            type: "warning",
            duration: 1000
          });
        });
    },
    multiDel() {
      //批量删除
      this.$confirm(
        "此操作将永久删除该文件,或者将题目移出题库,是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(() => {
          let removeData = [];
          let removeArr = this.selQuestion.filter(
            item => item._teacher !== this.teacherId
          );
          if (removeArr.length > 0) {
            removeArr.forEach(item => {
              removeData.push(item._id);
            });
            this.doRemoveQuestionFromHub(removeData); //移除题目
          }

          this.selQuestion = this.selQuestion.filter(
            item => item._teacher === this.teacherId
          );
          if (this.selQuestion.length > 0) {
            this.doDelQuestion(this.selQuestion); //删除题目
          }
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
      this.myquestion = {
        content: "", //题目内容
        type: "",
        selection: [{ value: "" }, { value: "" }, { value: "" }, { value: "" }],
        answer: "",
        score: ""
      };
    },
    sureEditQuestion() {
      //确认编辑题目
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
          let questiondata = this.$deepCopy(this.myquestion); //深度克隆
          if (!questiondata._id) {
            //说明是新加的题目，进入添加操作
            questiondata._papers = [];
            questiondata.useState = 0;
            this.doAddQuestion([questiondata]);
            return;
          }
          this.tableData.forEach((item, index) => {
            if (item._id == questiondata._id) {
              this.$set(this.tableData, index, questiondata);
            }
          });
          this.$axios
            .post("/api/tupdateQuestion", { questionData: questiondata })
            .then(response => {
              let res = response.data;
              if (res.msg == "success" && res.status == "0") {
                this.$message({
                  showClose: true,
                  type: "success",
                  message: "修改成功!",
                  duration: 1000
                });
              } else {
                this.$message({
                  showClose: true,
                  message: "修改失败",
                  type: "error",
                  duration: 1000
                });
              }
            })
            .catch(err => {
              this.$message({
                showClose: true,
                message: "修改失败",
                type: "warning",
                duration: 1000
              });
            });
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
    // 弹窗相关

    addQuestion() {
      //点击新增题目按钮
      this.dialogVisible = true;
      this.myquestion = {
        content: "", //题目内容
        type: "single",
        selection: [{ value: "" }, { value: "" }, { value: "" }, { value: "" }],
        answer: "",
        score: ""
      };
    },
    doAddQuestion(questiondata) {
      //实现新增题目，在sureEditQuestion里调用
      const loading = this.$loading({
        lock: true,
        text: "数据提交中，请稍等",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      this.$axios
        .post("/api/taddQuestion", {
          questionData: questiondata,
          teacherId: this.$route.params.id
        })
        .then(response => {
          let res = response.data;
          if (res.msg == "success" && res.status == "0") {
            this.$message({
              showClose: true,
              message: "添加成功,可前往最后一页查看",
              type: "success",
              duration: 2000
            });
            this.currentPage = 1; //当前页码
            this.pageSize = 10000; //每页条数
            this.pageTotal = 0; //总条数
            this.uploadDialogVisible = false;
            this.init();
          } else {
            this.$message({
              showClose: true,
              message: "添加失败",
              type: "error",
              duration: 1000
            });
          }
          loading.close();
        })
        .catch(err => {
          loading.close();
          this.$message({
            showClose: true,
            message: "添加失败",
            type: "warning",
            duration: 1000
          });
        });
      this.quit();
    },
    search() {
      this.currentPage = 1; //当前页码
      this.pageSize = 10000; //每页条数
      this.pageTotal = 0; //总条数
      this.init();
    },
    /**
     * 分页
     */
    handleSizeChange(val) {
      this.pageSize = val;
      this.init();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.init();
    },

    /**
     * 按类型筛选
     */
    changeType() {
      this.currentPage = 1; //当前页码
      this.pageSize = 10000; //每页条数
      this.pageTotal = 0; //总条数
      this.init();
    },

    /**
     * 导入题库
     */
    importExcel(file) {
      const types = file.name.split(".")[1];
      const fileType = ["xlsx", "xlc", "xlm", "xls", "xlt", "xlw", "csv"].some(
        item => item === types
      );
      if (!fileType) {
        this.$message({
          showClose: true,
          message: "格式错误！请重新选择",
          type: "warning",
          duration: 1000
        });
        return;
      }
      this.file2Xce(file, this.$XLSX).then(tabJson => {
        if (tabJson && tabJson.length > 0) {
          this.xlsxJson = tabJson;
          this.doUpload();
          // xlsxJson就是解析出来的json数据,数据格式如下
          // [
          //   {
          //     sheetName: sheet1
          //     sheet: sheetData
          //   }
          // ]
        }
      });
    },
    file2Xce(file, XLSX) {
      return new Promise(function(resolve, reject) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const data = e.target.result;
          this.wb = XLSX.read(data, {
            type: "binary"
          });
          const result = [];
          this.wb.SheetNames.forEach(sheetName => {
            result.push({
              sheetName: sheetName,
              sheet: XLSX.utils.sheet_to_json(this.wb.Sheets[sheetName])
            });
          });
          resolve(result);
        };
        reader.readAsBinaryString(file.raw);
      });
    },
    /**
     * 上传数据到题库中
     */
    doUpload() {
      let allData = [];
      let postData = [];
      let data;
      this.xlsxJson.forEach(item => {
        allData = [...allData, ...item.sheet];
      });
      allData.forEach(item => {
        data = {};
        let type = "";
        let answer = item["答案"];
        let selection = [
          { value: "" },
          { value: "" },
          { value: "" },
          { value: "" }
        ];
        if (item["类型"] == "单选题") {
          type = "single";
          selection = this.parseSelection(item);
        } else if (item["类型"] == "多选题") {
          type = "multi";
          selection = this.parseSelection(item);
          answer = answer.split("").join(",");
        } else if (item["类型"] == "简答题") {
          type = "Q&A";
        } else if (item["类型"] == "判断题") {
          type = "judgement";
          answer = item["答案"] == "对" ? "A" : "B";
        } else if (item["类型"] == "填空题") {
          type = "apfill";
        }
        data = {
          content: item["题目"],
          answer: answer,
          score: item["分数"],
          type: type,
          selection: selection,
          _papers: [],
          useState: 0
        };
        postData.push(data);
      });
      this.doAddQuestion(postData);
    },
    /**
     * 解析选项
     */
    parseSelection(item) {
      let data = [];
      let result = [];
      let index = 0;
      for (let key in item) {
        if (key.indexOf("选项") > -1) {
          index = key.slice(2).charCodeAt() - 65;
          data[index] = item[key];
        }
      }
      data.forEach(element => {
        result.push({
          value: element
        });
      });
      return result;
    },
    /**
     * 导出题库
     */
    confirmEXport() {
      this.$confirm("此操作将导出excel文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.doExport();
        })
        .catch(err => {
          console.log(err);
          this.$message({
            type: "info",
            message: "已取消导出"
          });
        });
    },
    doExport() {
      const loading = this.$loading({
        lock: true,
        text: "导出中，请稍等",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });

      this.currentPage = 1; //当前页码
      this.pageSize = 10000; //每页条数
      this.pageTotal = 0; //总条数
      this.init();

      let excelData = [];
      let itemData = {};
      this.tableData.forEach(item => {
        itemData = {
          题目: item.content,
          分数: item.score,
          答案: item.answer
        };
        itemData["类型"] = item.type === "apfill" ? "填空题" : "简答题";
        if (item.type === "single" || item.type === "multi") {
          itemData["类型"] = item.type === "single" ? "单选题" : "多选题";
          item.selection.forEach((item2, index) => {
            itemData[`选项${String.fromCharCode(index + 65)}`] = item2.value;
          });
        }
        if (item.type === "multi") {
          itemData["答案"] = item.answer.split(",").join("");
        }
        if (item.type === "judgement") {
          itemData["答案"] = item.answer === "A" ? "对" : "错";
          itemData["类型"] = "判断题";
        }
        excelData.push(itemData);
      });

      require.ensure([], () => {
        const { export_json_to_excel } = require("vendor/Export2Excel");
        const tHeader = [
          //导出的表头名
          "题目",
          "类型",
          "答案",
          "分数",
          "选项A",
          "选项B",
          "选项C",
          "选项D",
          "选项E",
          "选项F",
          "选项G",
          "选项H",
          "选项I",
          "选项J",
          "选项K",
          "选项L",
          "选项M",
          "选项N",
          "选项O",
          "选项P",
          "选项Q",
          "选项R",
          "选项S",
          "选项T",
          "选项U",
          "选项V",
          "选项W",
          "选项X",
          "选项Y",
          "选项Z"
        ];
        const filterVal = [
          // 导出的表头字段名
          "题目",
          "类型",
          "答案",
          "分数",
          "选项A",
          "选项B",
          "选项C",
          "选项D",
          "选项E",
          "选项F",
          "选项G",
          "选项H",
          "选项I",
          "选项J",
          "选项K",
          "选项L",
          "选项M",
          "选项N",
          "选项O",
          "选项P",
          "选项Q",
          "选项R",
          "选项S",
          "选项T",
          "选项U",
          "选项V",
          "选项W",
          "选项X",
          "选项Y",
          "选项Z"
        ];
        const data = this.formatJson(filterVal, excelData);
        export_json_to_excel(
          tHeader,
          data,
          `题库_${new Date().toLocaleString()}`
        );
        loading.close();
      });
    },
    // 参数过滤
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]));
    }
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
  width: 50%;
  color: #0a2f5f;
}
.demo-table-expand .el-form-item:nth-child(3),
.demo-table-expand .el-form-item:nth-child(4) {
  width: 100%;
}
.wrap {
  width: 800px !important;
  display: inline-block;
  word-wrap: break-word;
  white-space: normal;
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