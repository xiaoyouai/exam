<template>
<div>
   <el-container>
    <el-main>
          <span slot="label"><i class="el-icon-date"></i>考试记录</span>
          <div class="comBottom">
            <el-row>
              <el-col :span="20">
                    试卷名称：
                <el-input placeholder="请输入试卷名" v-model="papername" clearable prefix-icon="el-icon-search"  size="small" style="width:30%">  </el-input>
                <el-button type="primary" size="small">搜索</el-button>
              </el-col>
              <el-col :span="4">
                <el-row>
                  <router-link :to="'/tmain/taddPaper/-1/'+userId"><el-col :span="12"><el-button type="primary" size="small">新增试卷</el-button></el-col></router-link>
                  <!-- <router-link :to="{path:'tamin/taddPaper',params:{'userId':userId}}"><el-col :span="12"><el-button type="primary" size="small">新增试卷</el-button></el-col></router-link> -->
                  <el-col :span="12"><el-button type="danger" size="small">批量删除</el-button></el-col>
                </el-row>
              </el-col>
            </el-row>

          </div>
          <el-table :data="tableData" height="420" border v-loading="loading" style="width: 100%" :default-sort = "{prop: 'date', order: 'descending'}" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55"> </el-table-column>
            <el-table-column prop="date" label="考试时间" sortable> </el-table-column>
            <el-table-column prop="name" label="试卷名称" > </el-table-column>
            <el-table-column prop="grade" label="试卷总分"> </el-table-column>
            <el-table-column prop="time" label="考试时长"> </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  @click="handleEdit(scope.row)">编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  @click="handleDelete(scope.$index,scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
    </el-main>
  </el-container>

</div>
</template>

<script>
export default {
  data() {
    return {
      papername: "", //搜索的试卷名
      userId: "",
      paperData: [], //从数据库获取得来的试卷数据
      tableData: [],
      loading: true
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.userId = this.$route.params.id;
      this.$axios
        .post("/api/tgetAllpaper", {
          userId: this.userId
        })
        .then(response => {
          let res = response.data;
          if (res.msg == "success" && res.status == "0") {
            this.paperData = res.result;
            this.paperData.forEach(item => {
              this.tableData.push({
                paperId: item._id,
                date: item.startTime,
                name: item.name,
                grade: item.totalPoints,
                time: item.time
              });
            });
            this.loading = false;
          } else {
            this.$message({
              showClose: true,
              message: "获取试卷失败，请稍后再试！",
              type: "error",
              duration: 2000
            });
          }
        })
        .catch(err => {
          console.log(err);
          this.$message({
            showClose: true,
            message: "获取试卷失败，请稍后再试！",
            type: "warning",
            duration: 2000
          });
        });
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handleEdit(row) {
      //表格的编辑按钮，跳转去修改试卷
      let now = new Date();
      if (now - new Date(row.date) > 0) {
        this.$message({
          showClose: true,
          message: "已开考或正在考试，无法修改",
          type: "warning",
          duration: 2000
        });
        return;
      }
      if (now - new Date(row.date))
        this.$router.push({
          path: "/tmain/taddpaper/" + row.paperId + "/" + this.userId
        });
    },
    handleDelete(index, row) {
      this.$confirm("确认删除?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          // this.paper.splice(index, 1);
          this.$axios.post("").then(response => {
            let res = response.data;
          });
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
    }
  }
};
</script>
<style scoped>
</style>