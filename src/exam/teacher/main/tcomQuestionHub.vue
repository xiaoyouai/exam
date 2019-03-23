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
                      <span>{{ props.row.type }}</span>
                    </el-form-item>
                    <el-form-item label="题目分值">
                      <span>{{ props.row.grade }}</span>
                    </el-form-item>
                    <el-form-item label="题目答案">
                      <span>{{ props.row.answer }}</span>
                    </el-form-item>
                    <el-form-item label="题目">
                      <span>{{ props.row.name }}</span>
                    </el-form-item>
                  </el-form>
                </template>
            </el-table-column>
            <el-table-column type="selection"> </el-table-column>
            <el-table-column prop="type" label="题目类型" > </el-table-column>
            <el-table-column label="题目" >
              <template slot-scope="props">
                <span v-if="props.row.name.length<12">{{props.row.name}}</span>
                <span v-else>行首下拉查看详情</span>
              </template>
            </el-table-column>
            <el-table-column label="题目答案" >
              <template slot-scope="props">
                <span>{{props.row.answer}}</span>
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
            this.questionData.forEach(item => {
              let type='';
              if(item.type=='single'){type='单选题'}
              else if(item.type=='multi'){type='多选题'}
              else if(item.type=='apfill'){type='填空题'}
              else if(item.type=='Q&A'){type='简答题'}
              else if(item.type=='judgement'){type='判断题'}

              this.tableData.push({
                type: type,
                name: item.content,
                grade: item.score,
                answer: item.answer.length>0?item.answer:'该类型无答案'
              });
            });

          } else {
            this.$message({
              showClose: true,
              message: "获取题目失败，请稍后再试！",
              type: "error",
              duration: 2000
            });
          }
        })
        .catch(err => {
          this.$message({
            showClose: true,
            message: "获取题目失败，请稍后再试！",
            type: "error",
            duration: 2000
          });
        });
        this.loading = false;
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