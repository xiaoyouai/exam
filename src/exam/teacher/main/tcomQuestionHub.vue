<template>
<div>
   <el-container>
    <el-main>
          <span slot="label"><i class="el-icon-date"></i>考试记录</span>
          <div class="comBottom">
                    题目关键词：
                <el-input placeholder="请输入题目关键词" v-model="searchTxt" clearable prefix-icon="el-icon-search"  size="small" style="width:30%">  </el-input>
                <el-button type="primary" size="small" @click="search">搜索</el-button>
                <!-- <el-button type="primary" size="small" class="multiAddBtn">批量添加</el-button> -->
          </div>
          <el-table :data="tableData" v-loading="loading" height="420" border  style="width: 100%" :default-sort = "{prop: 'date', order: 'descending'}" @selection-change="handleSelectionChange">
            <el-table-column type="expand">
                <template slot-scope="props">
                  <el-form label-position="left" inline class="demo-table-expand">
                    <el-form-item label="题目类型">
                      <span>{{ transType(props.row) }}</span>
                    </el-form-item>
                    <el-form-item label="题目分值">
                      <span>{{ props.row.grade }}</span>
                    </el-form-item>
                    <el-form-item label="题目答案">
                      <span>{{transAnswer(props.row)}}</span>
                    </el-form-item>
                    <el-form-item label="题目">
                      <span>{{ props.row.name }}</span>
                    </el-form-item>
                    <el-form-item label="题目选项" v-for="(item,index) in props.row.selection" :key="index" v-if="props.row.type=='multi'||props.row.type=='single'">
                      <span>{{(index + 10).toString(36).toUpperCase()}}：{{item.value}}</span>
                    </el-form-item>
                  </el-form>
                </template>
            </el-table-column>
            <el-table-column type="selection"  width="56"> </el-table-column>
            <el-table-column label="题目类型" >
              <template slot-scope="props">
                <span>{{ transType(props.row) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="题目" >
              <template slot-scope="props">
                <span v-if="props.row.name.length<12">{{props.row.name}}</span>
                <span v-else>行首下拉查看详情</span>
              </template>
            </el-table-column>
            <el-table-column label="题目答案" >
              <template slot-scope="props">
                <span>{{transAnswer(props.row)}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="grade" label="题目分值" > </el-table-column>
                        <!-- <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  @click="addToMyHub(scope.index,scope.row)">添加到我的题库</el-button>
              </template>
            </el-table-column> -->
        </el-table>
    </el-main>
  </el-container>

</div>
</template>

<script>
export default {
  data() {
    return {
      userId: '',
      tableData: [],
      questionData: [], //从数据库获取得来的题目数据
      loading: true,
      searchTxt: ""
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
    //   this.userId=parseInt(this.$route.params.id);
      this.$axios
        .post("/api/tgetallquestion")
        .then(response => {
          let res = response.data;
          if (res.msg == "success" && res.status == "0") {
            this.questionData = res.result;
            if (this.questionData.length > 0) {
              this.questionData.forEach(item => {
                this.tableData.push({
                  type: item.type,
                  name: item.content,
                  grade: item.score,
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
          this.loading = false;
          this.$message({
            showClose: true,
            message: "获取题目失败，请稍后再试！",
            type: "error",
            duration: 2000
          });
        });
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    search() {
      this.$axios
        .post("/api/tsearchAllQuestion", { content: this.searchTxt })
        .then(response => {
          let res = response.data;
          if (res.msg == "success" && res.status == "0") {
            if (res.result.length === 0) {
              this.$message({
                showClose: true,
                type: "warning",
                message: "没有该题目!",
                duration: 2000
              });
              return;
            }
            this.questionData = res.result;
            this.tableData=[];
            this.questionData.forEach(item => {
                this.tableData.push({
                  type: item.type,
                  name: item.content,
                  grade: item.score,
                  answer: item.answer,
                  selection: item.selection
                });
              });
          } else {
            this.$message({
              showClose: true,
              message: "搜索失败",
              type: "error",
              duration: 2000
            });
          }
        })
        .catch(err => {
          this.$message({
            showClose: true,
            message: "搜索失败",
            type: "warning",
            duration: 2000
          });
        });
    },
    // addToMyHub(index, row) {----------先放这里，不知道要不要写
    //   //添加到我的题库
    //   this.$confirm("确认添加, 是否继续?", "提示", {
    //     confirmButtonText: "确定",
    //     cancelButtonText: "取消"
    //   })
    //     .then(() => {
    //       this.$axios
    //         .post("/api/taddQuestion", { questionData: row })
    //         .then(response => {
    //           let res = response.data;
    //           if (res.msg == "success" && res.status == "0") {
    //             this.$message({
    //               showClose: true,
    //               type: "success",
    //               message: "添加成功!",
    //               duration: 2000
    //             });
    //           } else {
    //             this.$message({
    //               showClose: true,
    //               message: "添加失败",
    //               type: "error",
    //               duration: 2000
    //             });
    //           }
    //         })
    //         .catch(err => {
    //           this.$message({
    //             showClose: true,
    //             message: "添加失败",
    //             type: "warning",
    //             duration: 2000
    //           });
    //         });
    //     })
    //     .catch(() => {
    //       this.$message({
    //         type: "info",
    //         message: "已取消添加"
    //       });
    //     });
    // }
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
/* 批量添加按钮样式 */
.multiAddBtn {
  position: absolute;
  top: 100px;
  right: 100px;
}
</style>