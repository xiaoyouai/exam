<template>
<div>
  <el-container>
    <el-header>教师登录</el-header>
    <el-main>
      <el-input placeholder="请输入教师工号" v-model="userId" clearable></el-input><br><br>
      <el-input placeholder="请输入密码" v-model="pwd" clearable></el-input><br><br>
      <el-button type="primary" plain @click="login">登录</el-button>
    </el-main>
    <div>
      <router-link to="/" class="href hrefleft">学生登录</router-link>
      <router-link to="/tregister" class="href">教师注册</router-link>
    </div>
  </el-container>
</div>

</template>

<script>
export default {
  data () {
    return {
      userId:'',
      pwd:''
    }
  },

  methods: {
    login(){
      if(!this.userId||!this.pwd){
        this.$message({
          showClose: true,
          message: '请完整输入用户名和密码',
          type: 'warning',
          duration:2000
        });
        return ;
      }
      this.$axios.post('/api/tlogin',{
        userId:this.userId,
        password:this.pwd
      }).then(response=>{
          let res = response.data;
          if(res.msg=='success'&&res.status=='0'){
            this.$mySessionStorage.set('currentUser',res.result,'json');
            this.$router.push({path:'/tmain/tmypaper/'+this.userId})
          }else{
            this.$message({
              showClose: true,
              message: '请输入正确的用户名和密码',
              type: 'error',
              duration:2000
            });
          }
      }).catch(err => {
          this.$message({
            showClose: true,
            message: '登录失败，请稍后再试！',
            type: 'warning',
            duration:2000
          });
        })
    }
  }
}

</script>
<style scoped>
  .el-header {
    background-color: #409EFF;
    color: #fff;
    text-align: center;
    line-height: 60px;
  }

   .el-container {
    margin-bottom: 40px;
  }
  .el-input{
    width: 300px;
  }
  .el-button{
    width: 300px;
  }

</style>