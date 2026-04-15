<template>
  <div class="scan-page-simple">
    <!-- 页面标题和返回按钮 -->
    <div class="page-header">
      <el-button type="text" @click="$router.back()" class="back-btn">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <h2>商品扫描</h2>
    </div>

    <!-- 主要内容区域 -->
    <div class="scan-content-simple">
      <!-- 合并后的主卡片：包含过敏源 + 扫描 + 手动输入 -->
      <el-card class="main-card-simple" shadow="hover">
        <!-- 过敏源区块 -->
        <div class="allergy-section">
          <div class="section-header">
            <div class="section-title-area">
              <el-icon :size="18" class="section-icon"><Warning /></el-icon>
              <span class="section-title">我的过敏源</span>
            </div>
            <el-button type="primary" plain size="small" @click="editAllergy">
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
          </div>
          <div class="allergy-tags">
            <el-tag
              v-for="a in allergens"
              :key="a"
              type="danger"
              effect="dark"
              class="allergy-tag"
            >
              {{ a }}
            </el-tag>
            <span v-if="!allergens.length" class="empty-tips"
              >未设置过敏源</span
            >
          </div>
          <div class="section-tip">扫描商品时会自动检测这些成分</div>
        </div>

        <el-divider />

        <!-- 扫描区块 -->
        <div class="scan-section">
          <div class="section-header">
            <div class="section-title-area">
              <el-icon :size="18" class="section-icon"><Camera /></el-icon>
              <span class="section-title">摄像头扫描</span>
            </div>
          </div>
          <div id="qr-reader" class="qr-reader"></div>
          <div class="scan-buttons">
            <el-button
              type="primary"
              @click="startScan"
              :disabled="isScanning"
              :icon="VideoCamera"
            >
              开始扫描
            </el-button>
            <el-button
              @click="stopScan"
              :disabled="!isScanning"
              :icon="VideoCameraFilled"
            >
              停止
            </el-button>
          </div>
        </div>

        <el-divider />

        <!-- 手动输入区块 -->
        <div class="manual-section">
          <div class="section-header">
            <div class="section-title-area">
              <el-icon :size="18" class="section-icon"><Search /></el-icon>
              <span class="section-title">手动输入条码</span>
            </div>
          </div>
          <el-input
            v-model="manualBarcode"
            placeholder="输入商品条码（例如 6901234567892）"
            clearable
            @keyup.enter="searchByBarcode"
          >
            <template #append>
              <el-button @click="searchByBarcode" :icon="Search"
                >查询</el-button
              >
            </template>
          </el-input>
        </div>
      </el-card>

      <!-- 商品信息卡片（仅在有商品时显示） -->
      <el-card v-if="product" class="product-card-simple" shadow="hover">
        <template #header>
          <div class="card-header-simple">
            <div class="card-title-area">
              <el-icon :size="20" class="card-icon"><Goods /></el-icon>
              <h3 class="card-title">{{ product.name }}</h3>
            </div>
            <span class="card-subtitle">条码：{{ currentBarcode }}</span>
          </div>
        </template>

        <div class="product-content">
          <!-- 匹配度评分 -->
          <MatchScoreBar :percentage="matchScore" />

          <!-- 过敏提醒 -->
          <el-alert
            v-if="hasAllergen"
            :title="`包含过敏成分：${allergenList}`"
            type="warning"
            show-icon
            :closable="false"
            class="warning-alert"
          />
          <el-alert
            v-else
            title="未检测到您的过敏源，相对安全"
            type="success"
            show-icon
            :closable="false"
            class="safe-alert"
          />

          <!-- 成分表 -->
          <div class="ingredient-section">
            <div class="section-title">📋 成分表</div>
            <div class="ingredient-list">
              <el-tag
                v-for="ing in product.ingredients"
                :key="ing"
                :type="isAllergen(ing) ? 'danger' : 'info'"
                effect="plain"
                size="small"
                class="ingredient-tag"
              >
                {{ ing }}{{ isAllergen(ing) ? " " : "" }}
              </el-tag>
            </div>
          </div>

          <!-- 价格趋势 -->
          <div class="price-section">
            <div class="section-title">💰 价格趋势</div>
            <div v-if="pricePoints.length" ref="priceChartRef" class="price-chart"></div>
            <div v-else class="price-trend">暂无价格数据</div>
          </div>
        </div>
      </el-card>

      <!-- 扫描历史卡片 -->
      <el-card class="history-card-simple" shadow="hover">
        <template #header>
          <div class="card-header-simple">
            <div class="card-title-area">
              <el-icon :size="20" class="card-icon"><Clock /></el-icon>
              <h3 class="card-title">最近扫描</h3>
            </div>
            <el-button
              v-if="history.length"
              type="danger"
              text
              size="small"
              @click="clearHistory"
            >
              <el-icon><Delete /></el-icon> 清空
            </el-button>
          </div>
        </template>

        <div v-if="history.length" class="history-list">
          <div
            v-for="item in history"
            :key="item.id"
            class="history-item"
            @click="viewHistory(item.barcode)"
          >
            <div class="history-info">
              <div class="history-name">{{ item.name }}</div>
              <div class="history-time">{{ item.time }}</div>
            </div>
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
        <div v-else class="empty-history">
          <el-empty description="暂无扫描记录" :image-size="60" />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { Html5Qrcode } from 'html5-qrcode'
