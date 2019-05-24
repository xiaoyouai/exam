<template>
<div>
   <el-container>
    <el-main>
          <span slot="label"><i class="el-icon-date"></i>考试记录</span>
          <div class="comBottom">
            <el-row>
              <el-col :span="11">
                    按试卷名称搜索：
                <el-input placeholder="请输入试卷名" v-model="papername" clearable prefix-icon="el-icon-search"  size="small" style="width:70%">  </el-input>
              </el-col>
              <el-col :span="5">
                    按年级搜索：
                <el-input placeholder="数字" v-model.number="papergrade" clearable prefix-icon="el-icon-search"  size="small" style="width:40%">  </el-input>
              </el-col>
              <el-col :span="5">
                    按班级搜索：
                <el-input placeholder="数字" v-model.number="paperclass" clearable prefix-icon="el-icon-search"  size="small" style="width:40%">  </el-input>
              </el-col>
              <el-col :span="3">
                <el-button type="primary" size="small" @click="searchPaper">搜索</el-button>
              </el-col>
            </el-row>

          </div>
          <el-table :data="tableData" height="420" border v-loading="loading" element-loading-text="数据加载中，请稍等" style="width: 100%;margin-bottom:10px;" :default-sort = "{prop: 'startTime', order: 'descending'}">
            <el-table-column prop="startTime" label="考试时间" width="180"  sortable><template slot-scope="props">
                <span>{{ new Date(props.row.startTime).toLocaleString()}}</span>
              </template></el-table-column>
            <el-table-column prop="examgrade" label="考试年级" width="80"> </el-table-column>
            <el-table-column prop="examclass" label="考试班级" width="80"> </el-table-column>
            <el-table-column prop="name" label="试卷名称" > </el-table-column>
            <el-table-column prop="totalPoints" label="试卷总分" width="80"> </el-table-column>
            <el-table-column prop="time" label="考试时长" width="80"> </el-table-column>
            <el-table-column label="操作" width="100">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  @click="handleLook(scope.row)">查看成绩</el-button>
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

<el-dialog title="考试成绩" :visible.sync="dialogTableVisible">
    <el-button type="primary" size="small" @click="confirmEXport" style="margin-bottom:10px;">导出成绩</el-button>
  <el-table :data="gradeTable" stripe :default-sort = "{prop: `score`, order: 'descending'}" element-loading-text="数据加载中，请稍等" v-loading="gradeLoading" >
    <el-table-column type="index">
    </el-table-column>
     <el-table-column property="userId" label="学号"></el-table-column>
    <el-table-column property="name" label="姓名"></el-table-column>
    <el-table-column property="score" sortable label="成绩">
    </el-table-column>
  </el-table>

</el-dialog>

</div>
</template>

<script>
export default {
  data() {
    return {
      papername: "", //搜索的试卷名
      papergrade: "", //搜索的年级
      paperclass: "", //搜索的班级名
      userId: "",
      tableData: [],
      loading: true,

      currentPage: 1, //当前页码
      pageSize: 10000, //每页条数,初始化为10000
      pageTotal: 0, //总条数

      dialogTableVisible: false,
      gradeTable: [],
      gradeLoading: false
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
        .get("/api/tgetScorePaper", {
          params: {
            userId: this.userId,
            name: this.papername,
            pageNumber: this.currentPage,
            pageSize: this.pageSize,
            grade: this.papergrade,
            class: this.paperclass,
            status: 2
          }
        })
        .then(response => {
          let res = response.data;
          this.pageSize = this.pageSize === 10000 ? res.total : this.pageSize;
          this.pageTotal = this.pageTotal === 0 ? res.total : this.pageTotal;
          if (res.msg == "success" && res.status == "0") {
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
    /**
     * 查看成绩
     */
    handleLook(row) {
      this.dialogTableVisible = true;
      this.gradeTable = [];
      this.gradeLoading = true;
      this.$axios
        .get("/api/tgetStudentScore", {
          params: {
            paperId: row._id,
            class: row.examclass,
            grade: row.examgrade
          }
        })
        .then(response => {
          let res = response.data;
          if (res.msg == "success" && res.status == "0") {
            res.result.forEach(item => {
              this.gradeTable.push({
                userId: item.userId,
                name: item.userName,
                score: item.exams[0].score
              });
            });
            if (this.gradeTable.length === 0) {
              this.$message({
                showClose: true,
                message: "没找到学生成绩！！！",
                type: "warning",
                duration: 1000
              });
            }
          } else {
            this.$message({
              showClose: true,
              message: "获取成绩失败，请稍后再试！",
              type: "error",
              duration: 1000
            });
          }
          this.gradeLoading = false;
        })
        .catch(err => {
          console.log(err);
          this.gradeLoading = false;
          this.$message({
            showClose: true,
            message: "获取成绩失败，请稍后再试！",
            type: "warning",
            duration: 1000
          });
        });
    },
    searchPaper() {
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
     * 导出成绩
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

      let excelData = [];
      let itemData = {};

      this.gradeTable.forEach(item => {
        excelData.push(item);
      });

      require.ensure([], () => {
        const { export_json_to_excel } = require("vendor/Export2Excel");
        const tHeader = [
          //导出的表头名
          "学号",
          "姓名",
          "分数"
        ];
        const filterVal = [
          // 导出的表头字段名
          "userId",
          "name",
          "score"
        ];
        const data = this.formatJson(filterVal, excelData);
        export_json_to_excel(
          tHeader,
          data,
          `成绩单_${new Date().toLocaleString()}`
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
</style>