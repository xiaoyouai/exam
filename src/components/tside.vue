<template>
<div class="sidebar">
      <el-aside width="200px">
        <el-row class="tac"
          <el-col>
            <!-- <h5>自定义颜色</h5> -->
            <!-- :default-active="$route.path" -->
            <el-menu
              router
              class="el-menu-vertical-demo"
              background-color="#355c7d"
              text-color="#fff"
              active-text-color="#2f9395">
              <el-menu-item :index="'/tmain/tmypaper/'+id">
                <i class="fa-icon fa 	fa fa-folder-o"></i>&nbsp;&nbsp;
                <span slot="title">我的试卷</span>
              </el-menu-item>
              <el-menu-item :index="'/tmain/tscoreList/'+id">
                <i class="el-icon-edit-outline"></i>
                <span slot="title">试卷打分</span>
              </el-menu-item>
              <el-menu-item :index="'/tmain/tgradeMan/'+id">
                <i class="fa-icon fa 	fa-gear"></i>&nbsp;&nbsp;
                <span slot="title">成绩查看</span>
              </el-menu-item>
              <el-menu-item :index="'/tmain/tquestionHub/'+id">
                <i class="fa-icon fa fa-tag"></i>&nbsp;&nbsp;
                <span slot="title">我的题库</span>
              </el-menu-item>
              <el-menu-item :index="'/tmain/tcomQuestionHub/'+id">
                <i class="fa-icon fa fa-tags"></i>&nbsp;&nbsp;
                <span slot="title">公共题库</span>
              </el-menu-item>
              <el-menu-item :index="'/tmain/tmodifyMsg/'+id">
                <i class="el-icon-edit-outline"></i>
                <span slot="title">修改信息</span>
              </el-menu-item>
            </el-menu>
          </el-col>
        </el-row>
      </el-aside>
</div>
</template>

<script>
export default {
  props: ["id"],
  data() {
    return {};
  },

  methods: {}
};
</script>
<style scoped>
</style>