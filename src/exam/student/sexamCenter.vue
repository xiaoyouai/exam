<template>
  <div>
  <s-header :userData="userData" @signout="signout" :active="activeItem"></s-header>
    <el-container>
      <el-main>
        <el-tabs type="border-card">
          <div class="comBottom">
            试卷名称：
            <el-input placeholder="请输入试卷名" v-model="searchTxt" clearable prefix-icon="el-icon-search"  size="small" style="width:30%">  </el-input>
             <el-button type="primary" size="small" @click="search">搜索</el-button>
          </div>
          <el-table
            :data="tableData"
            v-loading="loading"
            border
            height="370" style="width: 80%;margin:0 auto 20px;"
            :default-sort="{prop: 'startTime', order: 'descending'}"
          >
            <el-table-column prop="_paper.name" label="试卷名称"></el-table-column>
            <el-table-column prop="startTime" label="考试时间" sortable><i class="el-icon-time"></i></el-table-column>
            <el-table-column prop="date" label="考试总时长" sortable></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" @click="doExam(scope.row)">进入考试</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="block">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[6, 12, 20, 30]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="pageTotal">
            </el-pagination>
          </div>
        </el-tabs>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import sHeader from "./../../components/sHeader";
export default {
  components: {
    sHeader
  },
  data() {
    return {
      activeItem: "examCenter", //目前是处在哪一项
      userData: "",
      tableData: [],
      searchTxt: "",
      loading: true,

      currentPage: 1, //当前页码
      pageSize: 10000, //每页条数,初始化为10000
      pageTotal: 0 //总条数
    };
  },
  mounted() {
    this.getExamData();
  },
  methods: {
    getExamData() {
      this.loading = true;
      this.userData = this.$getUserData();
      this.$axios
        .get("/api/sexamLogs", {
          params: {
            userId: this.userData.userId,
            txt: this.searchTxt,
            pageNumber: this.currentPage,
            pageSize: this.pageSize
          }
        })
        .then(response => {
          let res = response.data;
          this.pageSize = this.pageSize === 10000 ? res.total : this.pageSize;
          this.pageTotal = this.pageTotal === 0 ? res.total : this.pageTotal;

          if (res.msg == "success" && res.status == "0") {
            // if (
            //   res.result.filter(item => item._paper).length === 0 &&
            //   this.tableData.length > 0
            // ) {
            //   this.$message({
            //     showClose: true,
            //     message: "未查询到该试卷！",
            //     type: "warning",
            //     duration: 1000
            //   });
            //   this.loading = false;
            //   return;
            // }

            this.tableData = res.result.filter(item => item._paper);
          }
          this.loading = false;
        })
        .catch(err => {
          this.$message({
            showClose: true,
            message: "获取考试记录失败，请稍后再试！",
            type: "warning",
            duration: 1000
          });
          this.loading = false;
        });
    },
    /**
     * 搜索试卷，需要考虑搜索时的分页情况
     */
    search() {
      this.currentPage = 1; //当前页码
      this.pageSize = 10000; //每页条数
      this.pageTotal = 0; //总条数
      this.getExamData();
    },
    /**
     * 分页
     */
    handleSizeChange(val) {
      this.pageSize = val;
      this.getExamData();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getExamData();
    },
    doExam(row) {
      this.$router.push({
        path: "/sdoExam/" + row._paper._id
      });
    },

    signout() {
      //退出登录
      this.$axios.get("/api/ssignout").then(response => {
        let res = response.data;
        if (res.msg == "success" && res.status == "0") {
          this.$mySessionStorage.del("currentUser");
          this.$router.push({ path: "/" });
        }
      });
    }
  }
};
</script>
<style scoped>
</style>
