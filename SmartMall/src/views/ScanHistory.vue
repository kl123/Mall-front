<template>
  <div class="history-page">
    <!-- 页面标题和返回按钮 -->
    <div class="page-header">
      <el-button type="text" @click="$router.back()" class="back-btn">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <h2>扫描历史</h2>
      <el-button v-if="historyList.length" type="danger" text size="small" @click="clearAllHistory" class="clear-btn">
        <el-icon><Delete /></el-icon> 清空
      </el-button>
    </div>

    <!-- 主要内容区域 -->
    <div class="history-content">
      <el-card class="history-card" shadow="hover">
        <div v-if="historyList.length === 0" class="empty-history">
          <el-empty description="暂无扫描记录，快去扫码吧~" :image-size="80" />
          <el-button type="primary" @click="goToScan">去扫描</el-button>
        </div>
        <div v-else class="history-list">
          <div
            v-for="item in historyList"
            :key="item.id"
            class="history-item"
            @click="goToDetail(item.barcode)"
          >
            <div class="item-icon">
              <el-icon><Goods /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-time">{{ item.time }}</div>
            </div>
            <div class="item-arrow">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { ArrowLeft, Delete, Goods, ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()
const historyList = ref([])

// 加载扫描历史（从 localStorage）
const loadHistory = () => {
  const stored = localStorage.getItem('smart_scan_history')
  if (stored) {
    try {
      historyList.value = JSON.parse(stored)
    } catch (e) {
      console.error('解析历史数据失败', e)
      historyList.value = []
    }
  } else {
    historyList.value = []
  }
}

// 清空所有历史
const clearAllHistory = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有扫描历史吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    localStorage.removeItem('smart_scan_history')
    historyList.value = []
    ElMessage.success('历史记录已清空')
  } catch {
    // 用户取消
  }
}

// 跳转到商品详情页
const goToDetail = (barcode) => {
  router.push({ name: 'ResultDetail', params: { barcode } })
}

// 跳转到扫描页
const goToScan = () => {
  router.push('/scan')
}

onMounted(() => {
  loadHistory()
  // 可选：监听 storage 事件，当其他页面修改历史时同步更新
  window.addEventListener('storage', (e) => {
    if (e.key === 'smart_scan_history') {
      loadHistory()
    }
  })
})
</script>

<style scoped>
.history-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 12px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 4px;
  position: relative;
}

.back-btn {
  margin-right: 8px;
}

.page-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  flex: 1;
}

.clear-btn {
  margin-left: auto;
}

.history-content {
  max-width: 800px;
  margin: 0 auto;
}

.history-card {
  border-radius: 16px;
  border: 1px solid #e4e7ed;
}

:deep(.el-card__body) {
  padding: 0;
}

.history-list {
  display: flex;
  flex-direction: column;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f2f5;
  cursor: pointer;
  transition: background 0.2s;
}

.history-item:hover {
  background: #fafbfc;
}

.history-item:last-child {
  border-bottom: none;
}

.item-icon {
  margin-right: 12px;
  color: #409eff;
  font-size: 20px;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.item-time {
  font-size: 12px;
  color: #909399;
}

.item-arrow {
  color: #c0c4cc;
  font-size: 14px;
}

.empty-history {
  text-align: center;
  padding: 40px 20px;
}

.empty-history .el-button {
  margin-top: 16px;
}
</style>