<template>
  <div class="login-page">
    <div class="login-card">
      <div class="hero">
        <p class="eyebrow">SmartMall</p>
        <h1>账号登录与注册</h1>
        <p class="subtitle">前端把用户名和密码发给后端接口，后端校验后再返回结果。</p>
      </div>

      <el-tabs v-model="activeTab" stretch>
        <el-tab-pane label="登录" name="login">
          <el-form label-position="top" @submit.prevent>
            <el-form-item label="用户名">
              <el-input
                v-model.trim="loginForm.username"
                placeholder="请输入用户名"
                clearable
              />
            </el-form-item>
            <el-form-item label="密码">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
                clearable
                @keyup.enter="handleLogin"
              />
            </el-form-item>
            <el-button type="primary" :loading="loading" class="action-btn" @click="handleLogin">
              登录
            </el-button>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="注册" name="register">
          <el-form label-position="top" @submit.prevent>
            <el-form-item label="用户名">
              <el-input
                v-model.trim="registerForm.username"
                placeholder="请设置用户名"
                clearable
              />
            </el-form-item>
            <el-form-item label="密码">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请设置密码"
                show-password
                clearable
              />
            </el-form-item>
            <el-form-item label="确认密码">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                show-password
                clearable
                @keyup.enter="handleRegister"
              />
            </el-form-item>
            <el-button type="success" :loading="loading" class="action-btn" @click="handleRegister">
              注册
            </el-button>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login, register as registerUser } from '@/api/auth'

const router = useRouter()
const activeTab = ref('login')
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

function validateUserForm({ username, password }) {
  if (!username || !password) {
    ElMessage.warning('用户名和密码都要填写')
    return false
  }

  return true
}

async function handleLogin() {
  if (!validateUserForm(loginForm)) {
    return
  }

  loading.value = true

  try {
    const result = await login({
      username: loginForm.username,
      password: loginForm.password
    })

    if (!result.success) {
      ElMessage.error('用户名或密码错误')
      return
    }

    localStorage.setItem('smartmall-user', JSON.stringify(result.user || { username: loginForm.username }))
    ElMessage.success('登录成功')
    router.push('/main/home')
  } catch (error) {
    ElMessage.error(error.message || '登录请求失败，请检查后端是否启动')
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  if (!validateUserForm(registerForm)) {
    return
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }

  loading.value = true

  try {
    const result = await registerUser({
      username: registerForm.username,
      password: registerForm.password
    })

    if (!result.success) {
      ElMessage.error('用户名已存在')
      return
    }

    ElMessage.success('注册成功，请登录')
    loginForm.username = registerForm.username
    loginForm.password = ''
    registerForm.password = ''
    registerForm.confirmPassword = ''
    activeTab.value = 'login'
  } catch (error) {
    ElMessage.error(error.message || '注册请求失败，请检查后端是否启动')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(160deg, #f5f7fa 0%, #d7e5ff 100%);
}

.login-card {
  width: min(100%, 420px);
  padding: 28px 24px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18px 40px rgba(31, 67, 115, 0.15);
}

.hero {
  margin-bottom: 18px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #4f73ff;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero h1 {
  margin: 0;
  color: #1f2937;
  font-size: 28px;
}

.subtitle {
  margin: 12px 0 0;
  color: #5b6472;
  line-height: 1.6;
}

.action-btn {
  width: 100%;
  margin-top: 8px;
}
</style>
