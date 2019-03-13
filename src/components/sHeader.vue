<template>
  <div>
   <el-container>
    <el-header class="comBottom">
     <p>欢迎来到考试系统</p>
     <el-row>
      <el-col :span="8">
       <div class="grid-content bg-purple">
        <el-row>
         <el-col :span="6">
          <div class="grid-content bg-purple">
           {{userData.userName}}同学
          </div>
         </el-col>
         <el-col :span="6">
          <div class="grid-content bg-purple-light">
           学号：{{userData.userId}}
          </div>
         </el-col>
         <el-col :span="6">
          <div class="grid-content bg-purple">
            年级：{{userData.grade}}
          </div>
         </el-col>
         <el-col :span="6">
          <div class="grid-content bg-purple-light">
           班级：{{userData.class}}班
          </div>
         </el-col>
        </el-row>
       </div>
      </el-col>
      <el-col :span="4" :offset="12">
       <div class="grid-content bg-purple-light">
        <div class="grid-content bg-purple">
         <el-row>
          <el-col :span="8">
           <div class="grid-content bg-purple">
            <router-link to="/sexam" class="href">
             考试中心
            </router-link>
           </div>
          </el-col>
          <el-col :span="8">
           <div class="grid-content bg-purple">
            <router-link to="/smsgCenter" class="href">
             个人中心
            </router-link>
           </div>
          </el-col>
          <el-col :span="8">
           <div class="grid-content bg-purple">
            <el-button type="danger" plain="" size="mini" @click="out()">
             退出
            </el-button>
           </div>
          </el-col>
         </el-row>
        </div>
       </div>
      </el-col>
     </el-row>
    </el-header>
   </el-container>
  </div>
</template>

<script>
export default {
  props:['userData'],
  data () {
    return {
    }
  },

  methods: {
    out(){
      this.$emit('signout');
    }
  }
}

</script>
<style scoped>

</style>