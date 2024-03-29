<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <el-table :data="orderList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="100px"></el-table-column>
        <el-table-column label="是否付款" width="100px">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.order_pay === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" width="70px"></el-table-column>
        <el-table-column label="下单时间" width="150px">
          <template slot-scope="scope">{{ scope.row.create_time | dateFormat }}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="orderDialogVisible = true">修改地址</el-button>
            <el-button type="success" size="mini" icon="el-icon-location" @click="showProgressInfo">查看物流信息</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination layout="total, sizes, prev, pager, next, jumper" :total="total" :page-sizes="[5, 10, 15, 20]" background
      :page-size="queryInfo.pagesize" :current-page="queryInfo.pagenum" @size-change="pageSizeChange" @current-change="pageCodeChange">
      </el-pagination>
    </el-card>

    <el-dialog title="修改订单" width="30%" :visible.sync="orderDialogVisible" @close="closeOrderDialog">
      <el-form ref="orderFormRef" :model="orderModel" label-width="90px" :rules="orderRules" >
        <el-form-item label="省/市/区" prop="address1">
          <el-cascader :options="cityData" :props="cityProps" v-model="orderModel.address1" clearable style="width: 100%"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="orderModel.address2"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="orderDialogVisible = false">取消</el-button>
        <el-button type="primary">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="物流信息" width="50%" :visible.sync="progressDialogVisible">
      <el-timeline>
        <el-timeline-item v-for="(activity, i) in progressInfo" :key="i" :timestamp="activity.time">{{ activity.context }}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>

import cityData from './citydata.js'

export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      orderList: [],
      total: 0,
      orderModel: {
        address1: [],
        address2: ''
      },
      cityData,
      orderDialogVisible: false,
      orderRules: {
        address1: [
          { required: true, message: '省市区不能为空', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '详细地址', trigger: 'blur' }
        ]
      },
      cityProps: {
        value: 'value',
        label: 'label',
        children: 'children',
        expandTrigger: 'hover'
      },
      progressDialogVisible: false,
      progressInfo: []
    }
  },

  created () {
    this.getOrderList()
  },

  methods: {
    async getOrderList () {
      const { data: res } = await this.$http.get('/orders', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取订单列表数据失败！')
      this.orderList = res.data.goods
      this.total = res.data.total
    },

    pageSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },

    pageCodeChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },

    closeOrderDialog () {
      this.$refs.orderFormRef.resetFields()
    },

    showProgressInfo () {
      // const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      // if (res.meta.status !== 200) return this.$message.error('获取订单物流信息失败！')
      this.progressInfo = [
        {
          time: '2018-05-10 09:39:00',
          ftime: '2018-05-10 09:39:00',
          context: '已签收,感谢使用顺丰,期待再次为您服务',
          location: ''
        },
        {
          time: '2018-05-10 08:23:00',
          ftime: '2018-05-10 08:23:00',
          context: '[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件',
          location: ''
        },
        {
          time: '2018-05-10 07:32:00',
          ftime: '2018-05-10 07:32:00',
          context: '快件到达 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-10 02:03:00',
          ftime: '2018-05-10 02:03:00',
          context: '快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-09 23:05:00',
          ftime: '2018-05-09 23:05:00',
          context: '快件到达 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 21:21:00',
          ftime: '2018-05-09 21:21:00',
          context: '快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 13:07:00',
          ftime: '2018-05-09 13:07:00',
          context: '顺丰速运 已收取快件',
          location: ''
        },
        {
          time: '2018-05-09 12:25:03',
          ftime: '2018-05-09 12:25:03',
          context: '卖家发货',
          location: ''
        },
        {
          time: '2018-05-09 12:22:24',
          ftime: '2018-05-09 12:22:24',
          context: '您的订单将由HLA（北京海淀区清河中街店）门店安排发货。',
          location: ''
        },
        {
          time: '2018-05-08 21:36:04',
          ftime: '2018-05-08 21:36:04',
          context: '商品已经下单',
          location: ''
        }
      ]
      this.progressDialogVisible = true
    }
  }
}
</script>
