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
          <div class="product-emoji">{{ product.image || "📦" }}</div>
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-barcode">条码：{{ barcode }}</p>
            <p class="product-category" v-if="product.category">
              分类：{{ product.category }}
            </p>
          </div>
        </div>
      </el-card>

      <!-- 匹配度评分卡片 -->
      <el-card class="score-card" shadow="hover">
        <MatchScoreBar
          :percentage="matchScore"
          :tip="matchTip"
          :show-value="true"
        />
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
            <el-tag
              v-for="item in allergenDetail"
              :key="item"
              type="danger"
              size="small"
            >
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
          <div
            v-for="ing in product.ingredients"
            :key="ing"
            class="ingredient-item"
          >
            <span :class="{ 'ingredient-allergen': isAllergen(ing) }">
              {{ ing }}
              <el-tag
                v-if="isAllergen(ing)"
                type="danger"
                size="small"
                effect="dark"
                >过敏</el-tag
              >
            </span>
          </div>
        </div>
        <div class="nutrition-info" v-if="product.nutrition">
          <div class="sub-title">营养信息</div>
          <div class="nutrition-grid">
            <div
              v-for="(value, key) in product.nutrition"
              :key="key"
              class="nutrition-item"
            >
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
            <span>价格趋势（近5次）</span>
          </div>
        </template>
        <div class="price-current">
          <span class="label">当前参考价</span>
          <span class="value">{{ currentPrice }}</span>
        </div>
        <!-- 新增：图表容器 -->
        <div
          v-if="priceHistory.length"
          ref="priceChartRef"
          class="price-chart"
        ></div>
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
          <div v-if="comments.length === 0" class="empty-comment">
            暂无评论，快来发表第一条吧~
          </div>
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
            <el-button type="primary" @click="postComment" :loading="submitting"
              >发表评论</el-button
            >
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
import { ref, computed, onMounted, watch, nextTick, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import MatchScoreBar from "@/components/MatchScoreBar.vue";
import {
  ArrowLeft,
  Warning,
  List,
  TrendCharts,
  ChatDotRound,
  User,
  CircleCloseFilled,
  SuccessFilled,
} from "@element-plus/icons-vue";
import * as echarts from "echarts";
import { getProductByBarcode } from "@/api/product.js";
import { createComment, getComments } from "@/api/comments.js";
import { useUserStore } from "@/stores/user";

const route = useRoute();
const barcode = route.params.barcode;
const userStore = useUserStore();
const { allergies, userId, username } = storeToRefs(userStore);

const priceChartRef = ref(null);
let priceChart = null;

// 从 product 中提取价格历史（格式需适配）
const priceHistory = computed(() => {
  const ph = product.value?.prices || [];
  // 假设 prices 是 [{ date: '2025-04-01', price: 39.9 }, ...]
  return ph.slice(-5); // 取最近5条
});

// 当前价格（最新一条）
const currentPrice = computed(() => {
  if (priceHistory.value.length === 0) return "暂无";
  const latest = priceHistory.value[priceHistory.value.length - 1];
  return `¥${latest.price.toFixed(1)}`;
});

// 初始化图表
const initPriceChart = () => {
  if (!priceChartRef.value || priceHistory.value.length === 0) return;

  if (priceChart) priceChart.dispose();
  priceChart = echarts.init(priceChartRef.value);

  const dates = priceHistory.value.map((item) => item.date.slice(5)); // 取 MM-DD
  const prices = priceHistory.value.map((item) => item.price);

  priceChart.setOption({
    grid: { top: 20, left: 40, right: 10, bottom: 20, containLabel: true },
    xAxis: {
      type: "category",
      data: dates,
      axisLabel: { fontSize: 11, rotate: 30 },
    },
    yAxis: {
      type: "value",
      name: "价格 (¥)",
      nameTextStyle: { fontSize: 11 },
      axisLabel: { fontSize: 11 },
    },
    series: [
      {
        data: prices,
        type: "line",
        smooth: true,
        lineStyle: { color: "#E6A23C", width: 3 },
        areaStyle: { opacity: 0.1, color: "#E6A23C" },
        symbol: "circle",
        symbolSize: 6,
        itemStyle: { color: "#E6A23C" },
      },
    ],
    tooltip: { trigger: "axis" },
  });
};

// 监听 priceHistory 变化重新绘图
watch(priceHistory, () => {
  nextTick(() => initPriceChart());
});

// 组件卸载时销毁图表
onBeforeUnmount(() => {
  priceChart?.dispose();
});

const UNKNOWN = {
  id: 0,
  name: "未收录商品",
  image: "📦",
  ingredients: ["暂无成分信息"],
  priceHistory: [0],
  category: "其他",
};

// 辅助函数：生成友好时间文本
const formatTimeText = (timestamp) => {
  const diff = Date.now() - timestamp;
  if (diff < 60 * 1000) return "刚刚";
  if (diff < 3600 * 1000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400 * 1000) return `${Math.floor(diff / 3600000)}小时前`;
  return new Date(timestamp).toLocaleDateString();
};

const normalizeComments = (list) => {
  return list.map((c) => ({
    ...c,
    timeText: formatTimeText(c.timestamp || Date.now()),
  }));
};

// ---------- 页面数据 ----------
const product = ref(null);
const comments = ref([]);
const loading = ref(false);
const submitting = ref(false);
const newComment = ref("");
const rating = ref(0);

// 加载商品和评论
const loadData = async () => {
  loading.value = true;
  try {
    const [productData, commentData] = await Promise.all([
      getProductByBarcode(barcode),
      getComments(barcode),
    ]);
    product.value = productData;
    comments.value = normalizeComments(commentData).sort(
      (a, b) => (b.timestamp || 0) - (a.timestamp || 0),
    );
  } catch {
    product.value = { ...UNKNOWN };
    comments.value = [];
  } finally {
    loading.value = false;
  }
};

const postComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning("请输入评论内容");
    return;
  }
  if (!product.value || product.value.id === 0) {
    ElMessage.warning("商品不存在，无法评论");
    return;
  }
  submitting.value = true;

  try {
    const payload = {
      userId: userId.value || 0,
      userName: username.value || "当前用户",
      productId: barcode,
      productBarcode: barcode,
      productName: product.value.name || "未知商品",
      content: newComment.value.trim(),
      rating: rating.value,
      timestamp: Date.now(),
    };

    const created = await createComment(payload);
    comments.value.unshift({
      ...created,
      timeText: "刚刚",
    });
    ElMessage.success("评论成功！");
    newComment.value = "";
    rating.value = 0;
  } catch (error) {
    ElMessage.error(error.message || "发表评论失败");
  } finally {
    submitting.value = false;
  }
};

