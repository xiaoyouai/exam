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
            element-loading-text="数据加载中，请稍等"
            border
            height="370" style="width: 80%;margin:0 auto 20px;"
            :default-sort="{prop: 'startTime', order: 'descending'}"
          >
            <el-table-column prop="_paper.name" label="试卷名称"></el-table-column>
            <el-table-column prop="startTime"  label="考试日期" sortable>
              <template slot-scope="props">
                <span>{{ new Date(props.row.startTime).toLocaleString()}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="date" label="考试总时长(分钟)" sortable></el-table-column>
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
              :page-sizes="[pageTotal,6, 12, 20, 30]"
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
    /**
     *  获取总页数
     */
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

            this.tableData = res.result.filter(
              item =>
                item._paper &&
                this.isTimeOk(item.startTime, item.date) &&
                (item.examStatus === 0 ||
                  item.examStatus === 3 ||
                  item.examStatus === 4)
            ); //时间设置为考试前一天或者开考后的考试总时长内
            this.pageSize =
              this.pageSize === 10000 ? this.tableData.length : this.pageSize;
            this.pageTotal =
              this.pageTotal === 0 ? this.tableData.length : this.pageTotal;
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
    isTimeOk(time, totalTime) {
      let ok = false;
      if (
        (new Date(time) - new Date()) / 60000 > 0 &&
        (new Date(time) - new Date()) / 60000 <= 1440
      ) {
        ok = true; //时间设置为考试前一天0-24小时
      } else if (
        (new Date() - new Date(time)) / 60000 >= 0 &&
        (new Date() - new Date(time)) / 60000 <= totalTime
      ) {
        ok = true; //时间设置为开考后的考试总时长内0-考试时间内
      }
      return ok;
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
      if ((new Date() - new Date(row.startTime)) / 60000 >= 0) {
        this.$router.push({
          path: "/sdoExam/" + row._paper._id
        });
      } else {
        this.$message({
          showClose: true,
          message: "未到考试时间，无法进入考试",
          type: "error",
          duration: 1000
        });
      }
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
