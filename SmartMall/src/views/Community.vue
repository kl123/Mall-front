<template>
  <div class="community-page">
    <!-- 页面标题和返回按钮 -->
    <div class="page-header">
      <el-button type="text" @click="$router.back()" class="back-btn">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <h2>社区动态</h2>
    </div>

    <!-- 主要内容区域 -->
    <div class="community-content">
      <!-- 发表评论卡片 -->
      <el-card class="post-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Edit /></el-icon>
            <span>发表新评论</span>
          </div>
        </template>
        <el-form :model="postForm" label-width="0">
          <el-form-item>
            <el-select v-model="postForm.productId" placeholder="请选择商品" filterable clearable style="width: 100%">
              <el-option
                v-for="p in productList"
                :key="p.id"
                :label="p.name"
                :value="p.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="postForm.content"
              type="textarea"
              :rows="3"
              placeholder="分享您的使用体验..."
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
          <el-form-item>
            <div class="post-actions">
              <el-rate v-model="postForm.rating" :size="16" />
              <el-button type="primary" @click="submitComment" :loading="submitting">发表评论</el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 评论列表卡片 -->
      <el-card class="comment-list-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><ChatDotRound /></el-icon>
            <span>最新评论</span>
          </div>
        </template>

        <div v-if="comments.length === 0" class="empty-comment">
          <el-empty description="暂无评论，快来抢沙发~" :image-size="60" />
        </div>
        <div v-else class="comment-list">
          <div v-for="item in comments" :key="item.id" class="comment-item">
            <div class="comment-header">
              <div class="user-info">
                <el-icon><User /></el-icon>
                <span>{{ item.userName }}</span>
              </div>
              <div class="product-name" @click="goToProduct(item.productBarcode)">
                <el-icon><Goods /></el-icon>
                <span>{{ item.productName }}</span>
                <el-icon><Right /></el-icon>
              </div>
            </div>
            <div class="comment-content">
              {{ item.content }}
            </div>
            <div class="comment-footer">
              <el-rate v-model="item.rating" disabled :size="12" v-if="item.rating" />
              <span class="comment-time">{{ item.timeText }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, Edit, ChatDotRound, User, Goods, Right
} from '@element-plus/icons-vue'

const router = useRouter()

// ---------- 模拟商品数据 ----------
const productList = ref([
  { id: 1, name: '每日坚果', barcode: '6901234567892' },
  { id: 2, name: '全麦面包', barcode: '6971234567890' },
  { id: 3, name: '虾仁三明治', barcode: '4891234567893' }
])

// ---------- 模拟评论数据（初始几条） ----------
const initialComments = [
  {
    id: 1,
    userId: 1,
    userName: '美食达人',
    productId: 1,
    productName: '每日坚果',
    productBarcode: '6901234567892',
    content: '这款坚果搭配很合理，每天一包能量满满！',
    rating: 5,
    timestamp: Date.now() - 3600000  // 1小时前
  },
  {
    id: 2,
    userId: 2,
    userName: '健康生活',
    productId: 2,
    productName: '全麦面包',
    productBarcode: '6971234567890',
    content: '早餐配上牛奶，完美！',
    rating: 4,
    timestamp: Date.now() - 7200000  // 2小时前
  }
]

// 辅助函数：生成友好时间文本
const formatTimeText = (timestamp) => {
  const diff = Date.now() - timestamp
  if (diff < 60 * 1000) return '刚刚'
  if (diff < 3600 * 1000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400 * 1000) return `${Math.floor(diff / 3600000)}小时前`
  return new Date(timestamp).toLocaleDateString()
}

// 初始化评论列表（附加 timeText 字段）
const initComments = () => {
  return initialComments.map(c => ({
    ...c,
    timeText: formatTimeText(c.timestamp)
  }))
}

const comments = ref(initComments())

// 发表表单
const postForm = ref({
  productId: null,
  content: '',
  rating: 0
})
const submitting = ref(false)

// 获取下一个评论 ID
let nextId = comments.value.length + 1

// 发表评论（纯前端模拟）
const submitComment = () => {
  if (!postForm.value.productId) {
    ElMessage.warning('请选择商品')
    return
  }
  if (!postForm.value.content.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  submitting.value = true

  // 模拟网络延迟
  setTimeout(() => {
    const selectedProduct = productList.value.find(p => p.id === postForm.value.productId)
    if (!selectedProduct) return

    const newComment = {
      id: nextId++,
      userId: 999,
      userName: '当前用户',
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productBarcode: selectedProduct.barcode,
      content: postForm.value.content.trim(),
      rating: postForm.value.rating,
      timestamp: Date.now(),
      timeText: '刚刚'
    }

    // 插入到列表最前面
    comments.value.unshift(newComment)

    // 重置表单
    postForm.value = { productId: null, content: '', rating: 0 }
    ElMessage.success('评论成功！')

    submitting.value = false
  }, 500)
}

// 跳转到商品详情页（这里模拟，实际可跳转）
const goToProduct = (barcode) => {
  // 如果有详情页路由，取消注释下面代码
  // router.push({ name: 'ResultDetail', params: { barcode } })
  ElMessage.info(`查看商品详情（条码：${barcode}）`)
}
</script>

<style scoped>
.community-page {
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
.community-content {
  max-width: 800px;
  margin: 0 auto;
}
.el-card {
  margin-bottom: 16px;
  border-radius: 16px;
  border: 1px solid #e4e7ed;
}
:deep(.el-card__header) {
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
}
:deep(.el-card__body) {
  padding: 16px;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 15px;
}
.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.comment-list {
  display: flex;
  flex-direction: column;
}
.comment-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f2f5;
}
.comment-item:last-child {
  border-bottom: none;
}
.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
}
.product-name {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #409eff;
  cursor: pointer;
}
.product-name:hover {
  text-decoration: underline;
}
.comment-content {
  font-size: 14px;
  color: #303133;
  line-height: 1.4;
  margin-bottom: 8px;
}
.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.comment-time {
  font-size: 11px;
  color: #c0c4cc;
}
.empty-comment {
  padding: 20px 0;
}
</style>