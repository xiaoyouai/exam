<template>
<div>
                 <el-row>
                    <el-col :span="6">
                      <el-form label-width="100px" >
                        <el-form-item label="教师工号" prop="userId">
                          <span>{{userId}}</span>
                        </el-form-item>
                        <el-form-item label="姓名" prop="userName">
                          <el-input v-model="name" clearable></el-input>
                        </el-form-item>
                        <el-form-item label="原密码" prop="passWord">
                          <el-input v-model="password" clearable></el-input>
                        </el-form-item>
                        <el-form-item label="新密码" prop="passWord">
                          <el-input v-model="Npassword" clearable></el-input>
                        </el-form-item>
                        <el-form-item>
                          <el-button type="primary" @click="submit">立即修改</el-button>
                        </el-form-item>
                      </el-form>
                    </el-col>
                 </el-row>
</div>
</template>

<script>
export default {
  data() {
    return {
      userId: "",
      name: "",
      password: "",
      Npassword: ""
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.userId = this.$route.params.id;
    },
    submit() {
      //提交修改信息
      if (!this.name || !this.password || !this.Npassword) {
        this.$message({
          showClose: true,
          message: "请完整输入信息",
          type: "warning",
          duration: 2000
        });
        return;
      }
      this.$axios
        .post("/api/tchangeMsg", {
          user: {
            userName: this.name,
            userId: this.userId,
            password: this.Npassword //新密码
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
              duration: 2000
            });
            this.$mySessionStorage.set("currentUser", res.result, "json");
            this.$router.go(0);
          } else if (res.status == "2") {
            this.$message({
              showClose: true,
              message: "原密码不正确，请正确输入",
              type: "error",
              duration: 2000
            });
          }
        })
        .catch(err => {
          this.$message({
            showClose: true,
            message: "修改失败，请稍后再试！",
            type: "warning",
            duration: 2000
          });
        });
    }
  }
};
</script>
<style scoped>
</style>