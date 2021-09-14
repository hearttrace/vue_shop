<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-button type="primary" @click="showRoleDialog()">添加角色</el-button>
      </el-row>
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item1, i1) in scope.row.children" :key="item1.id" :class="['bd-bottom', 'vcenter', i1 === 0 ? 'bd-top' : '']">
              <el-col :span="4">
                <el-tag closable @close="goRemoveRights(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="20">
                <el-row v-for="(item2, i2) in item1.children" :key="item2.id" :class="['vcenter', i2 === 0 ? '' : 'bd-top']">
                  <el-col :span="5">
                    <el-tag type="success" closable @close="goRemoveRights(scope.row, item2.id)">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>

                  <el-col :span="19">
                    <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close="goRemoveRights(scope.row, item3.id)">{{ item3.authName }}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="showRoleDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="goRemoveRole(scope.row.id)">删除</el-button>
            <el-button type="warning" size="mini" icon="el-icon-setting" @click="showRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="分配权限" :visible.sync="rightsDialogVisible">
      <el-tree :data="rightTree" :props="rightProp" show-checkbox node-key="id" default-expand-all
        :default-checked-keys="selectedKeys" ref="rightTreeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rightsDialogVisible = false">取消</el-button>
        <el-button @click="allotRights">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="isEdit ? '修改角色' : '添加角色'" :visible.sync="roleDialogVisible" width="35%" @close="closeRoleDialog">
      <el-form ref="roleFormRef" :model="roleModel" :rules="roleRules" label-width="90px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleModel.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="roleModel.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="goUpdateRole">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      roleList: [],
      rightsDialogVisible: false,
      rightTree: [],
      rightProp: {
        label: 'authName',
        children: 'children'
      },
      selectedKeys: [],
      currentRoleId: 0,
      roleDialogVisible: false,
      isEdit: false,
      roleModel: {
        roleName: '',
        roleDesc: ''
      },
      roleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '角色名称在3-10个字符之间', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 5, max: 20, message: '角色描述在5-20个字符之间', trigger: 'blur' }
        ]
      }
    }
  },

  created () {
    this.getRoleList()
  },

  methods: {
    async getRoleList () {
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表数据失败！')
      this.roleList = res.data
      // console.log(this.roleList)
    },

    async goRemoveRights (role, rid) {
      const feedback = await this.$confirm('此操作将永久删除该权限，是否确认', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).catch(err => err)
      if (feedback === 'cancel') return this.$message.info('已取消删除')
      if (feedback === 'confirm') this.deleteRights(role, rid)
    },

    async deleteRights (role, rid) {
      const { data: res } = await this.$http.delete(`/roles/${role.id}/rights/${rid}`)
      if (res.meta.status !== 200) return this.$message.error('删除权限失败！')
      role.children = res.data
    },

    async showRightDialog (role) {
      this.currentRoleId = role.id
      const { data: res } = await this.$http.get('/rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限数据失败！')
      this.rightTree = res.data
      // console.log(this.rightTree)

      this.selectedKeys = []
      this.getLeafKeys(role, this.selectedKeys)
      // console.log(this.selectedKeys)

      this.rightsDialogVisible = true
    },

    getLeafKeys (node, arr) {
      if (!node.children) return arr.push(node.id)
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },

    async allotRights () {
      const rids = [...this.$refs.rightTreeRef.getCheckedKeys(), ...this.$refs.rightTreeRef.getHalfCheckedKeys()]
      const ridsStr = rids.join(',')
      const { data: res } = await this.$http.post(`/roles/${this.currentRoleId}/rights`, { rids: ridsStr })
      if (res.meta.status !== 200) return this.$message.error('分配权限失败！')
      this.getRoleList()
      this.rightsDialogVisible = false
      this.$message.success('分配权限成功')
    },
    async showRoleDialog (rid) {
      if (rid) {
        this.currentRoleId = rid
        const { data: res } = await this.$http.get('/roles/' + rid)
        if (res.meta.status !== 200) return this.$message.error('获取角色信息失败！')
        this.roleModel.roleName = res.data.roleName
        this.roleModel.roleDesc = res.data.roleDesc
        this.isEdit = true
      } else {
        this.isEdit = false
      }
      this.roleDialogVisible = true
    },

    goUpdateRole () {
      this.$refs.roleFormRef.validate(valid => {
        if (!valid) return
        if (this.isEdit) {
          // console.log(this.currentRoleId)
          // 修改角色
          this.editRole()
        } else {
          // 添加角色
          this.addRole()
        }
      })
    },
    async addRole () {
      const { data: res } = await this.$http.post('/roles', this.roleModel)
      if (res.meta.status !== 201) return this.$message.error('添加角色失败！')
      this.getRoleList()
      this.roleDialogVisible = false
      this.$message.success('添加角色成功')
    },

    async editRole () {
      const { data: res } = await this.$http.put('/roles/' + this.currentRoleId, this.roleModel)
      if (res.meta.status !== 200) return this.$message.error('修改角色信息失败！')
      this.getRoleList()
      this.roleDialogVisible = false
      this.$message.success('修改角色信息成功')
    },

    closeRoleDialog () {
      this.$refs.roleFormRef.resetFields()
    },

    async goRemoveRole (rid) {
      const feedback = await this.$confirm('此操作将永久删除该角色，是否确认', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).catch(err => err)
      if (feedback === 'cancel') return this.$message.info('已取消删除')
      if (feedback === 'confirm') this.deleteRole(rid)
    },

    async deleteRole (rid) {
      const { data: res } = await this.$http.delete('/roles/' + rid)
      if (res.meta.status !== 200) return this.$message.error('删除角色失败！')
      this.getRoleList()
      this.$message.success('删除角色成功')
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bd-top {
  border-top: 1px solid #eee;
}

.bd-bottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
