<template>
<div>
   <el-container>
    <el-main>
          <span slot="label"><i class="el-icon-date"></i>考试记录</span>
          <div class="comBottom">
                    题目关键词：
                <el-input placeholder="请输入题目关键词" v-model="searchTxt" clearable prefix-icon="el-icon-search"  size="small" style="width:30%">  </el-input>
                <el-button type="primary" size="small" @click="search">搜索</el-button>
                <el-select v-model="questionType" style="height:100%;margin-left:20px;width:150px"  size="small" @change="changeType">
                    <el-option label="全部题型" value="all"></el-option>
                    <el-option label="单选题" value="single"></el-option>
                    <el-option label="判断题" value="judgement"></el-option>
                    <el-option label="填空题" value="apfill"></el-option>
                    <el-option label="多选题" value="multi"></el-option>
                    <el-option label="简答题" value="Q&A"></el-option>
                </el-select>
                <el-button type="primary" size="small" class="multiAddBtn" @click="multiAdd">批量添加</el-button>
          </div>
          <el-table :data="tableData" v-loading="loading" element-loading-text="数据加载中，请稍等" height="410" border  style="width: 100%;margin-bottom:10px;"  @selection-change="handleSelectionChange">
            <el-table-column type="expand">
                <template slot-scope="props">
                  <el-form label-position="left" inline class="demo-table-expand">
                    <el-form-item label="类型">
                      <span>{{ transType(props.row) }}</span>
                    </el-form-item>
                    <el-form-item label="分值">
                      <span>{{ props.row.grade }}</span>
                    </el-form-item>
                    <el-form-item label="题目" >
                      <span class="wrap">{{ props.row.name }}</span>
                    </el-form-item>
                    <el-form-item label="题目答案">
                      <span class="wrap">{{transAnswer(props.row)}}</span>
                    </el-form-item>
                    <el-form-item label="题目选项" v-for="(item,index) in props.row.selection" :key="index" v-if="props.row.type=='multi'||props.row.type=='single'">
                      <span>{{(index + 10).toString(36).toUpperCase()}}：{{item.value}}</span>
                    </el-form-item>
                  </el-form>
                </template>
            </el-table-column>
            <el-table-column type="selection"  width="56"> </el-table-column>
            <el-table-column label="类型"  width="70">
              <template slot-scope="props">
                <span>{{ transType(props.row) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="题目" >
              <template slot-scope="props">
                <span v-if="props.row.name.length<28">{{props.row.name}}</span>
                <span v-else>行首下拉查看详情</span>
              </template>
            </el-table-column>
            <el-table-column label="题目答案" >
              <template slot-scope="props">
                <span v-if="props.row.answer.length<28">{{transAnswer(props.row)}}</span>
                <span v-else>行首下拉查看详情</span>
              </template>
            </el-table-column>
            <el-table-column prop="grade" label="分值"  width="50"> </el-table-column>
            <el-table-column label="操作"  width="135">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  @click="addToMyHub(scope.$index)">添加到我的题库</el-button>
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

</div>
</template>

<script>
export default {
  data() {
    return {
      userId: "",
      teacherId: "", //老师的_id，用来判断题目是否是自己的题目
      tableData: [],
      questionData: [], //从数据库获取得来的题目数据
      loading: true,
      searchTxt: "",
      multipleSelection: [], //批量选择时的选定项

      questionType: "all", //选择的题目类型

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
      this.userId = parseInt(this.$route.params.id);
      this.loading = true;
      this.$axios
        .get("/api/tgetAllQuestion", {
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
            this.questionData =
              this.questionType === "all"
                ? res.result.questionData
                : res.result.questionData.filter(
                    item => item.type === this.questionType
                  );

            this.tableData = [];
            this.teacherId = res.result.teacherId;
            if (this.questionData.length > 0) {
              this.questionData.forEach(item => {
                this.tableData.push({
                  questionId: item._id, //用于添加到题库
                  type: item.type,
                  name: item.content,
                  grade: item.score,
                  answer: item.answer,
                  selection: item.selection,
                  teacher: item._teacher //用于判断出题老师
                });
              });
              if (this.questionType !== "all") {
                this.pageTotal = this.questionData.length;
              }
            } else {
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
            type: "error",
            duration: 1000
          });
        });
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
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
    doAdd(question) {
      //接口实现添加
      this.$axios
        .post("/api/taddQuestionToHub", {
          questionData: question,
          teacherId: this.teacherId
        })
        .then(response => {
          let res = response.data;
          if (res.msg == "success" && res.status == "0") {
            this.$message({
              showClose: true,
              type: "success",
              message: "添加成功!",
              duration: 1000
            });
          } else if (res.status === "3") {
            this.$message({
              showClose: true,
              type: "success",
              message: "已经在你的题库了!",
              duration: 1000
            });
          } else {
            this.$message({
              showClose: true,
              message: "添加失败",
              type: "error",
              duration: 1000
            });
          }
        })
        .catch(err => {
          this.$message({
            showClose: true,
            message: "添加失败",
            type: "warning",
            duration: 1000
          });
        });
    },
    addToMyHub(index) {
      //单项添加到我的题库
      this.$confirm("确认添加, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(() => {
          if (this.questionData[index]._teacher === this.teacherId) {
            this.$message({
              showClose: true,
              type: "success",
              message: "已经是你的题目了!",
              duration: 1000
            });
            return;
          }
          this.doAdd([this.questionData[index]._id]);
        })
        .catch(err => {
          console.log(err);
          this.$message({
            type: "info",
            message: "已取消添加"
          });
        });
    },
    multiAdd() {
      //批量添加
      this.$confirm(
        "确认添加, 是否继续?如果选中题目已经在您的题库中，则默认不添加",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消"
        }
      )
        .then(() => {
          this.multipleSelection = this.multipleSelection.filter(
            item => item.teacher !== this.teacherId
          ); //把老师出的题目过滤掉
          let data = [];
          this.multipleSelection.forEach(item => {
            data.push(item.questionId);
          });
          this.doAdd(data);
        })
        .catch(err => {
          console.log(err);
          this.$message({
            type: "info",
            message: "已取消添加"
          });
        });
    },
    /**
     * 按类型筛选
     */
    changeType() {
      this.currentPage = 1; //当前页码
      this.pageSize = 10000; //每页条数
      this.pageTotal = 0; //总条数
      this.init();
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
/* 批量添加按钮样式 */
.multiAddBtn {
  position: absolute;
  top: 100px;
  right: 100px;
}
</style>