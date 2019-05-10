<template>
<div style="height:100%">
  <el-container>
    <el-header><img src="../../../static/img/logo.png">教师登录</el-header>
    <el-main>
      <el-input placeholder="请输入教师工号" v-model="userId" clearable></el-input><br><br>
      <el-input placeholder="请输入密码" type="password" v-model="pwd" ></el-input><br><br>
      <el-button type="primary" plain @click="login">登录</el-button><br><br>
      <div>
      <router-link to="/" class="href hrefleft">学生登录</router-link>
      <router-link to="/tregister" class="href">教师注册</router-link>
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
      pwd: ""
    };
  },

  methods: {
    login() {
      if (!this.userId || !this.pwd) {
        this.$message({
          showClose: true,
          message: "请完整输入工号和密码",
          type: "warning",
          duration: 2000
        });
        return;
      }
      this.$axios
        .post("/api/tlogin", {
          userId: this.userId,
          password: this.pwd
        })
        .then(response => {
          let res = response.data;
          if (res.msg == "success" && res.status == "0") {
            this.$mySessionStorage.set("currentUser", res.result, "json");
            this.$router.push({ path: "/tmain/tmypaper/" + this.userId });
          } else if (res.status == "2") {
            this.$message({
              showClose: true,
              message: "您还没有注册，请先注册",
              type: "error",
              duration: 2000
            });
          } else {
            this.$message({
              showClose: true,
              message: "请输入正确的密码",
              type: "error",
              duration: 2000
            });
          }
        })
        .catch(err => {
          this.$message({
            showClose: true,
            message: "登录失败，请稍后再试！",
            type: "warning",
            duration: 2000
          });
        });
    }
  }
};
</script>
<style scoped>
.el-header {
  font-family: "微软雅黑";
  font-size: 28px;
  color: #a569bd;
  width: 16%;
  margin: 150px 0px 0px 49%;
  text-align: center;
  line-height: 60px;
  position: relative;
}
.el-header img {
  width: 60px;
  height: 60px;
  position: absolute;
  left: -130px;
}

.el-container {
  height: 100%;
  background: url("../../../static/img/bg4.jpg");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  padding-bottom: 40px;
}
.el-input {
  width: 300px;
}
.el-button {
  width: 300px;
}
</style>