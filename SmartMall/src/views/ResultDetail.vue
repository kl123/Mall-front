<template>
  <div class="detail-page">
    <!-- 页面标题和返回按钮 -->
    <div class="page-header">
      <el-button type="text" @click="$router.back()" class="back-btn">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <h2>商品详情</h2>
    </div>

    <!-- 加载状态（模拟） -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 商品详情内容 -->
    <div v-else-if="product" class="detail-content">
      <!-- 商品基本信息卡片 -->
      <el-card class="info-card" shadow="hover">
        <div class="product-header">
          <div class="product-emoji">{{ product.image || '📦' }}</div>
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-barcode">条码：{{ barcode }}</p>
            <p class="product-category" v-if="product.category">分类：{{ product.category }}</p>
          </div>
        </div>
      </el-card>

      <!-- 匹配度评分卡片 -->
      <el-card class="score-card" shadow="hover">
        <div class="score-header">
          <span>匹配度评分</span>
          <span class="score-value">{{ matchScore }}分</span>
        </div>
        <el-progress :percentage="matchScore" :color="scoreColor" :stroke-width="8" />
        <div class="score-tip">{{ matchTip }}</div>
      </el-card>

      <!-- 过敏源检测卡片 -->
      <el-card class="allergy-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Warning /></el-icon>
            <span>过敏源检测</span>
          </div>
        </template>
        <div v-if="hasAllergen" class="allergy-warning">
          <el-icon color="#F56C6C"><CircleCloseFilled /></el-icon>
          <span>⚠️ 包含过敏成分：{{ allergenList }}</span>
        </div>
        <div v-else class="allergy-safe">
          <el-icon color="#67C23A"><SuccessFilled /></el-icon>
          <span>✅ 未检测到您的过敏源，相对安全</span>
        </div>
        <div class="allergy-detail" v-if="hasAllergen">
          <div class="sub-title">具体过敏成分：</div>
          <div class="allergy-list">
            <el-tag v-for="item in allergenDetail" :key="item" type="danger" size="small">
              {{ item }}
            </el-tag>
          </div>
        </div>
      </el-card>

      <!-- 成分分析卡片 -->
      <el-card class="ingredient-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><List /></el-icon>
            <span>成分分析</span>
          </div>
        </template>
        <div class="ingredient-list">
          <div v-for="ing in product.ingredients" :key="ing" class="ingredient-item">
            <span :class="{ 'ingredient-allergen': isAllergen(ing) }">
              {{ ing }}
              <el-tag v-if="isAllergen(ing)" type="danger" size="small" effect="dark">过敏</el-tag>
            </span>
          </div>
        </div>
        <div class="nutrition-info" v-if="product.nutrition">
          <div class="sub-title">营养信息</div>
          <div class="nutrition-grid">
            <div v-for="(value, key) in product.nutrition" :key="key" class="nutrition-item">
              <span class="label">{{ key }}</span>
              <span class="value">{{ value }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 价格趋势卡片 -->
      <el-card class="price-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><TrendCharts /></el-icon>
            <span>价格趋势</span>
          </div>
        </template>
        <div class="price-current">
          <span class="label">当前参考价</span>
          <span class="value">{{ currentPrice }}</span>
        </div>
        <div class="price-history" v-if="product.priceHistory && product.priceHistory.length">
          <div class="sub-title">历史价格（近5次）</div>
          <div class="history-list">
            <div v-for="(price, idx) in product.priceHistory.slice(-5)" :key="idx" class="history-item">
              <span class="index">{{ idx + 1 }}</span>
              <span class="price">¥{{ price.toFixed(1) }}</span>
            </div>
          </div>
          <div class="trend" :class="trendClass">{{ trendText }}</div>
        </div>
        <div v-else class="no-data">暂无价格数据</div>
      </el-card>

      <!-- 用户评论卡片 -->
      <el-card class="comment-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><ChatDotRound /></el-icon>
            <span>用户评论</span>
          </div>
        </template>
        <div class="comment-list">
          <div v-if="comments.length === 0" class="empty-comment">暂无评论，快来发表第一条吧~</div>
          <div v-for="c in comments" :key="c.id" class="comment-item">
            <div class="comment-user">
              <el-icon><User /></el-icon>
              <span>{{ c.userName }}</span>
              <span class="comment-time">{{ c.timeText }}</span>
            </div>
            <div class="comment-content">{{ c.content }}</div>
            <div class="comment-rating" v-if="c.rating">
              <el-rate v-model="c.rating" disabled :size="12" />
            </div>
          </div>
        </div>
        <div class="comment-form">
          <el-input
            v-model="newComment"
            type="textarea"
            :rows="2"
            placeholder="写下你的评价..."
            maxlength="200"
            show-word-limit
          />
          <div class="comment-actions">
            <el-rate v-model="rating" :size="14" />
            <el-button type="primary" @click="postComment" :loading="submitting">发表评论</el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 商品不存在 -->
    <div v-else class="empty-product">
      <el-empty description="未找到该商品" />
      <el-button type="primary" @click="$router.back()">返回</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, Warning, List, TrendCharts, ChatDotRound, User,
  CircleCloseFilled, SuccessFilled
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const barcode = route.params.barcode

// ---------- 模拟商品数据库 ----------
const MOCK_PRODUCTS = {
  '6901234567892': {
    id: 1,
    name: '每日坚果',
    image: '🌰',
    ingredients: ['杏仁', '核桃', '花生', '蔓越莓'],
    priceHistory: [39.9, 42.9, 39.9, 38.5, 37.9],
    category: '零食',
    nutrition: { 能量: '520kJ', 蛋白质: '8g', 脂肪: '15g', 碳水: '25g' }
  },
  '6971234567890': {
    id: 2,
    name: '全麦面包',
    image: '🍞',
    ingredients: ['全麦粉', '酵母', '食盐'],
    priceHistory: [12.9, 12.9, 13.5, 12.5, 12.8],
    category: '烘焙',
    nutrition: { 能量: '890kJ', 蛋白质: '9g', 脂肪: '2g', 碳水: '40g' }
  },
  '4891234567893': {
    id: 3,
    name: '虾仁三明治',
    image: '🥪',
    ingredients: ['面包', '虾仁', '蛋黄酱'],
    priceHistory: [22.9, 23.5, 24.9, 23.9, 23.5],
    category: '快餐'
  }
}
const UNKNOWN = {
  id: 0,
  name: '未收录商品',
  image: '📦',
  ingredients: ['暂无成分信息'],
  priceHistory: [0],
  category: '其他'
}

// ---------- 模拟评论数据（按商品 ID 存储） ----------
const initialCommentsMap = {
  1: [
    { id: 101, userId: 1, userName: '美食达人', content: '这款坚果搭配很合理，每天一包能量满满！', rating: 5, timestamp: Date.now() - 3600000 },
    { id: 102, userId: 2, userName: '健康生活', content: '好吃，但注意过敏成分', rating: 4, timestamp: Date.now() - 7200000 }
  ],
  2: [
    { id: 201, userId: 3, userName: '早餐专家', content: '全麦面包很松软，早餐首选', rating: 5, timestamp: Date.now() - 86400000 }
  ],
  3: []
}

// 辅助函数：生成友好时间文本
const formatTimeText = (timestamp) => {
  const diff = Date.now() - timestamp
  if (diff < 60 * 1000) return '刚刚'
  if (diff < 3600 * 1000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400 * 1000) return `${Math.floor(diff / 3600000)}小时前`
  return new Date(timestamp).toLocaleDateString()
}

// 初始化评论（附加 timeText）
const initComments = (productId) => {
  const productComments = initialCommentsMap[productId] || []
  return productComments.map(c => ({
    ...c,
    timeText: formatTimeText(c.timestamp)
  }))
}

// ---------- 用户过敏源（从 localStorage 读取，与档案页同步） ----------
const loadAllergens = () => {
  const stored = localStorage.getItem('user_allergens')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch(e) { return [] }
  }
  return []  // 默认无过敏源
}
const allergens = ref(loadAllergens())

