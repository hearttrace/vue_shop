 <template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>

      <el-row class="cate_select">
          <span>选择商品分类：</span>
          <el-cascader :options="cateList" :props="cateProps" v-model="selectedCateKeys" clearable
          @change="selectCateChange"></el-cascader>
      </el-row>

      <el-tabs v-model="activeTab" @tab-click="toggleTab">
        <el-tab-pane label="动态参数" name="many">
          <el-button size="mini" type="primary" :disabled="isBtnDisabled" @click="showParamDialog()">添加参数</el-button>
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag closable v-for="(item, i) in scope.row.attr_vals" :key="i" @close="removeAttrVals(scope.row, i)">{{ item }}</el-tag>
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" size="small"
                @keyup.enter.native="addAttrVals(scope.row)" @blur="addAttrVals(scope.row)" ref="saveTagInput"
                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showParamDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="goRemoveParam(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button size="mini" type="primary" :disabled="isBtnDisabled" @click="showParamDialog()">添加属性</el-button>
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag closable v-for="(item, i) in scope.row.attr_vals" :key="i" @close="removeAttrVals(scope.row, i)">{{ item }}</el-tag>
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" size="small"
                @keyup.enter.native="addAttrVals(scope.row)" @blur="addAttrVals(scope.row)" ref="saveTagInput"
                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作" class="vcenter">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showParamDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="goRemoveParam(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog :title="(isEdit ? '修改' : '添加') + attrName" width="30%" :visible.sync="paramDialogVisible" @close="closeParamForm">
      <el-form ref="paramFormRef" :model="paramModel" label-width="90px" :rules="paramRules" >
        <el-form-item :label="attrName + '名称'" prop="attr_name">
          <el-input v-model="paramModel.attr_name"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="paramDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="goUpdateParam">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      cateList: [],
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      selectedCateKeys: [],
      currentCateId: 0,
      activeTab: 'many',
      isBtnDisabled: true,
      manyTableData: [],
      onlyTableData: [],
      paramDialogVisible: false,
      paramModel: {
        attr_name: ''
      },
      paramRules: {
        attr_name: [
          { required: true, message: '商品属性不能为空', trigger: 'blur' }
        ]
      },
      isEdit: false,
      currentAttrId: 0
    }
  },

  computed: {
    attrName () {
      return this.activeTab === 'many' ? '参数' : '属性'
    }
  },
  created () {
    this.getCateList()
  },

  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('/categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类数据列表失败！')
      this.cateList = res.data
    },

    selectCateChange () {
      const len = this.selectedCateKeys.length
      if (len !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        this.isBtnDisabled = true
      } else {
        this.isBtnDisabled = false
        this.currentCateId = this.selectedCateKeys[len - 1]
        this.getCateParams()
        // console.log(this.selectedCateKeys)
      }
    },

    toggleTab () {
      if (this.selectedCateKeys.length === 3) this.getCateParams()
      // console.log(this.activeTab)
    },

    async getCateParams () {
      const { data: res } = await this.$http.get(`categories/${this.currentCateId}/attributes`, { params: { sel: this.activeTab } })
      if (res.meta.status !== 200) return this.$message.error('获取参数列表数据失败')
      // console.log(res.data)
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      if (this.activeTab === 'many') this.manyTableData = res.data
      else this.onlyTableData = res.data
    },

    async showParamDialog (attrId) {
      if (attrId) {
        this.currentAttrId = attrId
        this.isEdit = true
        const { data: res } = await this.$http.get(`categories/${this.currentCateId}/attributes/${attrId}`, { parmas: { attr_sel: this.activeTab } })
        if (res.meta.status !== 200) return this.$message.error('获取参数属性失败！')
        this.paramModel.attr_name = res.data.attr_name
      } else {
        this.paramModel.attr_name = ''
        this.isEdit = false
      }
      this.paramDialogVisible = true
    },

    closeParamForm () {
      this.$refs.paramFormRef.resetFields()
    },

    goUpdateParam () {
      this.$refs.paramFormRef.validate(valid => {
        if (!valid) return
        if (this.isEdit) {
          this.editCateParam()
        } else {
          this.addCateParam()
        }
      })
    },

    async addCateParam () {
      const { data: res } = await this.$http.post(`/categories/${this.currentCateId}/attributes`, {
        attr_name: this.paramModel.attr_name,
        attr_sel: this.activeTab
      })
      if (res.meta.status !== 201) return this.$message.error('添加参数属性失败！')
      this.getCateParams()
      this.paramDialogVisible = false
      this.$message.success('添加参数属性成功')
    },

    async editCateParam () {
      const { data: res } = await this.$http.put(`/categories/${this.currentCateId}/attributes/${this.currentAttrId}`, {
        attr_name: this.paramModel.attr_name,
        attr_sel: this.activeTab
      })
      if (res.meta.status !== 200) return this.$message.error('更新参数属性失败！')
      this.getCateParams()
      this.paramDialogVisible = false
      this.$message.success('更新参数属性成功')
    },

    async goRemoveParam (attrId) {
      const feedback = await this.$confirm('此操作将永久删除该参数，是否继续？', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (feedback === 'cancel') return this.$message.info('已取消删除')
      if (feedback === 'confirm') {
        this.deleteParam(attrId)
      }
    },

    async deleteParam (attrId) {
      const { data: res } = await this.$http.delete(`categories/${this.currentCateId}/attributes/${attrId}`)
      if (res.meta.status !== 200) return this.$message.error('删除参数失败！')
      this.getCateParams()
      this.$message.success('删除参数成功')
    },

    async addAttrVals (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      const attrVals = row.attr_vals.join(' ') + ' ' + row.inputValue
      const { data: res } = await this.$http.put(`categories/${row.cat_id}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: this.activeTab,
        attr_vals: attrVals
      })
      if (res.meta.status !== 200) return this.$message.error('更新参数项失败！')
      row.attr_vals.push(row.inputValue)
      row.inputValue = ''
      row.inputVisible = false
      this.$message.success('更新参数项成功')
    },

    showInput (row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    async removeAttrVals (row, i) {
      let attrVals = [...row.attr_vals]
      attrVals.splice(i, 1)
      attrVals = attrVals.join(' ')
      const { data: res } = await this.$http.put(`categories/${row.cat_id}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: this.activeTab,
        attr_vals: attrVals
      })
      if (res.meta.status !== 200) return this.$message.error('更新参数项失败！')
      row.attr_vals.splice(i, 1)
      this.$message.success('更新参数项成功')
    }
  }
}
</script>

<style lang="less" scoped>
.cate_select {
  margin: 15px 0;
}

.el-tag {
  margin: 10px;
}

.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}

.input-new-tag {
  width: 90px;
  margin-left: 10px;
}
</style>