// 过敏检测
const hasAllergen = computed(() => {
  if (!product.value?.ingredients) return false;
  return product.value.ingredients.some((ing) =>
    allergens.value.some((a) => ing.includes(a)),
  );
});
const allergenList = computed(() => {
  if (!product.value?.ingredients) return "";
  const matched = product.value.ingredients.filter((ing) =>
    allergens.value.some((a) => ing.includes(a)),
  );
  return matched.join("、");
});
const allergenDetail = computed(() => {
  if (!product.value?.ingredients) return [];
  return product.value.ingredients.filter((ing) =>
    allergens.value.some((a) => ing.includes(a)),
  );
});
const isAllergen = (ing) => allergens.value.some((a) => ing.includes(a));

// 匹配度评分
const matchScore = computed(() => {
  if (!product.value) return 0;
  let score = 80;
  if (hasAllergen.value) score -= 40;
  if (
    product.value.name?.includes("全麦") ||
    product.value.name?.includes("有机")
  )
    score += 5;
  return Math.min(100, Math.max(0, score));
});
const matchTip = computed(() => {
  if (matchScore.value >= 80) return "非常适合您";
  if (matchScore.value >= 60) return "基本符合需求";
  return "含有过敏或不适合的成分，请谨慎";
});

onMounted(() => {
  userStore.hydrateFromStorage();
  loadData();
});
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

.price-chart {
  width: 100%;
  height: 180px;
  margin-top: 12px;
}
</style>
