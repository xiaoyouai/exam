<template>
<div>
   <el-container>
    <el-main>
          <span slot="label"><i class="el-icon-date"></i>考试记录</span>
          <div class="comBottom">
                    试卷名称：
                <el-input placeholder="请输入试卷名" v-model="test" clearable prefix-icon="el-icon-search"  size="small" style="width:30%">  </el-input>
                <el-button type="primary" size="small">搜索</el-button>
          </div>
          <el-table v-loading="loading" :data="tableData" height="420" border  style="width: 100%" :default-sort = "{prop: 'date', order: 'descending'}">
            <el-table-column prop="date" label="考试日期" sortable> </el-table-column>
            <el-table-column prop="name" label="试卷名称" > </el-table-column>
            <el-table-column prop="grade" label="试卷总分"> </el-table-column>
            <el-table-column prop="time" label="考试时长"> </el-table-column>
            <el-table-column prop="num" label="考试人数"> </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  @click="handleEdit(scope.$index, scope.row)">阅卷</el-button>
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
      userId:150920,
      mygrade:1,
      test:'',
        tableData: [{
          date: '2016-05-03',
          name: '王小虎',
          grade: 69,
          time:120,
          num:50
        }, {
          date: '2016-05-02',
          name: '王小虎',
          grade: 79,
          time:120,
          num:50
        }, {
          date: '2016-05-04',
          name: '王小虎',
          grade: 89,
          time:120,
          num:50
        }, {
          date: '2016-05-01',
          name: '王小虎',
          grade: 63,
          time:120,
          num:50
        }, {
          date: '2016-05-08',
          name: '王小虎',
          grade: 80,
          time:120,
          num:50
        }, {
          date: '2016-05-06',
          name: '王小虎',
          grade: 76,
          time:120,
          num:50
        }, {
          date: '2016-05-07',
          name: '王小虎',
          grade: 92,
          time:120,
          num:50
        }]
    }
  },

  methods: {
      handleEdit(index, row) {
        console.log(index, row);
      }

  }
}

</script>
<style scoped>
</style>