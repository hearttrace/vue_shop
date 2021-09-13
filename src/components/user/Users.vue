<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" clearable v-model="queryInfo.query" @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="showUserDialog()">添加用户</el-button>
        </el-col>
      </el-row>

      <el-table border stripe :data="userList">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="账号"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="updateUserState(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column  label="操作" width="180px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showUserDialog(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="goRemoveUser(scope.row.id)"></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination @size-change="pageSizeChange" @current-change="pageCodeChange"
      :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]"
      :page-size="queryInfo.pagesize"  layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <el-dialog :title="isEdit ? '修改用户' : '添加用户'" :visible.sync="userDialogVisible" @close="closeDialog">
      <el-form  ref="userFormRef" :model="userModel" :rules="userRules" label-width="70px">
        <el-form-item label="账号" prop="username">
            <el-input v-model="userModel.username" :disabled="isEdit"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-show="!isEdit">
            <el-input type="password" v-model="userModel.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
            <el-input v-model="userModel.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
            <el-input v-model="userModel.mobile"></el-input>
        </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="userDialogVisible = false">取消</el-button>
      <el-button @click="goUpdateUser">确定</el-button>
    </span>
  </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    const checkEmail = (rule, value, cb) => {
      const regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
      if (regEmail.test(value)) return cb()
      cb(new Error('请输入合法的邮箱地址'))
    }

    const checkMobile = (rule, value, cb) => {
      const regMobile = /^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/
      if (regMobile.test(value)) return cb()
      cb(new Error('请输入合法的手机号'))
    }

    return {
      userList: [],
      total: 0,
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userDialogVisible: false,
      userModel: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      currentUser: {},
      userRules: {
        username: [
          { required: true, message: '请输入账号名称', trigger: 'blur' },
          { min: 3, max: 15, message: '账号长度在3-15个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入账号密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在6-20个字符之间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      isEdit: false
    }
  },

  created () {
    this.getUserList()
  },

  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('/users', { params: this.queryInfo })
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取用户列表数据失败！')
      this.userList = res.data.users
      this.total = res.data.total
    },

    editUser (id) {
      console.log(id)
    },

    pageSizeChange (newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },

    pageCodeChange (newPage) {
      // console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },

    async updateUserState (userInfo) {
      const { data: res } = await this.$http.put(`/users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) return this.$message.error('更新用户状态失败！')
      this.$message.success('更新用户状态成功')
    },

    async showUserDialog (uid) {
      if (uid) {
        this.isEdit = true
        // 获取用户信息填充到表单中
        const { data: res } = await this.$http.get('/users/' + uid)
        if (res.meta.status !== 200) return this.$message.error('获取用户信息失败！')
        Object.assign(this.userModel, res.data)
      } else {
        this.isEdit = false
      }
      this.userDialogVisible = true
    },

    closeDialog () {
      this.$refs.userFormRef.resetFields()
    },

    goUpdateUser () {
      if (this.isEdit) this.$refs.userFormRef.rules.password = []
      this.$refs.userFormRef.validate(valid => {
        if (!valid) return
        if (this.isEdit) {
          this.updateUser()
          this.$refs.userFormRef.rules.password = [
            { required: true, message: '请输入账号密码', trigger: 'blur' },
            { min: 6, max: 20, message: '密码长度在6-20个字符之间', trigger: 'blur' }
          ]
        } else {
          this.addUser()
        }
      })
    },

    async addUser () {
      const { data: res } = await this.$http.post('/users', this.userModel)
      if (res.meta.status !== 201) return this.$message.error('添加用户失败！')
      this.userDialogVisible = false
      this.getUserList()
      this.$message.success('添加用户成功')
    },

    async updateUser () {
      console.log(this.userModel)
      const { data: res } = await this.$http.put('/users/' + this.userModel.id, {
        email: this.userModel.email,
        mobile: this.userModel.mobile
      })
      if (res.meta.status !== 200) return this.$message.error('更新用户信息失败!')
      this.userDialogVisible = false
      // this.userModel.username = ''
      // this.userModel.password = ''
      // this.userModel.email = ''
      // this.userModel.mobile = ''
      // Object.keys(this.userModel).map(key => { this.userModel[key] = '' })
      this.$clearObj(this.userModel)
      this.getUserList()
      this.$message.success('更新用户信息成功')
    },

    async goRemoveUser (uid) {
      const feedback = await this.$confirm('此操作将永久删除该用户，是否继续？', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (feedback === 'cancel') return this.$message.info('已取消删除')
      if (feedback === 'confirm') {
        this.deleteUser(uid)
      }
    },

    async deleteUser (uid) {
      const { data: res } = await this.$http.delete('/users/' + uid)
      if (res.meta.status !== 200) return this.$message.error('删除用户失败！')
      this.$message.success('删除用户成功')
      this.getUserList()
    }
  }
}
</script>
