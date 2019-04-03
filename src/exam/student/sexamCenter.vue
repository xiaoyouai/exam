<template>
  <div>
    <s-header :userId="userId" :name="name" :mygrade="mygrade" :myclass="myclass"></s-header>
    <el-container>
      <el-main>
        <h1>可以参加的考试</h1>
        <el-table
          :data="tableData"
          height="360"
          border
          style="width: 100%"
          :default-sort="{prop: 'startTime', order: 'descending'}"
        >
          <el-table-column prop="_paper.name" label="试卷名称"></el-table-column>
          <el-table-column prop="startTime" label="考试时间" sortable></el-table-column>
          <el-table-column prop="time" label="考试总时长" sortable></el-table-column>
          <el-table-column prop="grade" label="考试成绩" sortable></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button size="mini" @click="handleEdit(scope.row)">进入考试</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import sHeader from "./../../components/sHeader";
export default {
  components: {
    sHeader
  },
  data() {
    return {
      tableData: []
    };
  },

  methods: {
    handleEdit(row) {
      //表格的编辑按钮，跳转去修改试卷
      // let now = new Date();
      // if (now - new Date(row.startTime) > 0) {
      //   this.$message({
      //     showClose: true,
      //     message: "已开考或正在考试，无法修改",
      //     type: "warning",
      //     duration: 2000
      //   });
      //   return;
      // }
      // if (now - new Date(row.startTime))
      this.$router.push({
        path: "/tmain/taddpaper/" + row._id + "/" + this.userId
      });
    }
  }
};
</script>
<style scoped>
</style>
