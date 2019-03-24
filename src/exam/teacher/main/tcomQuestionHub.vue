<template>
<div>
   <el-container>
    <el-main>
          <span slot="label"><i class="el-icon-date"></i>考试记录</span>
          <div class="comBottom">
                    题目关键词：
                <el-input placeholder="请输入题目关键词" v-model="test" clearable prefix-icon="el-icon-search"  size="small" style="width:30%">  </el-input>
                <el-button type="primary" size="small">搜索</el-button>
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
        </el-table>
    </el-main>
  </el-container>

</div>
</template>

<script>
export default {
  data() {
    return {
      name: "小明",
      password: "",
      myclass: 1,
      userId: 150920,
      mygrade: 1,
      test: "",
      tableData: [],
      questionData: [], //从数据库获取得来的题目数据
      loading: true
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
    transAnswer() {//用于在类型为判断题时显示对或者错或者该类型未保存答案
      return function(row) {
        if (row.type == "judgement") {
          return row.answer == "A" ? "对" : "错";
        } else if (row.type == "apfill"||row.type == "Q&A") {
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
  width: 33.3%;
  color: #0a2f5f;
}
.demo-table-expand .el-form-item:last-child {
  width: 100%;
}
</style>