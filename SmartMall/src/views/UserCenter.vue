<template>
  <div class="user-center">
    <!-- 页面标题和返回按钮 -->
    <div class="page-header">
      <el-button type="text" @click="$router.back()" class="back-btn">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <h2>个人中心</h2>
    </div>

    <!-- 主要内容区域 -->
    <div class="user-content">
      <!-- 用户信息卡片 -->
      <el-card class="user-info-card" shadow="hover">
        <div class="user-avatar">
          <el-avatar :size="64" :icon="UserFilled" />
        </div>
        <div class="user-details">
          <div class="nickname">{{ username }}</div>
          <div class="phone">{{ phone }}</div>
        </div>
      </el-card>

      <!-- 功能菜单卡片 -->
      <el-card class="menu-card" shadow="hover">
        <div class="menu-item" @click="goToProfile">
          <el-icon><Setting /></el-icon>
          <span>档案设置</span>
          <el-icon class="arrow"><ArrowRight /></el-icon>
        </div>
        <div class="menu-item" @click="goToHistory">
          <el-icon><Clock /></el-icon>
          <span>扫描历史</span>
          <el-icon class="arrow"><ArrowRight /></el-icon>
        </div>
        <div class="menu-item" @click="logout">
          <el-icon><SwitchButton /></el-icon>
          <span>退出登录</span>
        </div>
      </el-card>

      <!-- 版本信息 -->
      <div class="version">智慧购物 v1.0.0</div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import {
  ArrowLeft, UserFilled, Setting, Clock, SwitchButton, ArrowRight
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const { username: storeUsername, phone: storePhone } = storeToRefs(userStore)

const username = computed(() => storeUsername.value || '用户')
const phone = computed(() => storePhone.value || '')

// 跳转到档案设置页
const goToProfile = () => {
  router.push('/profile')
}

// 跳转到扫描历史（扫描页自带历史记录）
const goToHistory = () => {
  router.push('/scanhistory')
  // 可添加额外逻辑，例如滚动到历史记录区域
}

// 退出登录
const logout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    userStore.clearUser()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch {
    // 用户取消退出
  }
}

onMounted(() => {
  userStore.hydrateFromStorage()
})
</script>

<style scoped>
.user-center {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 12px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 4px;
}

.back-btn {
  margin-right: 8px;
}

.page-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.user-content {
  max-width: 800px;
  margin: 0 auto;
}

/* 用户信息卡片 */
.user-info-card {
  margin-bottom: 16px;
  border-radius: 16px;
  border: 1px solid #e4e7ed;
}
:deep(.user-info-card .el-card__body) {
  display: flex;
  align-items: center;
  padding: 20px;
}
.user-avatar {
  margin-right: 16px;
}
.user-details {
  flex: 1;
}
.nickname {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}
.phone {
  font-size: 14px;
  color: #909399;
}

/* 菜单卡片 */
.menu-card {
  margin-bottom: 16px;
  border-radius: 16px;
  border: 1px solid #e4e7ed;
}
:deep(.menu-card .el-card__body) {
  padding: 0;
}
.menu-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f2f5;
  cursor: pointer;
  transition: background 0.2s;
}
.menu-item:last-child {
  border-bottom: none;
}
.menu-item:hover {
  background: #fafbfc;
}
.menu-item .el-icon:first-child {
  margin-right: 12px;
  color: #409eff;
  font-size: 18px;
}
.menu-item span {
  flex: 1;
  font-size: 15px;
  color: #303133;
}
.menu-item .arrow {
  color: #c0c4cc;
  font-size: 14px;
}

/* 版本信息 */
.version {
  text-align: center;
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 20px;
}
</style>