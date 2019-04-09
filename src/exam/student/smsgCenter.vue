<template>
<div>
  <s-header :userData="userData" @signout="signout" :active="activeItem"></s-header>
  <el-container>
    <el-main>
      <el-tabs type="border-card">
        <el-tab-pane>
          <span slot="label"><i class="el-icon-date"></i>考试记录</span>
          <div class="comBottom">
            试卷名称：
            <el-input placeholder="请输入试卷名" v-model="searchTxt" clearable prefix-icon="el-icon-search"  size="small" style="width:30%" @click="search">  </el-input>
             <el-button type="primary" size="small" @click="search">搜索</el-button>
          </div>
          <el-table :data="tableData" border v-loading="loading" height="370" style="width: 80%;margin:0 auto 20px;" :default-sort = "{prop: 'startTime', order: 'descending'}">
            <el-table-column prop="_paper.name" label="试卷名称" > </el-table-column>
            <el-table-column prop="startTime"  label="考试日期" sortable>
              <template slot-scope="props">
                <span>{{ new Date(props.row.startTime).toLocaleString()}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="date" label="考试时长" sortable> </el-table-column>
            <el-table-column prop="score" label="考试成绩" sortable> </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  @click="lookExam(scope.row)">查看该考试</el-button>
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
        </el-tab-pane>
        <!-- 修改信息-->
        <el-tab-pane label="修改信息">
             <el-row>
                <el-col :span="6">
                  <el-form label-width="100px" >
                    <el-form-item label="姓名">
                      <el-input v-model="userData.userName"></el-input>
                    </el-form-item>
                    <el-form-item label="年级">
                      <el-input v-model="userData.grade"></el-input>
                    </el-form-item>
                    <el-form-item label="班级">
                      <el-input v-model="userData.class"></el-input>
                    </el-form-item>
                    <el-form-item label="原密码">
                      <el-input v-model="password" clearable></el-input>
                    </el-form-item>
                    <el-form-item label="新密码">
                      <el-input v-model="Npassword" clearable></el-input>
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="submit">立即修改</el-button>
                    </el-form-item>
                  </el-form>
                </el-col>
              </el-row>
        </el-tab-pane>
        <!-- 修改信息 -->

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
  mounted() {
    // this.getExamTotal();
    this.getExamData();
  },
  data() {
    return {
      activeItem: "msgCenter", //目前是处在哪一项
      password: "",
      Npassword: "", //新密
      userData: "",
      searchTxt: "",
      tableData: [],
      loading: true,

      currentPage: 1, //当前页码
      pageSize: 10000, //每页条数,初始化为10000
      pageTotal: 0 //总条数
    };
  },

  methods: {
    /**
     *  获取数据
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
            this.tableData = res.result.filter(
              item => item._paper && item.isSure === 2
            );
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
    lookExam(row) {
      this.$router.push({
        path: "/sexamRecord/" + row._paper._id
      });
    },
    submit() {
      //提交修改信息
      if (
        !this.userData.userName ||
        !this.userData.class ||
        !this.userData.grade ||
        !this.password ||
        !this.Npassword ||
        !/^[0-9]*$/.test(this.userData.class) ||
        !/^[0-9]*$/.test(this.userData.grade)
      ) {
        this.$message({
          showClose: true,
          message: "请正确输入信息",
          type: "warning",
          duration: 1000
        });
        return;
      }
      this.$axios
        .post("/api/schangeMsg", {
          user: {
            userName: this.userData.userName,
            password: this.Npassword, //新密码
            class: this.userData.class,
            userId: this.userData.userId,
            grade: this.userData.grade
          },
          password: this.password
        })
        .then(response => {
          let res = response.data;
          if (res.msg == "success" && res.status == "0") {
            this.$message({
              showClose: true,
              message: "修改成功",
              type: "success",
              duration: 1000
            });
            this.$mySessionStorage.set("currentUser", this.userData, "json");
          } else if (res.status == "2") {
            this.$message({
              showClose: true,
              message: "原密码不正确，请正确输入",
              type: "error",
              duration: 1000
            });
          }
        })
        .catch(err => {
          this.$message({
            showClose: true,
            message: "修改失败，请稍后再试！",
            type: "warning",
            duration: 1000
          });
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