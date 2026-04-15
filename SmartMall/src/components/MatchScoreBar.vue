<template>
  <div class="score-section">
    <div class="score-header">
      <span class="score-label">{{ label }}</span>
      <span v-if="showValue" class="score-value">{{ percentage }}分</span>
    </div>
    <el-progress :percentage="percentage" :color="progressColor" :stroke-width="strokeWidth" />
    <div v-if="tip" class="score-tip">{{ tip }}</div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  percentage: {
    type: Number,
    default: 0,
  },
  label: {
    type: String,
    default: "匹配度评分",
  },
  tip: {
    type: String,
    default: "",
  },
  showValue: {
    type: Boolean,
    default: false,
  },
  strokeWidth: {
    type: Number,
    default: 8,
  },
});

const progressColor = computed(() => {
  if (props.percentage >= 80) return "#67C23A";
  if (props.percentage >= 60) return "#E6A23C";
  return "#F56C6C";
});
</script>

<style scoped>
.score-section {
  margin-bottom: 0;
}

.score-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.score-label {
  font-size: 13px;
}

.score-value {
  font-size: 14px;
  font-weight: 600;
  color: #409eff;
}

.score-tip {
  font-size: 12px;
  color: #606266;
  margin-top: 8px;
}
</style>
