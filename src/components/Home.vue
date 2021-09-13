<template>

  <el-container class="home-container">
    <el-header>
      <div>
        <img src="../assets/logo.png" alt="" class="logo">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>

        <el-menu background-color="#333744" text-color="#fff" active-text-color="#409eff" unique-opened router
        :collapse="isCollapse" :collapse-transition="false" :default-active="activePath">
          <el-submenu :index="submenu.id + ''" v-for="submenu in menuList" :key="submenu.id">
            <template slot="title">
              <i :class="iconsObj[submenu.id]"></i>
              <span>{{ submenu.authName }}</span>
            </template>
            <el-menu-item :index="'/' + item.path" v-for="item in submenu.children" :key="item.id" @click="saveActivePath('/' + item.path)">
              <template slot="title">
              <i class="el-icon-menu"></i>
              <span>{{ item.authName }}</span>
            </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      isCollapse: false,
      menuList: [],
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      activePath: ''
    }
  },

  created () {
    this.getMenuList()
    this.activePath = sessionStorage.getItem('activePath')
  },

  methods: {
    logout () {
      sessionStorage.clear()
      this.$router.push('/login')
    },

    async getMenuList () {
      const { data: res } = await this.$http.get('/menus')
      if (res.meta.status !== 200) return this.$message.error('获取菜单列表失败')
      this.menuList = res.data
      // console.log(this.menuList)
    },

    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },

    saveActivePath (activePath) {
      sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;

  .el-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color:#373d41;
    font-size: 22px;
    color: #fff;

    div {
      display: flex;
      align-items: center;

      .logo {
        height: 40px;
        margin-right: 15px;
      }
    }
  }

  .el-aside {
    user-select: none;
    background-color: #333744;

    .toggle-button {
      background-color: #4a5064;
      text-align: center;
      font-size: 10px;
      line-height: 24px;
      color: #fff;
      letter-spacing: 0.2em;
      cursor: pointer;
    }

    .el-menu {
      border-right: none;

      .iconfont {
        margin-right: 10px;
      }
    }
  }

  .el-main {
    background-color: #eaedf1;
  }
}
</style>