// ---------- 页面数据 ----------
const product = ref(null)
const comments = ref([])
const loading = ref(false)
const submitting = ref(false)
const newComment = ref('')
const rating = ref(0)

// 模拟下一个评论 ID
let nextCommentId = 1000

// 加载商品和评论（纯前端模拟）
const loadData = () => {
  loading.value = true
  // 模拟网络延迟
  setTimeout(() => {
    const found = MOCK_PRODUCTS[barcode]
    if (found) {
      product.value = { ...found }
      comments.value = initComments(product.value.id)
    } else {
      product.value = { ...UNKNOWN }
      comments.value = []
    }
    loading.value = false
  }, 300)
}

// 发表评论（纯前端模拟，不发送请求）
const postComment = () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  if (!product.value || product.value.id === 0) {
    ElMessage.warning('商品不存在，无法评论')
    return
  }
  submitting.value = true
  // 模拟网络延迟
  setTimeout(() => {
    const newCommentObj = {
      id: nextCommentId++,
      userId: 999,
      userName: '当前用户',
      content: newComment.value.trim(),
      rating: rating.value,
      timestamp: Date.now(),
      timeText: '刚刚'
    }
    comments.value.unshift(newCommentObj)
    // 可选：将评论保存到 initialCommentsMap 中（但刷新后丢失，仅演示）
    if (!initialCommentsMap[product.value.id]) {
      initialCommentsMap[product.value.id] = []
    }
    initialCommentsMap[product.value.id].unshift({
      id: newCommentObj.id,
      userId: newCommentObj.userId,
      userName: newCommentObj.userName,
      content: newCommentObj.content,
      rating: newCommentObj.rating,
      timestamp: newCommentObj.timestamp
    })
    ElMessage.success('评论成功！')
    newComment.value = ''
    rating.value = 0
    submitting.value = false
  }, 500)
}

