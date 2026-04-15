<template>
  <div class="dashboard-page">
    <!-- 页面头部（渐变背景） -->
    <div class="page-header">
      <div class="greeting">Hello, {{ username }}!</div>
      <div class="welcome-title">欢迎回来，您的购物助手已就绪</div>
    </div>

    <!-- 主要内容区域 -->
    <div class="dashboard-content">
      <!-- 统计卡片行 -->
      <div class="stats-row">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon"><el-icon><Camera /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ totalScans }}</div>
            <div class="stat-label">累计扫描</div>
          </div>
        </el-card>
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon"><el-icon><Warning /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ totalAlerts }}</div>
            <div class="stat-label">过敏警报</div>
          </div>
        </el-card>
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon"><el-icon><TrendCharts /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ healthScore }}</div>
            <div class="stat-label">健康评分</div>
          </div>
        </el-card>
      </div>

      <!-- 图表行 -->
      <el-row :gutter="12">
        <el-col :xs="24" :sm="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><DataLine /></el-icon>
                <span>扫描趋势（近7天）</span>
              </div>
            </template>
            <div ref="trendChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><PieChart /></el-icon>
                <span>过敏警报分布</span>
              </div>
            </template>
            <div ref="allergyChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 个性化建议卡片 -->
      <el-card class="suggestion-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><ChatDotRound /></el-icon>
            <span>个性化建议</span>
          </div>
        </template>
        <div class="suggestion-content">
          <ul>
            <li v-for="(item, idx) in suggestions" :key="idx">
              <el-icon><Check /></el-icon>
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </el-card>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import * as echarts from 'echarts'
import {
  Camera, Warning, TrendCharts, DataLine, PieChart, ChatDotRound,
  Check
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getScanHistory } from '@/api/scanHistory'

const userStore = useUserStore()
const { username, userId, allergies } = storeToRefs(userStore)

const totalScans = ref(0)
const totalAlerts = ref(0)
const healthScore = ref(80)

const suggestions = ref([])

// 图表实例
let trendChart = null
let allergyChart = null
const trendChartRef = ref(null)
const allergyChartRef = ref(null)

const trendData = ref({
  dates: [],
  counts: []
})

const allergyDistribution = ref([])

// 初始化趋势图
const initTrendChart = () => {
  if (!trendChartRef.value) return
  trendChart = echarts.init(trendChartRef.value)
  trendChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { top: 20, left: 35, right: 10, bottom: 10, containLabel: true },
    xAxis: { type: 'category', data: trendData.value.dates, axisLabel: { rotate: 30 } },
    yAxis: { type: 'value', name: '扫描次数' },
    series: [{
      data: trendData.value.counts,
      type: 'line',
      smooth: true,
      lineStyle: { color: '#409EFF', width: 3 },
      areaStyle: { opacity: 0.1, color: '#409EFF' },
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: { color: '#409EFF' }
    }]
  })
}

// 初始化过敏分布图
const initAllergyChart = () => {
  if (!allergyChartRef.value) return
  allergyChart = echarts.init(allergyChartRef.value)
  allergyChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left', textStyle: { fontSize: 11 } },
    series: [{
      type: 'pie',
      radius: '55%',
      center: ['50%', '55%'],
      data: allergyDistribution.value.map(item => ({
        name: item.name,
        value: item.value,
        itemStyle: { color: item.color }
      })),
      label: { show: true, formatter: '{b}: {d}%', fontSize: 11 },
      emphasis: { scale: true }
    }]
  })
}

// 窗口大小适配
const handleResize = () => {
  trendChart?.resize()
  allergyChart?.resize()
}

