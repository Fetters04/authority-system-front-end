<template>
  <el-container :style="{ height: containerHeight + 'px' }">
    <!-- 左侧部门树形菜单列表 -->
    <el-aside
      style="
        padding: 10px 0 0 0;
        background: #fff;
        border-right: 1px solid #dfe6ec;
       "
      width="200px"
    >
      <el-tree
        style="font-size: 14px"
        ref="leftTree"
        :data="deptList"
        node-key="id"
        :props="defaultProps"
        default-expand-all
        empty-text="暂无数据"
        :show-checkbox="false"
        :highlight-current="true"
        :expand-on-click-node="false"
        @node-click="handleNodeClick"
      >
        <div class="custom-tree-node" slot-scope="{ node, data }">
          <div>
            <span v-if="data.children.length === 0">
              <i class="el-icon-document"></i>
            </span>
            <span v-else @click.stop="openBtn(data)">
              <!--<svg-icon v-if="data.open" icon-class="add-s" />-->
              <!--<svg-icon v-else icon-class="sub-s" />-->
            </span>
            <!-- 名称 -->
            <span style="margin-left: 3px">{{ node.label }}</span>
          </div>
        </div>
      </el-tree>
    </el-aside>
    <!-- 右侧用户数据 -->
    <!-- 表格数据 -->
    <el-main>
      <!-- 查询条件 -->
      <el-form
        :model="searchModel"
        ref="searchForm"
        label-width="80px"
        :inline="true"
        size="small"
      >
        <el-form-item>
          <el-input v-model="searchModel.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="searchModel.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="searchModel.phone" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item>
          <el-button icon="el-icon-search" type="primary"
                     @click="search(departmentId, pageNo, pageSize)"
          >查询
          </el-button>
          <el-button icon="el-icon-delete" @click="resetValue()">重置</el-button>
          <el-button icon="el-icon-plus" size="small" type="success"
                     @click="openAddWindow()"
          >新增
          </el-button>
        </el-form-item>
      </el-form>
      <!-- 用户表格数据 -->
      <el-table
        :height="tableHeight"
        :data="userList"
        border
        stripe
        style="width: 100%; margin-bottom: 10px"
      >
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="realName" label="姓名"></el-table-column>
        <el-table-column prop="departmentName" label="所属部门"></el-table-column>
        <el-table-column prop="phone" label="电话"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column align="center" width="290" label="操作">
          <template slot-scope="scope">
            <el-button icon="el-icon-edit" type="primary"
                       size="mini" @click="handleEdit(scope.row)"
            >编辑
            </el-button>
            <el-button icon="el-icon-delete" type="danger"
                       size="mini" @click="handleDelete(scope.row)"
            >删除
            </el-button>
            <el-button icon="el-icon-setting" type="primary"
                       size="mini" @click="assignRole(scope.row)"
            >分配角色
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页工具栏 -->
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageNo"
        :page-sizes="[10, 20, 30, 40, 50]"
        :page-size="10"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-main>
    <!-- 添加和编辑用户窗口 -->
    <system-dialog
      :title="userDialog.title"
      :height="userDialog.height"
      :width="userDialog.width"
      :visible="userDialog.visible"
      @onClose="onClose"
      @onConfirm="onConfirm"
    >
      <div slot="content">
        <el-form
          :model="user"
          ref="userForm"
          :rules="rules"
          label-width="80px"
          :inline="true"
          size="small"
        >
          <el-form-item prop="username" label="用户名">
            <el-input v-model="user.username"></el-input>
          </el-form-item>
          <el-form-item prop="password" v-if="user.id === ''" label="密码">
            <el-input type="password" v-model="user.password"></el-input>
          </el-form-item>
          <el-form-item prop="departmentName" label="所属部门">
            <el-input
              v-model="user.departmentName"
              :readonly="true"
              @click.native="selectDepartment()"
            ></el-input>
          </el-form-item>
          <el-form-item prop="realName" label="姓名">
            <el-input v-model="user.realName"></el-input>
          </el-form-item>
          <el-form-item prop="phone" label="电话">
            <el-input v-model="user.phone"></el-input>
          </el-form-item>
          <el-form-item label="昵称">
            <el-input v-model="user.nickName"></el-input>
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="user.email"></el-input>
          </el-form-item>
          <el-form-item prop="gender" label="性别">
            <el-radio-group v-model="user.gender">
              <el-radio :label="0">男</el-radio>
              <el-radio :label="1">女</el-radio>
            </el-radio-group>
          </el-form-item>
          <br>
          <!-- 用户头像：待补充 -->
        </el-form>
      </div>
    </system-dialog>
    <!-- 所属部门弹框 -->
    <system-dialog
      :title="parentDialog.title"
      :width="parentDialog.width"
      :height="parentDialog.height"
      :visible="parentDialog.visible"
      @onClose="onParentClose"
      @onConfirm="onParentConfirm"
    >
      <div slot="content">
        <el-tree
          ref="parentTree"
          :data="parentList"
          default-expand-all
          node-key="id"
          :props="parentProps"
          :show-checkbox="false"
          :highlight-current="true"
          :expand-on-click-node="false"
          @node-click="parentClick"
        >
          <div class="customer-tree-node" slot-scope="{ node, data }">
            <span v-if="data.children.length == 0">
              <i class="el-icon-document" />
            </span>
            <span v-else @click.stop="openParentBtn(data)">
              <!--<svg-icon v-if="data.open"icon-class="add-s"/>-->
              <!--<svg-icon v-else icon-class="sub-s" />-->
            </span>
            <span style="margin-left: 3px">{{ node.label }}</span>
          </div>
        </el-tree>
      </div>
    </system-dialog>
    <!-- 分配角色窗口 -->
    <system-dialog
      :title="assignDialog.title"
      :height="assignDialog.height"
      :width="assignDialog.width"
      :visible="assignDialog.visible"
      @onClose="onAssignClose"
      @onConfirm="onAssignConfirm"
    >
      <div slot="content">
        <!-- 分配角色数据列表 -->
        <el-table
          ref="assignRoleTable"
          :data="assignRoleList"
          border
          stripe
          :height="assignHeight"
          style="width: 100%; margin-bottom: 10px"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            type="selection"
            width="55"
            align="center"
          ></el-table-column>
          <el-table-column prop="roleCode" label="角色编码" />
          <el-table-column prop="roleName" label="角色名称" />
          <el-table-column prop="remark" label="角色备注" />
        </el-table>
        <!-- 分页工具栏 -->
        <el-pagination
          @size-change="assignSizeChange"
          @current-change="assignCurrentChange"
          :current-page.sync="roleVo.pageNo"
          :page-sizes="[10, 20, 30, 40, 50]"
          :page-size="roleVo.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="roleVo.total"
          background
        >
        </el-pagination>
      </div>
    </system-dialog>
  </el-container>