// 过敏检测
const hasAllergen = computed(() => {
  if (!product.value?.ingredients) return false
  return product.value.ingredients.some(ing =>
    allergens.value.some(a => ing.includes(a))
  )
})
const allergenList = computed(() => {
  if (!product.value?.ingredients) return ''
  const matched = product.value.ingredients.filter(ing =>
    allergens.value.some(a => ing.includes(a))
  )
  return matched.join('、')
})
const allergenDetail = computed(() => {
  if (!product.value?.ingredients) return []
  return product.value.ingredients.filter(ing =>
    allergens.value.some(a => ing.includes(a))
  )
})
const isAllergen = (ing) => allergens.value.some(a => ing.includes(a))

// 匹配度评分
const matchScore = computed(() => {
  if (!product.value) return 0
  let score = 80
  if (hasAllergen.value) score -= 40
  if (product.value.name?.includes('全麦') || product.value.name?.includes('有机')) score += 5
  return Math.min(100, Math.max(0, score))
})
const scoreColor = computed(() => {
  if (matchScore.value >= 80) return '#67C23A'
  if (matchScore.value >= 60) return '#E6A23C'
  return '#F56C6C'
})
const matchTip = computed(() => {
  if (matchScore.value >= 80) return '非常适合您'
  if (matchScore.value >= 60) return '基本符合需求'
  return '含有过敏或不适合的成分，请谨慎'
})

