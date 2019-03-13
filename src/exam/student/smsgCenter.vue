<template>
<div>
  <s-header :userData="userData" @signout="signout"></s-header>
  <el-container>
    <el-main>
<el-tabs type="border-card">
        <el-tab-pane>
          <span slot="label"><i class="el-icon-date"></i>考试记录</span>
          <div class="comBottom">
            试卷名称：
            <el-input placeholder="请输入试卷名" v-model="test" clearable prefix-icon="el-icon-search"  size="small" style="width:30%">  </el-input>
             <el-button type="primary" size="small">搜索</el-button>
          </div>
          <el-table :data="tableData" height="360" border  style="width: 100%" :default-sort = "{prop: 'date', order: 'descending'}">
            <el-table-column prop="date" label="考试日期" sortable> </el-table-column>
            <el-table-column prop="name" label="试卷名称" > </el-table-column>
            <el-table-column prop="grade" label="考试成绩" sortable> </el-table-column>
          </el-table>
        </el-tab-pane>
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
      </el-tabs>
    </el-main>
  </el-container>
</div>
</template>

<script>
import sHeader from './../../components/sHeader'
export default {
  components:{
    sHeader
  },
  mounted() {
    this.init();
  },
  data () {
    return {
      password:'',
      Npassword:'',//新密
      userData:'',
      test:'',
      tableData: [{
        date: '2016-05-03',
        name: '王小虎',
        grade: 69
      }, {
        date: '2016-05-02',
        name: '王小虎',
        grade: 79
      }, {
        date: '2016-05-04',
        name: '王小虎',
        grade: 89
      }, {
        date: '2016-05-01',
        name: '王小虎',
        grade: 63
      }, {
        date: '2016-05-08',
        name: '王小虎',
        grade: 80
      }, {
        date: '2016-05-06',
        name: '王小虎',
        grade: 76
      }, {
        date: '2016-05-07',
        name: '王小虎',
        grade: 92
      }]
    }
  },

  methods: {
    init(){
      this.userData=this.$getUserData();
      this.$axios.post('/api/smain',{userId:this.userData.userId}).then(response=>{
      let res = response.data;
        if(res.msg=='success'&&res.status=='0'){
          this.test=res.result;
        }
      })
    },
    submit(){//提交修改信息
      if(!this.userData.userName||!this.userData.class||!this.userData.grade||!this.password||!this.Npassword||!/^[0-9]*$/.test(this.userData.class)||!/^[0-9]*$/.test(this.userData.grade)){
        this.$message({
          showClose: true,
          message: '请正确输入信息',
          type: 'warning',
          duration:2000
        });
        return ;
      }
      this.$axios.post('/api/schangeMsg',{
        user:{
          userName:this.userData.userName,
          password:this.Npassword,//新密码
          class:this.userData.class,
          userId:this.userData.userId,
          grade:this.userData.grade
        },
        password:this.password
      }).then(response=>{
        let res = response.data;
        if(res.msg=='success'&&res.status=='0'){
          this.$message({
            showClose: true,
            message: '修改成功',
            type: 'success',
            duration:2000
          });
        this.$mySessionStorage.set('currentUser',this.userData,'json');
        }else if(res.status=='2'){
          this.$message({
            showClose: true,
            message: '原密码不正确，请正确输入',
            type: 'error',
            duration:2000
          });
        }
      }).catch(err => {
          this.$message({
            showClose: true,
            message: '修改失败，请稍后再试！',
            type: 'warning',
            duration:2000
          });
        })
    },
    signout(){//退出登录
      this.$axios.get('/api/ssignout').then(response=>{
      let res = response.data;
      if(res.msg=='success'&&res.status=='0'){
        this.$mySessionStorage.del('currentUser');
        this.$router.push({'path':'/'});
        }
      })
    }
  }
}

</script>
<style scoped>

</style>