import MatchScoreBar from '@/components/MatchScoreBar.vue'
import * as echarts from 'echarts'
import {
  ArrowLeft, Warning, Edit, Camera, VideoCamera,
  VideoCameraFilled, Search, Goods, Clock, Delete, ArrowRight
} from '@element-plus/icons-vue'
import { scanBarcode } from '../api/scan'
import { createScanHistoryRecord } from '@/api/scanHistory'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const { userId, allergies: allergens, scanHistory: history } = storeToRefs(userStore)

const editAllergy = () => {
  router.push('/profile')
}

// ---------- 商品数据（模拟商品库，用于未收录时的降级显示） ----------
const MOCK_PRODUCTS = {
  '6901234567892': {
    name: '每日坚果',
    image: '🌰',
    ingredients: ['杏仁', '核桃', '花生', '蔓越莓'],
    priceHistory: [39.9, 42.9, 39.9, 38.5],
  },
  '6971234567890': {
    name: '全麦面包',
    image: '🍞',
    ingredients: ['全麦粉', '酵母', '食盐'],
    priceHistory: [12.9, 12.9, 13.5, 12.5],
  },
  '4891234567893': {
    name: '虾仁三明治',
    image: '🥪',
    ingredients: ['面包', '虾仁', '蛋黄酱'],
    priceHistory: [22.9, 23.5, 24.9, 23.9],
  },
}
const UNKNOWN = {
  name: '未收录商品',
  image: '📦',
  ingredients: ['暂无成分信息'],
  priceHistory: [0],
}

// ---------- 扫描相关 ----------
let scanner = null
let priceChart = null
const isScanning = ref(false)
const manualBarcode = ref('')
const product = ref(null)
const currentBarcode = ref('')
const priceChartRef = ref(null)

