<template>
  <div>
   <el-container>
    <el-header class="comBottom header">
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
            <router-link to="/sexamCenter" class="href height"  :class="{red:activeTest}">
             考试中心
            </router-link>
           </div>
          </el-col>
          <el-col :span="8">
           <div class="grid-content bg-purple">
            <router-link to="/smsgCenter" class="href height"  :class="{red:activeMsg}">
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
  props: ["userData", "active"],
  data() {
    return {
      activeTest: this.active === "examCenter",
      activeMsg: this.active === "msgCenter"
    };
  },

  methods: {
    out() {
      this.$emit("signout");
    }
  }
};
</script>
<style scoped>
.header {
  height: 28px !important;
  padding-top: 20px;
}
.red {
  color: #409eff;
  border: 1px solid #409eff;
  padding: 2px 5px;
  border-radius: 4px;
}
.height {
  line-height: 27.64px;
}
</style>