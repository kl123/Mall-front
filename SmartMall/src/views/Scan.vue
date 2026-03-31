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
      <!-- 过敏源展示卡片 -->
      <el-card class="allergy-card-simple" shadow="hover">
        <template #header>
          <div class="card-header-simple">
            <div class="card-title-area">
              <el-icon :size="20" class="card-icon"><Warning /></el-icon>
              <h3 class="card-title">我的过敏源</h3>
            </div>
            <span class="card-subtitle">扫描商品时会自动检测这些成分</span>
          </div>
        </template>

        <div class="allergy-content">
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
          <div class="allergy-actions">
            <el-button type="primary" plain size="small" @click="editAllergy">
              <el-icon><Edit /></el-icon> 编辑过敏源
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 扫描卡片 -->
      <el-card class="scan-card-simple" shadow="hover">
        <template #header>
          <div class="card-header-simple">
            <div class="card-title-area">
              <el-icon :size="20" class="card-icon"><Camera /></el-icon>
              <h3 class="card-title">扫描商品</h3>
            </div>
            <span class="card-subtitle">将摄像头对准商品条码</span>
          </div>
        </template>

        <div class="scan-content">
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
      </el-card>

      <!-- 手动输入卡片 -->
      <el-card class="manual-card-simple" shadow="hover">
        <template #header>
          <div class="card-header-simple">
            <div class="card-title-area">
              <el-icon :size="20" class="card-icon"><Search /></el-icon>
              <h3 class="card-title">手动输入条码</h3>
            </div>
          </div>
        </template>

        <div class="manual-area">
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

      <!-- 商品信息卡片 -->
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
          <div class="score-section">
            <div class="score-label">匹配度评分</div>
            <el-progress
              :percentage="matchScore"
              :color="scoreColor"
              :stroke-width="8"
            />
          </div>

          <!-- 过敏提醒 -->
          <el-alert
            v-if="hasAllergen"
            :title="`⚠️ 包含过敏成分：${allergenList}`"
            type="warning"
            show-icon
            :closable="false"
            class="warning-alert"
          />
          <el-alert
            v-else
            title="✅ 未检测到您的过敏源，相对安全"
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
                {{ ing }}{{ isAllergen(ing) ? " ⚠️" : "" }}
              </el-tag>
            </div>
          </div>

          <!-- 价格趋势 -->
          <div class="price-section">
            <div class="section-title">💰 价格趋势</div>
            <div class="price-trend">{{ priceTrend }}</div>
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
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  ArrowLeft,
  Warning,
  Edit,
  Camera,
  VideoCamera,
  VideoCameraFilled,
  Search,
  Goods,
  Clock,
  Delete,
  ArrowRight,
} from "@element-plus/icons-vue";
import { Html5Qrcode } from "html5-qrcode";

// ---------- 用户过敏源 ----------
const allergens = ref([])   // 初始为空

const editAllergy = async () => {
  const { value } = await ElMessageBox.prompt(
    "请输入过敏源（例如：花生,虾,牛奶）",
    "编辑过敏源",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      inputValue: allergens.value.join(","),
      inputValidator: (val) => {
        if (!val) return "不能为空";
        return true;
      },
    },
  );
if (value) {
  // 支持中文逗号、空格，统一替换为英文逗号
  let processedValue = value.replace(/，/g, ',').replace(/\s+/g, ',');
  allergens.value = processedValue
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s);
  localStorage.setItem("user_allergens", JSON.stringify(allergens.value));
  ElMessage.success("过敏源已更新");
}
};

const loadAllergens = () => {
  const stored = localStorage.getItem("user_allergens");
  if (stored) {
    try {
      allergens.value = JSON.parse(stored);
    } catch (e) {}
  }
};

// ---------- 商品数据（模拟） ----------
const MOCK_PRODUCTS = {
  6901234567892: {
    name: "每日坚果",
    image: "🌰",
    ingredients: ["杏仁", "核桃", "花生", "蔓越莓"],
    priceHistory: [39.9, 42.9, 39.9, 38.5],
  },
  6971234567890: {
    name: "全麦面包",
    image: "🍞",
    ingredients: ["全麦粉", "酵母", "食盐"],
    priceHistory: [12.9, 12.9, 13.5, 12.5],
  },
  4891234567893: {
    name: "虾仁三明治",
    image: "🥪",
    ingredients: ["面包", "虾仁", "蛋黄酱"],
    priceHistory: [22.9, 23.5, 24.9, 23.9],
  },
};
const UNKNOWN = {
  name: "未收录商品",
  image: "📦",
  ingredients: ["暂无成分信息"],
  priceHistory: [0],
};

const getProduct = (barcode) => {
  return MOCK_PRODUCTS[barcode]
    ? { ...MOCK_PRODUCTS[barcode] }
    : { ...UNKNOWN };
};

// ---------- 扫描相关 ----------
let scanner = null;
const isScanning = ref(false);
const manualBarcode = ref("");
const product = ref(null);
const currentBarcode = ref("");

// 过敏检测
const hasAllergen = computed(() => {
  if (!product.value) return false;
  return product.value.ingredients.some((ing) =>
    allergens.value.some((a) => ing.includes(a)),
  );
});
const allergenList = computed(() => {
  if (!product.value) return "";
  const matched = product.value.ingredients.filter((ing) =>
    allergens.value.some((a) => ing.includes(a)),
  );
  return matched.join("、");
});
const isAllergen = (ing) => allergens.value.some((a) => ing.includes(a));

