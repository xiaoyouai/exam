<template>
    <el-container>
      <el-header>
        <el-row>
          <el-col :span="3"><div class="grid-content bg-purple"><img src="./../../../static/img/logo.png" width="73px"></div></el-col>
          <el-col :span="13" :offset="4"><div class="grid-content bg-purple">欢迎{{userData.userName}}老师</div></el-col>
          <el-col :span="4">
            <div class="grid-content bg-purple">
              <el-button type="danger" plain="" size="mini" @click="signout">
              退出
              </el-button>
            </div>
          </el-col>
  </el-row>

<!-- <el-button type="danger" size="mini">退出系统</el-button> -->

      </el-header>
      <el-container>
        <t-side :id="userData.userId"></t-side>
        <el-main >
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
</template>

<script>
import tSide from './../../components/tside'
export default {
  components:{
    tSide
  },
  data () {
    return {
      userData:''
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    init(){
      this.userData=this.$getUserData();
      this.$axios.post('/api/tmain',{userId:this.userData.userId}).then(response=>{
      let res = response.data;
        if(res.msg=='success'&&res.status=='0'){
          res=res.result;
        }
      })
    },
    signout(){//退出登录
      this.$axios.get('/api/tsignout').then(response=>{
      let res = response.data;
      if(res.msg=='success'&&res.status=='0'){
        this.$mySessionStorage.del('currentUser');
        this.$router.push({'path':'/tlogin'});
        }
      })
    }
  }
}

</script>
<style scoped>
.el-header{
  background-color: #355c7d;
  color: #fff;
  padding-top: 10px;
}
.el-container{
 height:100% !important;
}
</style>