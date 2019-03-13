<template>
<div>
  <s-header :userId="userId" :name="name" :mygrade="mygrade" :myclass="myclass"></s-header>
  <el-container>
    <el-main>

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
  data () {
    return {
    }
  },

  methods: {}
}

</script>
<style scoped>
</style>