const computeTrendData = (records) => {
  const now = new Date()
  const dateList = []
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(now)
    date.setDate(now.getDate() - i)
    const label = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`
    dateList.push(label)
  }
  const countMap = new Map(dateList.map((item) => [item, 0]))
  records.forEach((item) => {
    const scanDate = new Date(item.scannedAt || item.time || Date.now())
    const label = `${String(scanDate.getMonth() + 1).padStart(2, '0')}-${String(
      scanDate.getDate(),
    ).padStart(2, '0')}`
    if (countMap.has(label)) {
      countMap.set(label, countMap.get(label) + 1)
    }
  })

  trendData.value = {
    dates: dateList,
    counts: dateList.map((item) => countMap.get(item)),
  }
}

const computeAllergyDistribution = (records) => {
  const allergenCounter = {}
  records.forEach((record) => {
    if (!record.hasAllergen) return
    const list = Array.isArray(record.matchedAllergens) ? record.matchedAllergens : []
    list.forEach((allergen) => {
      allergenCounter[allergen] = (allergenCounter[allergen] || 0) + 1
    })
  })
  const colorPool = ['#F56C6C', '#E6A23C', '#67C23A', '#909399', '#409EFF']
  allergyDistribution.value = Object.entries(allergenCounter).map(([name, value], idx) => ({
    name,
    value,
    color: colorPool[idx % colorPool.length],
  }))
}

const computeSuggestions = (records) => {
  const userAllergies = allergies.value || []
  const hasWarnings = records.some((item) => item.hasAllergen)
  const safeRate = totalScans.value
    ? Math.round(((totalScans.value - totalAlerts.value) / totalScans.value) * 100)
    : 100
  suggestions.value = [
    userAllergies.length
      ? `已为您关注过敏源：${userAllergies.join("、")}，扫描时会优先提醒相关风险。`
      : "建议先在档案页设置过敏源，系统可提供更准确的安全提醒。",
    hasWarnings
      ? "近期存在过敏警报记录，建议优先查看详情页成分标注。"
      : "近期未出现过敏警报，当前选择较为安全，继续保持。",
    `最近扫描安全率约为 ${safeRate}% ，建议优先选择匹配度更高的商品。`,
    "可在社区页查看同类商品评论，结合价格趋势做出更稳妥选择。",
  ]
}

const loadDashboardData = async () => {
  if (!userId.value) return
  const records = await getScanHistory(userId.value)
  totalScans.value = records.length
  totalAlerts.value = records.filter((item) => item.hasAllergen).length
  if (records.length > 0) {
    const averageScore = Math.round(
      records.reduce((sum, item) => sum + (item.matchScore || 0), 0) / records.length,
    )
    healthScore.value = averageScore
  } else {
    healthScore.value = 80
  }
  computeTrendData(records)
  computeAllergyDistribution(records)
  computeSuggestions(records)
}

onMounted(() => {
  userStore.hydrateFromStorage()
  loadDashboardData()
    .catch(() => {})
    .finally(() => {
      initTrendChart()
      initAllergyChart()
      window.addEventListener('resize', handleResize)
    })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  allergyChart?.dispose()
})
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 页面头部（渐变背景） */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 24px 30px;
  border-radius: 0 0 24px 24px;
  color: white;
}
.greeting {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
}
.welcome-title {
  font-size: 14px;
  opacity: 0.9;
}

/* 主要内容区 */
.dashboard-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 16px;
}

/* 统计卡片行 */
.stats-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.stat-card {
  flex: 1;
  border-radius: 16px;
  border: 1px solid #e4e7ed;
}
:deep(.stat-card .el-card__body) {
  display: flex;
  align-items: center;
  padding: 16px;
}
.stat-icon {
  margin-right: 12px;
  color: #409eff;
  font-size: 28px;
}
.stat-info {
  flex: 1;
}
.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}
.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

/* 图表卡片 */
.chart-card {
  margin-bottom: 12px;
  border-radius: 16px;
  border: 1px solid #e4e7ed;
}
:deep(.chart-card .el-card__header) {
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
}
:deep(.chart-card .el-card__body) {
  padding: 12px;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 14px;
}
.chart-container {
  width: 100%;
  height: 220px;
}

/* 建议卡片 */
.suggestion-card {
  margin-bottom: 12px;
  border-radius: 16px;
  border: 1px solid #e4e7ed;
}
.suggestion-content ul {
  margin: 0;
  padding-left: 20px;
}
.suggestion-content li {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #606266;
}
.suggestion-content li:last-child {
  margin-bottom: 0;
}
.suggestion-content .el-icon {
  color: #67c23a;
}

/* 快捷操作卡片 */
.action-card {
  margin-bottom: 12px;
  border-radius: 16px;
  border: 1px solid #e4e7ed;
}
.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.action-buttons .el-button {
  flex: 1;
}

/* 响应式 */
@media (max-width: 768px) {
  .dashboard-content {
    padding: 8px;
  }
  .stats-row {
    gap: 8px;
  }
  .stat-card {
    min-width: calc(33.33% - 8px);
  }
  .stat-value {
    font-size: 20px;
  }
  .stat-icon {
    font-size: 24px;
  }
  .chart-container {
    height: 180px;
  }
  .action-buttons {
    flex-direction: column;
  }
}
</style>