 <template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-button type="primary" style="margin-bottom: 15px" @click="showCateDialog()">添加分类</el-button>
      </el-row>
      <tree-table :data="cateList" :selection-type="false" :expand-type="false" border show-index index-text="#"
      :columns="treeColumns" :show-row-hover="false">
        <!-- 是否有效 -->
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-success" style="color: #67C23A" v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-error" style="color: #909399" v-else></i>
        </template>

        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>

        <template slot="operation" slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="showCateDialog(scope.row.cat_id)">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="goRemoveCate(scope.row.cat_id)">删除</el-button>
        </template>

      </tree-table>

      <el-pagination layout="total, sizes, prev, pager, next, jumper" :total="total" :page-sizes="[3, 5, 10, 15]"
      :page-size="queryInfo.pagesize" :current-page="queryInfo.pagenum" @size-change="pageSizeChange" @current-change="pageCodeChange">
      </el-pagination>
    </el-card>

    <el-dialog :title="isEdit ? '修改分类' : '添加分类'" :visible.sync="cateDialogVisible" width="30%" @close="closeCateDialog">
      <el-form ref="cateFormRef" :model="cateModel" :rules="cateRules" label-width="90px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="cateModel.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类" v-if="!isEdit">
          <el-cascader :options="parentCateList" :props="cateProps" v-model="selectedCateKeys" clearable
          @change="parentCateChange" style="width: 100%"></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cateDialogVisible = fasle">取消</el-button>
        <el-button type="primary" @click="goUpdateCate">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      cateList: [],
      total: 0,
      treeColumns: [
        { label: '分类名称', prop: 'cat_name' },
        { label: '是否有效', type: 'template', template: 'isOk' },
        { label: '排序', type: 'template', template: 'order' },
        { label: '操作', type: 'template', template: 'operation' }
      ],
      cateModel: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },
      cateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 10, message: '分类名称在2-10个字符之间', trigger: 'blur' }
        ]
      },
      cateDialogVisible: false,
      parentCateList: [],
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      selectedCateKeys: [],
      isEdit: false,
      currentCateId: 0
    }
  },

  created () {
    this.getCateList()
  },

  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('/categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类数据列表失败！')
      this.cateList = res.data.result
      this.total = res.data.total
    },

    pageSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },

    pageCodeChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },

    async showCateDialog (cid) {
      if (cid) {
        const { data: res } = await this.$http.get('/categories/' + cid)
        if (res.meta.status !== 200) return this.$message.error('获取分类数据失败！')
        this.cateModel.cat_name = res.data.cat_name
        this.currentCateId = cid
        this.isEdit = true
      } else {
        this.getParentCateList()
        this.isEdit = false
        this.cateModel.cat_name = ''
      }
      this.cateDialogVisible = true
    },

    async getParentCateList () {
      const { data: res } = await this.$http.get('/categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('获取父级分类数据列表失败！')
      this.parentCateList = res.data
    },

    parentCateChange () {
      const len = this.selectedCateKeys.length
      if (len > 0) {
        this.cateModel.cat_pid = this.selectedCateKeys[len - 1]
        this.cateModel.cat_level = len
      } else {
        this.cateModel.cat_pid = 0
        this.cateModel.cat_level = 0
      }
    },

    goUpdateCate () {
      console.log(this.cateModel)
      this.$refs.cateFormRef.validate(valid => {
        if (!valid) return
        if (this.isEdit) {
          this.editCate()
        } else {
          this.addCate()
        }
      })
    },

    closeCateDialog () {
      this.$refs.cateFormRef.resetFields()
      this.selectedCateKeys = []
      this.cateModel.cat_pid = 0
      this.cateModel.cat_level = 0
    },

    async addCate () {
      const { data: res } = await this.$http.post('/categories', this.cateModel)
      if (res.meta.status !== 201) return this.$message.error('添加分类失败！')
      this.getCateList()
      this.cateDialogVisible = false
      this.$message.success('添加分类成功')
    },

    async editCate () {
      const { data: res } = await this.$http.put('/categories/' + this.currentCateId, { cat_name: this.cateModel.cat_name })
      if (res.meta.status !== 200) return this.$message.error('修改分类失败！')
      this.getCateList()
      this.cateDialogVisible = false
      this.$message.success('修改分类成功')
    },

    async goRemoveCate (cid) {
      const feedback = await this.$confirm('此操作将永久删除该分类，是否继续？', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (feedback === 'cancel') return this.$message.info('已取消删除')
      if (feedback === 'confirm') {
        this.deleteCate(cid)
      }
    },

    async deleteCate (cid) {
      const { data: res } = await this.$http.delete('/categories/' + cid)
      if (res.meta.status !== 200) return this.$message.error('删除分类失败！')
      this.getCateList()
      this.$message.success('删除分类成功')
    }
  }
}
</script>
