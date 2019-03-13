<template>
<div>
   <el-container>
    <el-main>
          <span slot="label"><i class="el-icon-date"></i>考试记录</span>
          <div class="comBottom">
                    题目关键词：
                <el-input placeholder="请输入题目关键词" v-model="test" clearable prefix-icon="el-icon-search"  size="small" style="width:30%">  </el-input>
                <el-button type="primary" size="small">搜索</el-button>
          </div>
          <el-table :data="tableData" height="420" border  style="width: 100%" :default-sort = "{prop: 'date', order: 'descending'}" @selection-change="handleSelectionChange">
            <el-table-column type="expand">
                <template slot-scope="props">
                  <el-form label-position="left" inline class="demo-table-expand">
                    <el-form-item label="题目类型">
                      <span>{{ props.row.type }}</span>
                    </el-form-item>
                    <el-form-item label="题目分值">
                      <span>{{ props.row.grade }}</span>
                    </el-form-item>
                    <el-form-item label="题目答案">
                      <span>{{ props.row.answer }}</span>
                    </el-form-item>
                    <el-form-item label="题目">
                      <span>{{ props.row.name }}</span>
                    </el-form-item>
                  </el-form>
                </template>
            </el-table-column>
            <el-table-column type="selection"> </el-table-column>
            <el-table-column prop="type" label="题目类型" > </el-table-column>
            <!-- <el-table-column prop="descrip" label="题目"></el-table-column> -->
            <el-table-column label="题目" >
              <template slot-scope="props">
                <span v-if="props.row.name.length<12">{{props.row.name}}</span>
                <span v-else>行首下拉查看详情</span>
              </template>
            </el-table-column>
            <el-table-column label="题目答案" >
              <template slot-scope="props">
                <span v-if="props.row.answer.length<10">{{props.row.answer}}</span>
                <span v-else>行首下拉查看详情</span>
              </template>
            </el-table-column>
            <el-table-column prop="grade" label="题目分值" > </el-table-column>
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
          type: '选择题',
          name: 'Python下有许多款不同的 Web 框架。Django是重量级选手中最有代表性的一位。许多成功的网站和APP都基于Django。Django是一个开放源代码的Web应用框架，由Python写成。Django遵守BSD版权，初次发布于2005年7月, 并于2008年9月发布了第一个正式版本1.0 Django采用了MVC的软件设计模式，即模型M，视图V和控制器CPython下有许多款不同的 Web 框架。Django是重量级选手中最有代表性的一位。许多成功的网站和APP都基于Django。Django是一个开放源代码的Web应用框架，由Python写成。Django遵守BSD版权，初次发布于2005年7月, 并于2008年9月发布了第一个正式版本1.0 Django采用了MVC的软件设计模式，即模型M，视图V和控制器C',
          grade: 69,
          answer:'A'
        }, {
          type: '选择题',
          name: '王小虎',
          grade: 79,
          answer:'A',
          descrip:'行首下拉查看详情'
        }, {
          type: '选择题',
          name: '王小虎',
          grade: 89,
          answer:'A'
        }, {
          type: '选择题',
          name: '王小虎',
          grade: 63,
          answer:'A',
          descrip:'行首下拉查看详情'
        }, {
          type: '选择题',
          name: '王小虎',
          grade: 80,
          answer:'A'
        }, {
          type: '选择题',
          name: '王小虎',
          grade: 76,
          answer:'A'
        }, {
          type: '选择题',
          name: '王小虎',
          grade: 92,
          answer:'A'
        }]
    }
  },

  methods: {
     handleSelectionChange(val) {
        this.multipleSelection = val;
      }
  }
}

</script>
<style scoped>
  .demo-table-expand {
    font-size: 0;
  }
  .demo-table-expand label {
    width: 90px;
  }
  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 33.3%; color: #0a2f5f;
  }
  .demo-table-expand .el-form-item:last-child{
    width: 100%;
  }
</style>