<template>
    <div class="login-container">
        <div class="login-box">
            <div class="avatar-box">
                <img src="../assets/avatar.jpg" alt="">
            </div>

            <el-form class="form-box" ref="loginFormRef" :model="loginModel" :rules="loginRules">
                <el-form-item prop="username">
                    <el-input prefix-icon="iconfont icon-user" v-model="loginModel.username"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input prefix-icon="iconfont icon-3702mima" type="password" v-model="loginModel.password"></el-input>
                </el-form-item>
                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="resetFields">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default
{
  data () {
    return {
      loginModel: {
        username: 'admin',
        password: ''
      },
      loginRules: {
        username: [
          { required: true, message: '请输入账号名称', trigger: 'blur' },
          { min: 3, max: 15, message: '账号长度在3-15个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在6-20个字符之间', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetFields () {
      // console.log(this.$refs)
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('/login', this.loginModel)
        if (res.meta.status !== 200) return this.$message.error('登录失败!')
        sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
        this.$message.success('登录成功')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login-container {
    height: 100%;
    background-color: #2b4b6b;

    .login-box {
        position: relative;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 450px;
        height: 300px;
        background-color: #fff;
        border-radius: 5px;

        .avatar-box {
            position: absolute;
            left: 50%;
            transform: translate(-50%, -50%);
            overflow: hidden;
            width: 100px;
            height: 100px;
            border-radius: 50%;

            img {
                width: 100%;
                height: 100%;
            }

        }

        .form-box {
            position: absolute;
            bottom: 0;
            width: 100%;
            padding: 25px;
            box-sizing: border-box;

            .btns {
                display: flex;
                justify-content: center;

                .el-button {
                    margin: 0 30px;
                }
            }
        }

    }
}
</style>