</template>

<script>
//导入部门api脚本
import departmentApi from '@/api/department'
//导入用户api脚本
import {
  getUserList,
  addUser,
  updateUser,
  deleteUser,
  getRoleIdByUserId,
  getAssignRoleList,
  assignRoleSave
} from '@/api/user'
//导入对话框组件
import SystemDialog from '@/components/system/SystemDialog.vue'

export default {
  name: 'userList',
  components: {
    SystemDialog
  },
  data() {
    //自定义验证规则
    let validatePhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入手机号码'))
        //使用正则表达式进行验证手机号码
      } else if (!/^1[3456789]\d{9}$/.test(value)) {
        callback(new Error('手机号格式不正确'))
      } else {
        callback()
      }
    }
    return {
      //分配角色窗口属性
      assignDialog: {
        title: '',
        visible: false,
        width: 800,
        height: 410
      },
      //角色对象
      roleVo: {
        pageNo: 1,
        pageSize: 10,
        userId: '',
        total: 0
      },
      assignRoleList: [], //角色列表
      assignHeight: 0, //分配角色表格高度
      selectedIds: [], //被选中的角色id
      selectedUserId: '', //被分配角色的用户ID
      //选择所属部门窗口属性
      parentDialog: {
        title: '选择所属部门',
        width: 300,
        height: 450,
        visible: false
      },
      //树节点属性
      parentProps: {
        children: 'children',
        label: 'departmentName'
      },
      parentList: [], //所属部门节点数据
      //添加和修改用户窗口属性
      userDialog: {
        title: '',
        height: 410,
        width: 610,
        visible: false
      },
      //用户对象
      user: {
        id: '',
        departmentId: '',
        departmentName: '',
        email: '',
        realName: '',
        phone: '',
        nickName: '',
        password: '',
        username: '',
        gender: '',
        avatar: ''
      },
      rules: {
        departmentName: [{ required: true, trigger: 'change', message: '请选择所属部门' }],
        realName: [{ required: true, trigger: 'blur', message: '请填写姓名' }],
        phone: [{ trigger: 'blur', validator: validatePhone }],
        username: [{ required: true, trigger: 'blur', message: '请填写登录名' }],
        password: [{ required: true, trigger: 'blur', message: '请填写登录密码' }],
        gender: [{ required: true, trigger: 'change', message: '请选择性别' }]
      },
      //查询条件对象
      searchModel: {
        username: '',
        realName: '',
        phone: '',
        departmentId: '',
        pageNo: 1,
        pageSize: 10
      },
      userList: [], //用户列表
      tableHeight: 0, //表格高度
      pageNo: 1, //当前页码
      pageSize: 10, //每页显示数量
      total: 0, //总数量
      departmentId: '', //部门编号
      containerHeight: 0, //容器高度
      deptList: [], //左侧部门树形菜单列表
      //树节点属性
      defaultProps: {
        children: 'children',
        label: 'departmentName'
      }
    }
  },
  methods: {
    /**
     * 查询部门列表
     */
    async getDeptList() {
      let res = await departmentApi.getDepartmentList(null)
      //判断是否成功
      if (res.success) {
        this.deptList = res.data
        //树加载完成后，默认点击第一个节点
        this.$nextTick(() => {
          const firstNode = document.querySelector('.el-tree-node')
          firstNode.click()
        })
      }
    },
    /**
     * 左侧树节点点击事件
     */
    handleNodeClick(data) {
      //给部门编号赋值
      this.departmentId = data.id
      //查询数据
      this.search(this.departmentId)
    },
    //加减号图标点击事件
    openBtn(data) {
      //修改折叠展开状态
      data.open = !data.open
      this.$refs.leftTree.store.nodesMap[data.id].expanded = !data.open
    },
    /**
     * 查询用户列表
     */
    async search(departmentId, pageNo = 1, pageSize = 10) {
      this.searchModel.pageNo = pageNo
      this.searchModel.pageSize = pageSize
      this.searchModel.departmentId = departmentId
      //发送查询请求
      let res = await getUserList(this.searchModel)
      if (res.success) {
        this.userList = res.data.records
        this.total = res.data.total
      }
    },
    /**
     * 当每页数量发生变化时触发该事件
     */
    handleSizeChange(size) {
      this.pageSize = size //将每页显示的数量交给成员变量
      this.search(this.departmentId, this.pageNo, size)
    },
    /**
     * 当页码发生变化时触发该事件
     */
    handleCurrentChange(page) {
      this.pageNo = page
      //调用查询方法
      this.search(this.departmentId, page, this.pageSize)
    },
    /**
     * 重置查询条件
     */
    resetValue() {
      //清空查询条件
      this.searchModel = {}
      //重新查询
      this.search(this.departmentId)
    },
    /**
     * 打开添加窗口
     */
    openAddWindow() {
      this.$resetForm('userForm', this.user) //清空表单
      this.userDialog.visible = true //显示窗口
      this.userDialog.title = '新增用户' //设置标题
    },
    /**
     * 新增或编辑取消事件
     */
    onClose() {
      this.userDialog.visible = false //关闭窗口
    },
    /**
     * 新增或编辑确认事件
     */
    onConfirm() {
      this.$refs.userForm.validate(async(valid) => {
        if (valid) {
          let res = null
          //判断用户ID是否为空
          if (this.user.id === '') {
            //新增
            //发送添加请求
            res = await addUser(this.user)
          } else {
            //发送修改请求
            res = await updateUser(this.user)
          }
          //判断是否成功
          if (res.success) {
            this.$message.success(res.message)
            //刷新
            this.search(this.departmentId, this.pageNo, this.pageSize)
            //关闭窗口
            this.userDialog.visible = false
          } else {
            this.$message.error(res.message)
          }
        }
      })
    },
    /**
     * 打开选择上级部门窗口
     */
    async selectDepartment() {
      //查询上级部门数据
      let res = await departmentApi.getDepartmentList(null)
      //判断是否成功
      if (res.success) {
        this.parentList = res.data
      }
      //显示窗口
      this.parentDialog.visible = true
    },
    /**
     * 选择上级部门取消事件
     */
    onParentClose() {
      this.parentDialog.visible = false //关闭窗口
    },
    /**
     * 选择上级部门确认事件
     */
    onParentConfirm() {
      this.parentDialog.visible = false
    },
    /**
     * 上级部门树节点点击事件
     */
    parentClick(data) {
      this.user.departmentId = data.id
      this.user.departmentName = data.departmentName
    },
    /**
     * 上级部门树加号 减号 图标点击事件
     */
    openParentBtn(data) {
      data.open = !data.open
      this.$refs.parentTree.store.nodesMap[data.id].expanded = !data.open
    },
    /**
     * 编辑用户
     */
    handleEdit(row) {
      //设置弹框属性
      this.userDialog.title = '编辑用户'
      this.userDialog.visible = true
      //把当前编辑的数据复制到表单数据域，供回显使用
      this.$objCopy(row, this.user)
    },
    /**
     * 删除
     */
    async handleDelete(row) {
      let confirm = await this.$myconfirm('确定要删除该数据吗?')
      if (confirm) {
        //封装条件
        let params = { id: row.id }
        //发送删除请求
        let res = await deleteUser(params)
        //判断是否成功
        if (res.success) {
          this.$message.success(res.message)
          //刷新
          this.search(this.departmentId, this.pageNo, this.pageSize)
        } else {
          this.$message.error(res.message)
        }
      }
    },
    /**
     * 打开分配角色
     */
    async assignRole(row) {
      //防止回显出现问题
      this.selectedIds = []
      this.selectedUserId = ''
      //被分配用户的id
      this.selectedUserId = row.id
      //显示窗口
      this.assignDialog.visible = true
      //设置标题
      this.assignDialog.title = `给【${row.realName}】分配角色`
      //查询当前登录用户的所有角色信息
      await this.getAssignRoleList()
      //获取当前被分配用户的ID
      let params = {
        userId: row.id
      }
      //发送根据用户ID查询角色列表的请求
      let res = await getRoleIdByUserId(params)
      //如果存在数据
      if (res.success && res.data) {
        //将查询到的角色ID列表交给选中角色数组
        this.selectedIds = res.data
        //循环遍历
        this.selectedIds.forEach((key) => {
          this.assignRoleList.forEach((item) => {
            if (item.id === key) {
              this.$refs.assignRoleTable.toggleRowSelection(item, true)
            }
          })
        })
      }
    },
    /**
     * 查询当前登录用户的所有角色信息
     */
    async getAssignRoleList(pageNo = 1, pageSize = 10) {
      //给用户ID赋值
      this.roleVo.userId = this.$store.getters.userId
      this.roleVo.pageNo = pageNo
      this.roleVo.pageSize = pageSize
      //发送查询请求
      let res = await getAssignRoleList(this.roleVo)
      //判断是否成功
      if (res.success) {
        //角色列表赋值
        this.assignRoleList = res.data.records
        //角色总数量赋值
        this.roleVo.total = res.data.total
      }
    },
    /**
     * 分配角色取消事件
     */
    onAssignClose() {
      //隐藏窗口
      this.assignDialog.visible = false
    },
    /**
     * 分配角色确认事件
     */
    async onAssignConfirm() {
      //判断用户是否有选中角色
      if (this.selectedIds.length === 0) {
        this.$message.warning('请选择要分配的角色！')
        return
      }
      let params = {
        userId: this.selectedUserId,
        roleIds: this.selectedIds
      }
      //发送请求
      let res = await assignRoleSave(params)
      //判断是否成功
      if (res.success) {
        this.$message.success(res.message)
        //关闭窗口
        this.assignDialog.visible = false
      } else {
        this.$message.error(res.message)
      }
    },
    /**
     * 当每页数量发生变化时触发该事件
     */
    assignSizeChange(size) {
      this.roleVo.pageSize = size //将每页显示的数量交给成员变量
      this.getAssignRoleList(this.roleVo.pageNo, size)
    },
    /**
     * 当页码发生变化时触发该事件
     */
    assignCurrentChange(page) {
      this.roleVo.pageNo = page
      //调用查询方法
      this.getAssignRoleList(page, this.roleVo.pageSize)
    },
    /**
     * 当点击多选框时触发该事件
     */
    handleSelectionChange(rows) {
      let roleIds = []
      //循环遍历选中的角色ID
      for (let i = 0; i < rows.length; i++) {
        //将当前选中的角色ID放到数组中
        roleIds.push(rows[i].id)
      }
      //将选中的角色ID交给成员变量
      this.selectedIds = roleIds
      // this.selectedIds = rows.map(item => item.id);//等同于上述代码
    }
  },
  created() {
    //查询部门列表
    this.getDeptList()
    //调用查询用户列表
    this.search(this.departmentId)
  },
  mounted() {
    this.$nextTick(() => {
      //内容高度
      this.containerHeight = window.innerHeight - 85
      //表格高度
      this.tableHeight = window.innerHeight - 220
      //角色表格高度
      this.assignHeight = window.innerHeight - 350
    })
  }
}
</script>