// 从后端获取商品信息
const handleBarcode = async (barcode) => {
  if (currentBarcode.value === barcode) return
  currentBarcode.value = barcode

  try {
    ElMessage.info('正在获取商品信息...')
    const currentUserId = userId.value || 1
    const result = await scanBarcode(barcode, currentUserId)

    if (!result.found) {
      // 如果后端未收录，尝试使用本地 Mock
      const localProduct = MOCK_PRODUCTS[barcode]
      if (localProduct) {
        product.value = {
          ...localProduct,
          matchedAllergens: localProduct.ingredients.filter(ing =>
            allergens.value.some(a => ing.includes(a))
          ),
          hasAllergen: localProduct.ingredients.some(ing =>
            allergens.value.some(a => ing.includes(a))
          ),
          matchScore: calculateMatchScore(localProduct)
        }
      } else {
        product.value = { ...UNKNOWN, hasAllergen: false, matchScore: 0 }
        ElMessage.warning('未找到该商品信息')
      }
    } else {
      product.value = result.product
    }

    userStore.addScanHistoryItem({ barcode, name: product.value.name })
    try {
      await createScanHistoryRecord({
        userId: currentUserId,
        barcode,
        name: product.value.name,
        hasAllergen: Boolean(product.value.hasAllergen),
        matchedAllergens: product.value.matchedAllergens || [],
        matchScore: product.value.matchScore || 0,
        scannedAt: new Date().toISOString(),
      })
    } catch {}
    stopScan()
  } catch {
    // 降级到本地 Mock
    const localProduct = MOCK_PRODUCTS[barcode] || UNKNOWN
    product.value = {
      ...localProduct,
      matchedAllergens: localProduct.ingredients.filter(ing =>
        allergens.value.some(a => ing.includes(a))
      ),
      hasAllergen: localProduct.ingredients.some(ing =>
        allergens.value.some(a => ing.includes(a))
      ),
      matchScore: calculateMatchScore(localProduct)
    }
    ElMessage.error('获取商品信息失败，显示本地数据')
    userStore.addScanHistoryItem({ barcode, name: product.value.name })
    stopScan()
  }
}

// 本地计算匹配度（作为后端不可用时的兜底）
const calculateMatchScore = (prod) => {
  if (!prod) return 0
  let score = 80
  const hasAllergen = prod.ingredients.some(ing =>
    allergens.value.some(a => ing.includes(a))
  )
  if (hasAllergen) score -= 40
  if (prod.name.includes('全麦') || prod.name.includes('有机')) score += 5
  return Math.min(100, Math.max(0, score))
}

// 手动查询
const searchByBarcode = () => {
  if (!manualBarcode.value.trim()) {
    ElMessage.warning('请输入条码')
    return
  }
  handleBarcode(manualBarcode.value.trim())
  manualBarcode.value = ''
}

// 过敏检测（用于模板显示）
const hasAllergen = computed(() => {
  return product.value?.hasAllergen || false
})
const allergenList = computed(() => {
  return product.value?.matchedAllergens?.join('、') || ''
})
const isAllergen = (ing) => {
  return product.value?.matchedAllergens?.includes(ing) || false
}

// 匹配度评分
const matchScore = computed(() => {
  return product.value?.matchScore || 0
})

const pricePoints = computed(() => {
  if (!product.value) return []
  const prices = product.value.prices || product.value.priceHistory
  if (!Array.isArray(prices)) return []
  return prices.map((item, idx) => {
    if (typeof item === 'number') {
      return {
        label: `第${idx + 1}次`,
        value: item,
      }
    }
    return {
      label: item.date ? item.date.slice(5) : `第${idx + 1}次`,
      value: Number(item.price) || 0,
    }
  })
})

const renderPriceChart = () => {
  if (!priceChartRef.value || !pricePoints.value.length) return
  if (priceChart) {
    priceChart.dispose()
  }
  priceChart = echarts.init(priceChartRef.value)
  priceChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: 18, left: 40, right: 10, bottom: 25, containLabel: true },
    xAxis: {
      type: 'category',
      data: pricePoints.value.map((item) => item.label),
      axisLabel: { fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      name: '价格',
      axisLabel: { formatter: '¥{value}', fontSize: 10 },
      nameTextStyle: { fontSize: 10 },
    },
    series: [
      {
        data: pricePoints.value.map((item) => item.value),
        type: 'line',
        smooth: true,
        lineStyle: { color: '#E6A23C', width: 2 },
        areaStyle: { color: 'rgba(230, 162, 60, 0.15)' },
        symbol: 'circle',
        symbolSize: 5,
      },
    ],
  })
}

watch(pricePoints, () => {
  nextTick(() => {
    renderPriceChart()
  })
})

const clearHistory = () => {
  userStore.clearScanHistory()
  ElMessage.success('历史记录已清空')
}

const viewHistory = (barcode) => {
  handleBarcode(barcode)
}

