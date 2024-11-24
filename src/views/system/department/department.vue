<template>
  <el-main>
    <!-- 查询条件 -->
    <el-form
      ref="searchForm"
      label-width="80px"
      :inline="true"
      size="small"
    >
      <el-form-item>
        <el-input placeholder="请输入部门名称" v-model="searchModel.departmentName"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="search()">查询</el-button>
        <el-button icon="el-icon-refresh-right" @click="resetValue()">重置</el-button>
        <el-button type="success" icon="el-icon-plus">新增</el-button>
      </el-form-item>
    </el-form>
    <!-- 数据表格 -->
    <el-table
      :data="tableData"
      border
      stripe
      style="width: 100%; margin-bottom: 20px"
      row-key="id"
      default-expand-all
      :tree-props="{ children: 'children' }"
    >
      <el-table-column prop="departmentName" label="部门名称"></el-table-column>
      <el-table-column prop="parentName" label="所属部门"></el-table-column>
      <el-table-column prop="deptCode" label="部门编码"></el-table-column>
      <el-table-column prop="deptPhone" label="部门电话"></el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template slot-scope="scope">
          <el-button
            icon="el-icon-edit-outline"
            type="primary"
            size="small"
            @click="handleEdit(scope.row)"
          >编辑
          </el-button
          >
          <el-button
            icon="el-icon-close"
            type="danger"
            size="small"
            @click="handleDelete(scope.row)"
          >删除
          </el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </el-main>
</template>

<script>
//导入api脚本
import departmentApi from '@/api/department'

export default {
  name: 'department',
  data() {
    return {
      searchModel: {
        departmentName: '' //部门名称
      },
      tableData: [] //表格数据列表
    }
  },
  methods: {
    /**
     * 查询部门列表
     */
    async search() {
      //发送查询请求
      let res = await departmentApi.getDepartmentList(this.searchModel)
      //判断是否存在数据
      if (res.success) {
        //获取数据
        this.tableData = res.data
      }
    },
    /**
     * 重置
     */
    resetValue() {
      this.searchModel = {}//清空数据
      this.search()//重新调用方法
    }
  },
  //初始化时执行
  created() {
    //调用查询部门列表方法
    this.search()
  }
}
</script>

<style lang="scss" scoped></style>
