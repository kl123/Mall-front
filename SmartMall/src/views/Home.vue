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

      <!-- 快捷操作区 -->
      <!-- <el-card class="action-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Operation /></el-icon>
            <span>快捷操作</span>
          </div>
        </template>
        <div class="action-buttons">
          <el-button type="primary" plain @click="goToScan">
            <el-icon><Camera /></el-icon> 去扫描
          </el-button>
          <el-button type="success" plain @click="goToProfile">
            <el-icon><User /></el-icon> 编辑档案
          </el-button>
        </div>
      </el-card> -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import {
  Camera, Warning, TrendCharts, DataLine, PieChart, ChatDotRound,
  Check, Operation, User
} from '@element-plus/icons-vue'

const router = useRouter()

// 用户信息（后续可从 Pinia store 获取）
const username = ref('用户')

// 统计数据（模拟，后续从 API 获取）
const totalScans = ref(42)
const totalAlerts = ref(8)
const healthScore = ref(76)

// 个性化建议（可根据用户过敏源动态生成）
const suggestions = ref([
  '根据您的过敏源，扫描商品时请留意成分表中的“花生”和“虾”',
  '您最近扫描的“每日坚果”含有过敏成分，建议更换其他品牌',
  '您的健康评分处于中等水平，可尝试选择更多低糖、低脂商品',
  '定期查看扫描历史，了解您的消费偏好'
])

// 图表实例
let trendChart = null
let allergyChart = null
const trendChartRef = ref(null)
const allergyChartRef = ref(null)

// 模拟扫描趋势数据（近7天）
const trendData = {
  dates: ['04-01', '04-02', '04-03', '04-04', '04-05', '04-06', '今日'],
  counts: [5, 7, 3, 8, 6, 9, 4]
}

// 模拟过敏警报分布（按成分）
const allergyDistribution = [
  { name: '花生', value: 4, color: '#F56C6C' },
  { name: '虾', value: 2, color: '#E6A23C' },
  { name: '牛奶', value: 1, color: '#67C23A' },
  { name: '坚果', value: 1, color: '#909399' }
]

// 初始化趋势图
const initTrendChart = () => {
  if (!trendChartRef.value) return
  trendChart = echarts.init(trendChartRef.value)
  trendChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { top: 20, left: 35, right: 10, bottom: 10, containLabel: true },
    xAxis: { type: 'category', data: trendData.dates, axisLabel: { rotate: 30 } },
    yAxis: { type: 'value', name: '扫描次数' },
    series: [{
      data: trendData.counts,
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
      data: allergyDistribution.map(item => ({ name: item.name, value: item.value, itemStyle: { color: item.color } })),
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

// 跳转
const goToScan = () => router.push('/scan')
const goToProfile = () => router.push('/profile')

// 加载真实数据（后续替换）
const loadDashboardData = async () => {
  // 这里将来调用 API 获取统计数据、扫描历史等
  // 例如：从 localStorage 或 json-server 读取
  // 目前保持模拟数据
  console.log('仪表盘数据加载（模拟）')
}

onMounted(() => {
  loadDashboardData()
  initTrendChart()
  initAllergyChart()
  window.addEventListener('resize', handleResize)
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