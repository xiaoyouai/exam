<template>
<div>
   <el-container>
    <el-main>
          <span slot="label"><i class="el-icon-date"></i>考试记录</span>
          <div class="comBottom">
            <el-row>
              <el-col :span="20">
                    试卷名称：
                <el-input placeholder="请输入试卷名" v-model="test" clearable prefix-icon="el-icon-search"  size="small" style="width:30%">  </el-input>
                <el-button type="primary" size="small">搜索</el-button>
              </el-col>
              <el-col :span="4">
                <el-row>
                  <router-link :to="'/tmain/taddPaper/1/'+userId"><el-col :span="12"><el-button type="primary" size="small">新增试卷</el-button></el-col></router-link>
                  <!-- <router-link :to="{path:'tamin/taddPaper',params:{'userId':userId}}"><el-col :span="12"><el-button type="primary" size="small">新增试卷</el-button></el-col></router-link> -->
                  <el-col :span="12"><el-button type="danger" size="small">批量删除</el-button></el-col>
                </el-row>
              </el-col>
            </el-row>

          </div>
          <el-table :data="tableData" height="420" border  style="width: 100%" :default-sort = "{prop: 'date', order: 'descending'}" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55"> </el-table-column>
            <el-table-column prop="date" label="考试日期" sortable> </el-table-column>
            <el-table-column prop="name" label="试卷名称" > </el-table-column>
            <el-table-column prop="grade" label="试卷总分"> </el-table-column>
            <el-table-column prop="time" label="考试时长"> </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  @click="handleDelete(scope.$index, scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
    </el-main>
  </el-container>

</div>
</template>

<script>
export default {
  data () {
    return {
       name:'小明',
      password:'',
      myclass:1,
      userId:'',
      mygrade:1,
      test:'',
        tableData: [{
          date: '2016-05-03',
          name: '王小虎',
          grade: 69,
          time:120
        }, {
          date: '2016-05-02',
          name: '王小虎',
          grade: 79,
          time:120
        }, {
          date: '2016-05-04',
          name: '王小虎',
          grade: 89,
          time:120
        }, {
          date: '2016-05-01',
          name: '王小虎',
          grade: 63,
          time:120
        }, {
          date: '2016-05-08',
          name: '王小虎',
          grade: 80,
          time:120
        }, {
          date: '2016-05-06',
          name: '王小虎',
          grade: 76,
          time:120
        }, {
          date: '2016-05-07',
          name: '王小虎',
          grade: 92,
          time:120
        }]
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    init(){
         this.userId=this.$route.params.id;
    },
     handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      handleEdit(index, row) {
        console.log(index, row);
      },
      handleDelete(index, row) {
        console.log(index, row);
      }

  }
}

</script>
<style scoped>
</style>