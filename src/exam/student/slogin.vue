
<template>
<div style="height:100%">
  <el-container>
    <el-header><img src="../../../static/img/logo.png">学生登录</el-header>
    <el-main>
      <el-input placeholder="请输入学号" v-model="userId" clearable></el-input><br><br>
      <el-input placeholder="请输入密码" v-model="pwd" type="password" clearable></el-input><br><br>
      <el-button type="primary" plain @click="login">登录</el-button><br><br>
      <div>
      <router-link to="/sregister" class="href hrefleft">学生注册</router-link>
      <router-link to="/tlogin" class="href">教师登录</router-link>
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
          message: "请完整输入学号和密码",
          type: "warning",
          duration: 2000
        });
        return;
      }
      this.$axios
        .post("/api/slogin", {
          userId: this.userId,
          password: this.pwd
        })
        .then(response => {
          let res = response.data;
          if (res.msg == "success" && res.status == "0") {
            this.$mySessionStorage.set("currentUser", res.result, "json");
            this.$router.push({ path: "/smsgCenter" });
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
.el-container {
  height: 100%;
  background: url("../../../static/img/bg3.jpg");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  padding-bottom: 40px;
}
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
  left: -138px;
}

.el-input {
  width: 300px;
}
.el-button {
  width: 300px;
}
.el-notification.right {
  right: 534px;
}
</style>
