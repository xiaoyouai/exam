<template>
<div style="height:100%">
    <el-container>
      <el-header><img src="../../../static/img/logo.png">教师注册</el-header>
      <el-main>
        <el-row>
          <el-col :span="6" :offset="8">
            <el-form :model="user" :rules="rules" ref="user" label-width="100px" class="demo-ruleForm">
                  <el-form-item prop="userId" label="教师工号：">
                    <el-input placeholder="请输入教师工号" v-model="user.userId" clearable></el-input>
                  </el-form-item>
                  <el-form-item prop="userName" label="姓名：">
                    <el-input v-model="user.userName" placeholder="请输入姓名"  clearable></el-input>
                  </el-form-item>
                  <el-form-item prop="password" label="密码：">
                    <el-input placeholder="请输入密码" v-model="user.password" clearable></el-input>
                  </el-form-item>

              <el-form-item>
                    <el-button type="primary" @click="submit(user)">注册</el-button>
              </el-form-item>
            </el-form>
          </el-col>
        </el-row><br>
         <div>
        <router-link to="/tlogin" class="href hrefright">去登录</router-link>
      </div>
      </el-main>

    </el-container>


  </div>

  </template>

  <script>
export default {
  data () {
         var checkuserId= (rule, value, callback) => {
            if (value==="") {
              return callback(new Error('工号不能为空'));
            }else{    callback();}};
         var  checkuserName=  (rule, value, callback) => {
            if (value==="") {
              return callback(new Error('姓名不能为空'));
            }else{    callback();}};
         var checkpassword=  (rule, value, callback) => {
            if (value==="") {
              return callback(new Error('密码不能为空'));
            }else{    callback();}};
      return {
        user:{
          "userId" : '',
          "userName" : "",
          "password" : "",
          },
        rules: {
              userName: [
                { validator: checkuserName,trigger: 'blur',required:true },
                 {min: 2, max: 5, message: '长度在 2 到 5 个字符'}
              ],
              password: [
                { validator: checkpassword, trigger: 'blur',required:true },
                {min: 2, max: 5, message: '长度在 2 到 5 个字符'},
               { pattern: /^[A-Za-z0-9]+$/, message: '必须为是字母或者数字'}],
              userId:[
                {validator: checkuserId, trigger: 'blur',required:true },
                { pattern: /^[0-9]+$/, message: '工号必须为数字值'}]
        }
    }
  },
  methods: {
    submit(user){
        this.$refs.user.validate((valid) => {
          if (valid) {
              this.$axios.post('/api/tregister',{
                user:this.user
              }).then(response=>{
                      let res = response.data;
                      if(res.msg=='success'&&res.status=='0'){
                        this.$message({
                            showClose: true,
                            message: '注册成功',
                            type: 'success',
                            duration:1000
                          });
                          this.$router.push({path:'/tlogin'})
                      }else if(res.msg=='用户已存在'&&res.status=='2'){
                        this.$message({
                          showClose: true,
                          message: '注册失败,用户已存在',
                          type: 'error',
                              duration:2000
                            });
                      }else{
                          this.$message({
                            showClose: true,
                            message: '注册失败,请检查格式',
                            type: 'error',
                                duration:2000
                              });
                      }
              }).catch(err => {
                  this.$message({
                    showClose: true,
                    message: '注册失败，请稍后再试！',
                    type: 'warning',
                    duration:2000
                  });
                });
        } else {
            this.$message({
            showClose: true,
            message: '请正确填写信息！',
            type: 'warning',
            duration:2000
          });
        }
    })}
  }
}

  </script>
  <style scoped>
.el-header {
    font-family: '微软雅黑';
    font-size: 28px;
    color:#A569BD;
    width: 16%;
    margin: 90px 0px 0px 49%;
    text-align: center;
    line-height: 60px;
    position: relative;
  }
.el-header img {
  width: 60px;
  height: 60px;
  position: absolute;
  left: -110px;
}

.el-container {
  height: 100%;
  background: url("../../../static/img/bg4.jpg");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  padding-bottom: 40px;
}
    .el-input{
      width: 300px;
    }
    .el-button{
      width: 300px;
    }

  </style>