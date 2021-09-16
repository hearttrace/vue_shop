<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>编辑商品</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-alert title="编辑商品信息" type="info" show-icon center :closable="false"></el-alert>
      <el-steps :space="200" align-center :active="activeStep - 0" finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form :model="goodsModel" :rules="goodsRules" ref="goodsFormRef" label-position="top">
        <el-tabs tab-position="left" v-model="activeStep" :before-leave="toggleTab">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="goodsModel.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="goodsModel.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="goodsModel.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="goodsModel.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-tooltip effect="dark" content="点击选择分类" placement="right" v-if="isShow">
                <el-button @click="isShow = false">{{ cateName }}</el-button>
              </el-tooltip>
              <el-cascader :options="cateList" :props="cateProps" v-model="goodsModel.goods_cat" clearable
                @change="selectCateChange" :placeholder="cateName" v-else></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyParams" :key="item.attr_id" :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="(cb, i) in item.attr_vals" :key="i" :label="cb"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyParams" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload :action="uploadURL" list-type="picture" :on-preview="previewUpload"
            :on-remove="removeUpload" :headers="headersObj" :on-success="uploadSuccess" :file-list="fileList">
              <el-button type="primary" size="small">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="goodsModel.goods_introduce" :options="quillOptions"></quill-editor>
            <el-button type="primary" style="margin-top: 15px" @click="updateGoods">更新商品信息</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <el-dialog title="预览" :visible.sync="previewDialogVisible">
      <img :src="previewPath" width="100%">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  data () {
    return {
      activeStep: '0',
      goodsModel: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: ''
      },
      goodsRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      cateList: [],
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      cateId: 0,
      manyParams: [],
      onlyParams: [],
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      headersObj: {
        Authorization: sessionStorage.getItem('token')
      },
      previewDialogVisible: false,
      previewPath: '',
      quillOptions: {
        placeholder: '请输入商品介绍...'
      },
      cateName: '',
      isShow: true,
      fileList: []
    }
  },

  created () {
    this.getGoodsInfo()
    this.getCateList()
  },

  methods: {
    async getGoodsInfo () {
      const { data: res } = await this.$http.get('/goods/' + this.$route.query.id)
      if (res.meta.status !== 200) return this.$message.error('获取商品信息失败！')
      this.goodsModel.goods_name = res.data.goods_name
      this.goodsModel.goods_price = res.data.goods_price
      this.goodsModel.goods_weight = res.data.goods_weight
      this.goodsModel.goods_number = res.data.goods_number
      this.goodsModel.goods_introduce = res.data.goods_introduce
      this.goodsModel.goods_cat.push(res.data.cat_one_id, res.data.cat_two_id, res.data.cat_three_id)
      this.cateId = res.data.cat_id
      res.data.pics.forEach(item => {
        const file = { name: item.pics_id, url: item.pics_mid_url }
        this.fileList.push(file)
      })
      console.log(res.data)
      this.getCateName()
    },

    async getCateList () {
      const { data: res } = await this.$http.get('/categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类数据列表失败！')
      this.cateList = res.data
      // console.log(this.cateList)
    },

    async getCateName () {
      const { data: res } = await this.$http.get('/categories/' + this.cateId)
      if (res.meta.status !== 200) return this.$message.error('获取商品分类信息失败！')
      this.cateName = res.data.cat_name
      // console.log(this.cateList)
    },

    selectCateChange () {
      // console.log(this.goodsModel.goods_cat)
      const len = this.goodsModel.goods_cat.length
      if (len !== 3) {
        this.goodsModel.goods_cat = []
      } else {
        this.cateId = this.goodsModel.goods_cat[len - 1]
      }
    },

    toggleTab (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.goodsModel.goods_cat.length !== 3) {
        this.$message.warning('请先选择商品分类！')
        return false
      }
      if (activeName === '1') {
        this.getManyParams()
      } else if (activeName === '2') {
        this.getOnlyParams()
      }
    },

    async getManyParams () {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: {
          sel: 'many'
        }
      })
      if (res.meta.status !== 200) return this.$message.error('获取商品动态参数失败！')
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
      })
      this.manyParams = res.data
    },

    async getOnlyParams () {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: {
          sel: 'only'
        }
      })
      if (res.meta.status !== 200) return this.$message.error('获取商品静态属性失败！')
      this.onlyParams = res.data
    },

    previewUpload (file) {
      // console.log(file)
      this.previewPath = file.url
      this.previewDialogVisible = true
    },
    removeUpload (file) {
      const filePath = file.url
      const idx = this.fileList.findIndex(item => item.url === filePath)
      this.fileList.splice(idx, 1)
      // console.log(this.goodsModel.pics)
    },
    uploadSuccess (res) {
      const file = { name: Date.now(), url: res.data.url }
      this.fileList.push(file)
    },

    updateGoods () {
      this.$refs.goodsFormRef.validate(async valid => {
        if (!valid) return
        const form = _.cloneDeep(this.goodsModel)
        form.goods_cat = form.goods_cat.join(',')
        form.attrs = []
        this.manyParams.forEach(item => {
          const attr = { attr_id: item.attr_id, attr_value: item.attr_vals.join(',') }
          form.attrs.push(attr)
        })
        this.onlyParams.forEach(item => {
          const attr = { attr_id: item.attr_id, attr_value: item.attr_vals }
          form.attrs.push(attr)
        })
        this.fileList.forEach(item => {
          const pic = { pic: item.url }
          form.pics.push(pic)
        })
        // console.log(form)
        const { data: res } = await this.$http.put('/goods/' + this.$route.query.id, form)
        if (res.meta.status !== 200) return this.$message.error('更新商品信息失败！')
        this.$router.push('/goods')
        this.$message.success('更新商品信息成功')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 15px 0 0 !important;
}
</style>