// 价格相关
const currentPrice = computed(() => {
  const ph = product.value?.priceHistory
  return ph?.length ? `¥${ph[ph.length-1].toFixed(1)}` : '暂无'
})
const trendText = computed(() => {
  const ph = product.value?.priceHistory
  if (!ph || ph.length < 2) return '价格稳定'
  const last = ph[ph.length-1]
  const prev = ph[ph.length-2]
  if (last > prev) return '较上次上涨'
  if (last < prev) return '较上次下降'
  return '与上次持平'
})
const trendClass = computed(() => {
  const ph = product.value?.priceHistory
  if (!ph || ph.length < 2) return ''
  const last = ph[ph.length-1]
  const prev = ph[ph.length-2]
  if (last > prev) return 'trend-up'
  if (last < prev) return 'trend-down'
  return ''
})

onMounted(() => {
  loadData()
  // 监听 localStorage 变化（如果其他页面修改了过敏源）
  window.addEventListener('storage', () => {
    allergens.value = loadAllergens()
  })
})
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 12px;
}
.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
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
.loading-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 16px;
}
.detail-content {
  max-width: 800px;
  margin: 0 auto;
}
.el-card {
  margin-bottom: 12px;
  border-radius: 16px;
  border: 1px solid #e4e7ed;
}
:deep(.el-card__body) {
  padding: 16px;
}
:deep(.el-card__header) {
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 15px;
}
/* 商品头部 */
.product-header {
  display: flex;
  gap: 16px;
  align-items: center;
}
.product-emoji {
  font-size: 48px;
  width: 70px;
  height: 70px;
  background: #f9f9f9;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.product-info {
  flex: 1;
}
.product-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px;
}
.product-barcode,
.product-category {
  font-size: 12px;
  color: #909399;
  margin: 2px 0;
}
/* 评分卡片 */
.score-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}
.score-value {
  font-weight: 600;
  color: #409eff;
}
.score-tip {
  font-size: 12px;
  color: #606266;
  margin-top: 8px;
  text-align: right;
}
/* 过敏源卡片 */
.allergy-warning {
  background: #fef0f0;
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f56c6c;
}
.allergy-safe {
  background: #f0f9eb;
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #67c23a;
}
.allergy-detail {
  margin-top: 12px;
}
.sub-title {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #606266;
}
.allergy-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
/* 成分表 */
.ingredient-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ingredient-item {
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid #f0f2f5;
}
.ingredient-allergen {
  color: #f56c6c;
  font-weight: 500;
}
.nutrition-info {
  margin-top: 16px;
}
.nutrition-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  background: #fafbfc;
  padding: 8px;
  border-radius: 8px;
}
.nutrition-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}
.nutrition-item .label {
  color: #909399;
}
.nutrition-item .value {
  font-weight: 500;
}
/* 价格趋势 */
.price-current {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}
.price-current .value {
  font-size: 20px;
  font-weight: 600;
  color: #e6a23c;
}
.price-history .history-list {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-top: 8px;
}
.history-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f8f9fa;
  padding: 6px 0;
  border-radius: 6px;
  flex: 1;
}
.history-item .index {
  font-size: 11px;
  color: #909399;
}
.history-item .price {
  font-size: 13px;
  font-weight: 500;
}
.trend {
  margin-top: 12px;
  text-align: center;
  font-size: 13px;
  padding: 6px;
  border-radius: 6px;
}
.trend-up {
  background: #fef0f0;
  color: #f56c6c;
}
.trend-down {
  background: #f0f9eb;
  color: #67c23a;
}
.no-data {
  text-align: center;
  color: #909399;
  padding: 20px;
}
/* 评论 */
.comment-list {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 16px;
}
.comment-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f2f5;
}
.comment-user {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #909399;
  margin-bottom: 6px;
}
.comment-time {
  margin-left: auto;
  font-size: 11px;
}
.comment-content {
  font-size: 14px;
  color: #303133;
  line-height: 1.4;
}
.comment-rating {
  margin-top: 6px;
}
.empty-comment {
  text-align: center;
  color: #909399;
  padding: 20px;
}
.comment-form {
  border-top: 1px solid #e4e7ed;
  padding-top: 12px;
}
.comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}
.empty-product {
  text-align: center;
  padding: 50px 20px;
}
</style>