// 匹配度评分
const matchScore = computed(() => {
  if (!product.value) return 0;
  let score = 80;
  if (hasAllergen.value) score -= 40;
  if (
    product.value.name.includes("全麦") ||
    product.value.name.includes("有机")
  )
    score += 5;
  return Math.min(100, Math.max(0, score));
});

// 进度条颜色
const scoreColor = computed(() => {
  if (matchScore.value >= 80) return "#67C23A";
  if (matchScore.value >= 60) return "#E6A23C";
  return "#F56C6C";
});

// 价格趋势
const priceTrend = computed(() => {
  if (!product.value || !product.value.priceHistory.length)
    return "暂无价格数据";
  const prices = product.value.priceHistory;
  const latest = prices[prices.length - 1];
  const prev = prices[prices.length - 2] || latest;
  if (latest > prev) return `📈 上涨  ¥${latest.toFixed(1)}`;
  if (latest < prev) return `📉 下降  ¥${latest.toFixed(1)}`;
  return `➖ 平稳  ¥${latest.toFixed(1)}`;
});

// 处理条码
const handleBarcode = (barcode) => {
  if (currentBarcode.value === barcode) return;
  currentBarcode.value = barcode;
  product.value = getProduct(barcode);
  addToHistory(barcode, product.value.name);
  stopScan();
};

// 手动查询
const searchByBarcode = () => {
  if (!manualBarcode.value.trim()) {
    ElMessage.warning("请输入条码");
    return;
  }
  handleBarcode(manualBarcode.value.trim());
  manualBarcode.value = "";
};

// 扫描历史
const STORAGE_KEY = "smart_scan_history";
const history = ref([]);

const addToHistory = (barcode, name) => {
  history.value = history.value.filter((item) => item.barcode !== barcode);
  history.value.unshift({
    id: Date.now(),
    barcode,
    name,
    time: new Date().toLocaleString(),
  });
  if (history.value.length > 10) history.value.pop();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value));
};

const loadHistory = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      history.value = JSON.parse(stored);
    } catch (e) {}
  }
};

const clearHistory = () => {
  history.value = [];
  localStorage.removeItem(STORAGE_KEY);
  ElMessage.success("历史记录已清空");
};

const viewHistory = (barcode) => {
  handleBarcode(barcode);
};

// 摄像头控制
const startScan = async () => {
  if (isScanning.value) return;
  try {
    scanner = new Html5Qrcode("qr-reader");
    await scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 200 } },
      (decodedText) => {
        handleBarcode(decodedText);
      },
      (error) => {},
    );
    isScanning.value = true;
    ElMessage.success("摄像头已启动");
  } catch (err) {
    console.error(err);
    ElMessage.error("无法打开摄像头，请检查权限");
  }
};

const stopScan = async () => {
  if (scanner && isScanning.value) {
    await scanner.stop();
    isScanning.value = false;
    ElMessage.info("摄像头已关闭");
  }
};

onMounted(() => {
  loadAllergens();
  loadHistory();
  startScan();
});

onBeforeUnmount(() => {
  stopScan();
});
</script>

<style scoped>
.scan-page-simple {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 16px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 8px;
}

.back-btn {
  margin-right: 12px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.scan-content-simple {
  max-width: 800px;
  margin: 0 auto;
}

/* 卡片通用样式 */
.allergy-card-simple,
.scan-card-simple,
.manual-card-simple,
.product-card-simple,
.history-card-simple {
  margin-bottom: 20px;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
}

.card-header-simple {
  padding: 4px 0;
}

.card-title-area {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.card-icon {
  margin-right: 10px;
  color: #409eff;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.card-subtitle {
  font-size: 13px;
  color: #909399;
  line-height: 1.4;
}

/* 过敏源卡片内容 */
.allergy-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.allergy-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.allergy-tag {
  font-size: 14px;
  padding: 4px 12px;
}

.empty-tips {
  font-size: 13px;
  color: #909399;
}

.allergy-actions {
  flex-shrink: 0;
}

/* 扫描卡片 */
.scan-content {
  text-align: center;
}

.qr-reader {
  width: 100%;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  /* min-height: 260px; */
  margin-bottom: 16px;
}

.scan-buttons {
  display: flex;
  /* flex-direction: column; */
  gap: 12px;
  justify-content: center;
}

.scan-buttons .el-button {
  width: 100%;
}

/* 手动输入卡片 */
.manual-area {
  width: 100%;
}

/* 商品卡片 */
.product-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.score-section {
  margin-bottom: 8px;
}

.score-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.warning-alert,
.safe-alert {
  margin-bottom: 8px;
}

.ingredient-section {
  border-top: 1px solid #f0f2f5;
  padding-top: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 12px;
}

.ingredient-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ingredient-tag {
  font-size: 12px;
}

.price-section {
  border-top: 1px solid #f0f2f5;
  padding-top: 12px;
}

.price-trend {
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
}

/* 历史卡片 */
.history-list {
  display: flex;
  flex-direction: column;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f2f5;
  cursor: pointer;
  transition: background 0.2s;
}

.history-item:hover {
  background: #fafbfc;
}

.history-info {
  flex: 1;
}

.history-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.history-time {
  font-size: 12px;
  color: #909399;
}

.empty-history {
  padding: 20px 0;
}

/* 响应式 */
/* @media (max-width: 768px) {
  .scan-content-simple {
    padding: 0 8px;
  }

  .allergy-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .scan-buttons {
    flex-direction: column;
  }

  .scan-buttons .el-button {
    width: 100%;
  }
} */
</style>
