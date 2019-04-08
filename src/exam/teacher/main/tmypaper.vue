<template>
<div>
   <el-container>
    <el-main>
          <span slot="label"><i class="el-icon-date"></i>考试记录</span>
          <div class="comBottom">
            <el-row>
              <el-col :span="10">
                    按试卷名称搜索：
                <el-input placeholder="请输入试卷名" v-model="papername" clearable prefix-icon="el-icon-search"  size="small" style="width:33%">  </el-input>
                <el-button type="primary" size="small" @click="searchByPaper">搜索</el-button>
              </el-col>
              <el-col :span="10">
                    按班级搜索：
                <el-input placeholder="请输入数字" v-model.number="paperclass" clearable prefix-icon="el-icon-search"  size="small" style="width:33%">  </el-input>
                <el-button type="primary" size="small" @click="searchByClass">搜索</el-button>
              </el-col>
              <el-col :span="4">
                <el-row>
                  <router-link :to="'/tmain/taddPaper/-1/'+userId"><el-col :span="12"><el-button type="primary" size="small">新增试卷</el-button></el-col></router-link>
                  <!-- <router-link :to="{path:'tamin/taddPaper',params:{'userId':userId}}"><el-col :span="12"><el-button type="primary" size="small">新增试卷</el-button></el-col></router-link> -->
                  <el-col :span="12"><el-button type="danger" size="small" @click="multiDel">批量删除</el-button></el-col>
                </el-row>
              </el-col>
            </el-row>

          </div>
          <el-table :data="tableData" height="420" border v-loading="loading" style="width: 100%;margin-bottom:10px;" :default-sort = "{prop: 'startTime', order: 'descending'}" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="56"> </el-table-column>
            <el-table-column prop="startTime" label="考试时间" sortable><template slot-scope="props">
                <span>{{ new Date(props.row.startTime).toLocaleString()}}</span>
              </template></el-table-column>
            <el-table-column prop="examclass" label="考试班级"> </el-table-column>
            <el-table-column prop="name" label="试卷名称" > </el-table-column>
            <el-table-column prop="totalPoints" label="试卷总分"> </el-table-column>
            <el-table-column prop="time" label="考试时长"> </el-table-column>
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

</div>
</template>

<script>
export default {
  data() {
    return {
      papername: "", //搜索的试卷名
      paperclass: "", //搜索的班级名
      userId: "",
      tableData: [],
      loading: true,
      selPaper: [], //所有选中的试卷

      currentPage: 1, //当前页码
      pageSize: 10000, //每页条数,初始化为10000
      pageTotal: 0 //总条数
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.userId = this.$route.params.id;
      this.loading = true;
      this.$axios
        .get("/api/tgetAllpaper", {
          params: {
            userId: this.userId,
            name: this.papername,
            pageNumber: this.currentPage,
            pageSize: this.pageSize,
            class: this.paperclass
          }
        })
        .then(response => {
          let res = response.data;
          this.pageSize = this.pageSize === 10000 ? res.total : this.pageSize;
          this.pageTotal = this.pageTotal === 0 ? res.total : this.pageTotal;
          if (res.msg == "success" && res.status == "0") {
            // if (res.result.length === 0 && this.tableData.length > 0) {
            //   this.$message({
            //     showClose: true,
            //     message: "未搜到该试卷！！！",
            //     type: "warning",
            //     duration: 1000
            //   });
            //   this.loading = false;
            //   return;
            // }
            this.tableData = res.result;
            if (this.tableData.length === 0) {
              this.$message({
                showClose: true,
                message: "还没有创建试卷！！！",
                type: "warning",
                duration: 1000
              });
            }
          } else if (res.status == "2") {
            this.$message({
              showClose: true,
              message: "还没有创建试卷！！！",
              type: "error",
              duration: 1000
            });
          } else {
            this.$message({
              showClose: true,
              message: "获取试卷失败，请稍后再试！",
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
            message: "获取试卷失败，请稍后再试！",
            type: "warning",
            duration: 1000
          });
        });
    },
    handleSelectionChange(val) {
      this.selPaper = val;
    },
    handleEdit(row) {
      //表格的编辑按钮，跳转去修改试卷
      let now = new Date();
      if (now - new Date(row.startTime) > 0) {
        this.$message({
          showClose: true,
          message: "已开考或正在考试，无法修改",
          type: "warning",
          duration: 1000
        });
        return;
      }
      if (now - new Date(row.startTime)) {
        this.$router.push({
          path: "/tmain/taddpaper/" + row._id + "/" + this.userId
        });
      }
    },
    handleDelete(row) {
      this.$confirm("确认删除?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$axios
            .post("/api/tdelpaper", {
              userId: this.userId,
              paperId: [row]
            })
            .then(response => {
              let res = response.data;
              if (res.msg == "success" && res.status == "0") {
                this.tableData = this.tableData.filter(
                  item => item._id !== row._id
                );
                this.$message({
                  type: "success",
                  message: "删除成功!",
                  showClose: true,
                  duration: 1000
                });
                this.init();
              } else if (res.status == "3") {
                this.$message({
                  showClose: true,
                  message: "没有该试卷",
                  type: "error",
                  duration: 1000
                });
              } else if (res.status == "4") {
                this.$message({
                  showClose: true,
                  message: "题目删除试卷失败",
                  type: "error",
                  duration: 1000
                });
              } else {
                this.$message({
                  showClose: true,
                  message: "删除失败，请稍后再试！",
                  type: "error",
                  duration: 1000
                });
              }
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
    multiDel() {
      //批量删除
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$axios
            .post("/api/tdelpaper", {
              userId: this.userId,
              paperId: this.selPaper //整个放过去，后台解析
            })
            .then(response => {
              let res = response.data;
              if (res.msg == "success" && res.status == "0") {
                this.selPaper.forEach(data => {
                  this.tableData = this.tableData.filter(
                    item => item._id !== data._id
                  );
                });
                this.$message({
                  showClose: true,
                  type: "success",
                  message: "删除成功!",
                  duration: 1000
                });
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
        })
        .catch(err => {
          console.log(err);
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    searchByPaper() {
      this.currentPage = 1; //当前页码
      this.pageSize = 10000; //每页条数
      this.pageTotal = 0; //总条数
      this.init();
    },
    searchByClass() {
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
    }
  }
};
</script>
<style scoped>
</style>