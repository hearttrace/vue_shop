<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <el-table :data="goodsList" border stripe>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格/元" prop="goods_price" width="90px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" width="140px">
          <template slot-scope="scope">{{ scope.row.add_time | dateFormat }}</template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="goEditPage(scope.row.goods_id)"></el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="goRemoveGoods(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination layout="total, sizes, prev, pager, next, jumper" :total="total" :page-sizes="[5, 10, 20, 30]" background
      :page-size="queryInfo.pagesize" :current-page="queryInfo.pagenum" @size-change="pageSizeChange" @current-change="pageCodeChange">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      goodsList: [],
      total: 0
    }
  },

  created () {
    this.getGoodsList()
  },

  methods: {
    async getGoodsList () {
      const { data: res } = await this.$http.get('/goods', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品列表数据失败！')
      this.goodsList = res.data.goods
      this.total = res.data.total
    },

    pageSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },

    pageCodeChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },

    async goRemoveGoods (gid) {
      const feedback = await this.$confirm('此操作将永久删除该商品，是否继续？', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (feedback === 'cancel') return this.$message.info('已取消删除')
      if (feedback === 'confirm') {
        this.deleteGoods(gid)
      }
    },

    async deleteGoods (gid) {
      const { data: res } = await this.$http.delete(`/goods/${gid}`)
      if (res.meta.status !== 200) return this.$message.error('删除商品失败！')
      this.getGoodsList()
      this.$message.success('删除商品成功')
    },

    goAddPage () {
      this.$router.push('/goods/add')
    },

    goEditPage (id) {
      this.$router.push({ path: '/goods/edit', query: { id: id } })
    }
  }
}
</script>