// ---------- 摄像头控制 ----------
const startScan = async () => {
  if (isScanning.value) return
  try {
    scanner = new Html5Qrcode('qr-reader')
    await scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 200 } },
      (decodedText) => {
        handleBarcode(decodedText)
      },
      (error) => {}
    )
    isScanning.value = true
    ElMessage.success('摄像头已启动')
  } catch {
    ElMessage.error('无法打开摄像头，请检查权限')
  }
}

const stopScan = async () => {
  if (scanner && isScanning.value) {
    await scanner.stop()
    isScanning.value = false
    ElMessage.info('摄像头已关闭')
  }
}

// ---------- 生命周期 ----------
onMounted(() => {
  userStore.hydrateFromStorage()
  userStore.loadScanHistory()
  startScan()
})

onBeforeUnmount(() => {
  stopScan()
  priceChart?.dispose()
})
</script>

<style scoped>
.scan-page-simple {
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

.scan-content-simple {
  max-width: 800px;
  margin: 0 auto;
}

/* 卡片统一紧凑 */
.main-card-simple,
.product-card-simple,
.history-card-simple {
  margin-bottom: 12px;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
}

/* 覆盖 element-plus 卡片默认内边距（正文） */
:deep(.el-card__body) {
  padding: 12px !important;
}

/* 覆盖卡片头部内边距，让标题与卡片边缘距离缩小 */
:deep(.el-card__header) {
  padding: 8px 12px !important;
  border-bottom: 1px solid #e4e7ed;
}

/* 区块通用样式 */
.allergy-section,
.scan-section,
.manual-section {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.section-title-area {
  display: flex;
  align-items: center;
  gap: 4px;
}

.section-icon {
  color: #409eff;
  font-size: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  padding-bottom: 3px;
}

.section-tip {
  font-size: 11px;
  color: #909399;
  margin-top: 4px;
}

/* 过敏源标签区域 */
.allergy-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.allergy-tag {
  font-size: 13px;
  padding: 2px 8px;
}

.empty-tips {
  font-size: 12px;
  color: #909399;
}

/* 分割线紧凑 */
.el-divider {
  margin: 12px 0 !important;
}

/* 扫描区域 */
.qr-reader {
  width: 100%;
  background: #000;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 12px;
  min-height: 240px;
}

.scan-buttons {
  display: flex;
  justify-content: center;
}

.el-button is-disabled {
  justify-content: center;
}
/* 手动输入区域 */
.manual-section .el-input {
  width: 100%;
}

/* 商品卡片内部 */
.card-header-simple {
  padding: 0;
}
.card-title-area {
  display: flex;
  align-items: center;
  margin-bottom: 2px;
}
.card-icon {
  margin-right: 6px;
  font-size: 18px;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}
.card-subtitle {
  font-size: 12px;
}
.product-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.warning-alert,
.safe-alert {
  margin: 0;
  padding: 6px 12px;
}
.ingredient-section {
  border-top: 1px solid #f0f2f5;
  padding-top: 8px;
}
.ingredient-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px; /* 增加成分标签间距 */
}
.ingredient-tag {
  font-size: 11px;
  padding: 0 8px;
  line-height: 22px;
}
.price-section {
  border-top: 1px solid #f0f2f5;
  padding-top: 8px;
}
.price-trend {
  font-size: 13px;
  color: #909399;
}
.price-chart {
  width: 100%;
  height: 160px;
  margin-top: 8px;
}

/* 历史记录 */
.history-list {
  display: flex;
  flex-direction: column;
}
.history-item {
  border-bottom: 1px solid #f0f2f5;
}
.history-name {
  font-weight: 500;
  font-size: 14px;
}
.history-time {
  font-size: 11px;
}
.empty-history {
  padding: 16px 0;
}
:deep(.el-empty__description) {
  margin-top: 8px;
}
:deep(.el-empty__image) {
  width: 60px;
}

/* 历史卡片头部，让标题和按钮左右分布 */
.history-card-simple .card-header-simple {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 响应式 */
@media (max-width: 768px) {
  .scan-content-simple {
    padding: 0 4px;
  }
}
</style>
