<template>
  <div class="user-profile-simple">
    <!-- 页面标题和返回按钮 -->
    <div class="profile-header">
      <el-button type="text" @click="$router.back()" class="back-btn">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <h2>用户档案设置</h2>
    </div>

    <!-- 主要内容区域 -->
    <div class="profile-content-simple">
      <!-- 过敏源设置卡片 -->
      <el-card class="allergy-card-simple" shadow="hover">
        <template #header>
          <div class="card-header-simple">
            <div class="card-title-area">
              <el-icon :size="20" class="card-icon"><Warning /></el-icon>
              <h3 class="card-title">过敏源设置</h3>
            </div>
            <span class="card-subtitle"
              >勾选后，扫描商品时会自动提醒含有该成分</span
            >
          </div>
        </template>

        <div class="allergy-content-simple">
          <!-- 常用过敏源选择 -->
          <div class="section-block">
            <div class="section-title">
              <span class="title-text">常用过敏源</span>
              <span class="title-hint">（多选）</span>
            </div>
            <div class="allergy-tags">
              <el-tag
                v-for="item in commonAllergies"
                :key="item.id"
                :class="{ selected: userAllergies.includes(item.name) }"
                class="allergy-tag"
                @click="toggleAllergy(item.name)"
              >
                {{ item.name }}
              </el-tag>
            </div>
          </div>

          <!-- 自定义过敏源 -->
          <div class="section-block">
            <div class="section-title">
              <span class="title-text">自定义过敏源</span>
              <span class="title-hint">（输入后按回车添加）</span>
            </div>

            <div class="custom-allergy-area">
              <div class="custom-tags-display">
                <el-tag
                  v-for="tag in customAllergies"
                  :key="tag"
                  closable
                  type="warning"
                  @close="removeCustomAllergy(tag)"
                  class="custom-tag"
                >
                  {{ tag }}
                </el-tag>
                <span v-if="customAllergies.length === 0" class="empty-tips">
                  暂无自定义过敏源
                </span>
              </div>

              <div class="custom-input-area">
                <el-input
                  v-model="newAllergy"
                  placeholder="输入其他过敏源，如：花粉"
                  clearable
                  @keyup.enter="addCustomAllergy"
                  @clear="newAllergy = ''"
                  class="custom-input"
                >
                  <template #append>
                    <el-button
                      @click="addCustomAllergy"
                      :disabled="!newAllergy.trim()"
                      class="add-btn"
                    >
                      添加
                    </el-button>
                  </template>
                </el-input>
              </div>
            </div>
          </div>

          <!-- 提示信息 -->
          <div class="tips-block">
            <el-alert
              title="安全提示"
              type="warning"
              :closable="false"
              show-icon
              class="warning-alert"
            >
              <p class="alert-content">
                请务必准确设置所有过敏源，系统将根据您的设置进行安全检测和提醒。
              </p>
            </el-alert>
          </div>
        </div>

        <!-- 修改：过敏源设置按钮垂直布局容器 -->
        <div class="allergy-actions-vertical">
          <el-button
            type="primary"
            @click="saveAllergies"
            :loading="savingAllergies"
            class="save-btn"
          >
            <el-icon><Check /></el-icon>
            保存过敏源设置
          </el-button>
          <el-button
            type="info"
            plain
            @click="resetAllergies"
            class="reset-btn"
          >
            <el-icon><Refresh /></el-icon>
            恢复默认
          </el-button>
        </div>
      </el-card>

      <!-- 饮食习惯设置卡片 -->
      <el-card class="diet-card-simple" shadow="hover">
        <template #header>
          <div class="card-header-simple">
            <div class="card-title-area">
              <el-icon :size="20" class="card-icon"><Food /></el-icon>
              <h3 class="card-title">饮食习惯设置</h3>
            </div>
            <span class="card-subtitle">用于匹配度评分和个性化推荐</span>
          </div>
        </template>

        <div class="diet-content-simple">
          <div class="section-block">
            <div class="section-title">
              <span class="title-text">选择您的饮食偏好</span>
              <span class="title-hint">（可多选）</span>
            </div>

            <div class="diet-options-grid">
              <div
                v-for="item in dietOptions"
                :key="item.id"
                :class="{ selected: userDietPreferences.includes(item.name) }"
                class="diet-option-item"
                @click="toggleDietPreference(item.name)"
              >
                <div class="diet-option-text">
                  <div class="option-name">{{ item.name }}</div>
                  <div class="option-desc">{{ item.desc }}</div>
                </div>
                <div
                  v-if="userDietPreferences.includes(item.name)"
                  class="selected-mark"
                >
                  <el-icon color="#409EFF"><Check /></el-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- 提示信息 -->
          <div class="tips-block">
            <el-alert
              title="匹配度说明"
              type="success"
              :closable="false"
              show-icon
              class="success-alert"
            >
              <p class="alert-content">
                根据您的饮食偏好，我们会对扫描的商品进行匹配度评分，帮助您做出更合适的购物选择。
              </p>
            </el-alert>
          </div>
        </div>

        <!-- 修改：按钮垂直布局容器 -->
        <div class="diet-actions-vertical">
          <el-button
            type="primary"
            @click="saveDietPreferences"
            :loading="savingDiet"
            class="save-btn"
          >
            <el-icon><Check /></el-icon>
            保存饮食习惯
          </el-button>
          <el-button
            type="info"
            plain
            @click="resetDietPreferences"
            class="reset-btn"
          >
            <el-icon><Refresh /></el-icon>
            恢复默认
          </el-button>
        </div>
      </el-card>

      <!-- 设置状态提示 -->
      <div class="status-panel">
        <div class="status-item">
          <div class="status-label">过敏源数量：</div>
          <div class="status-value">
            {{ userAllergies.length + customAllergies.length }} 项
          </div>
        </div>
        <div class="status-item">
          <div class="status-label">饮食习惯：</div>
          <div class="status-value">{{ userDietPreferences.length }} 项</div>
        </div>
        <div class="status-item">
          <div class="status-label">最后更新：</div>
          <div class="status-value">{{ lastUpdateTime || "尚未保存" }}</div>
        </div>
      </div>
    </div>

    <!-- 保存成功提示 -->
    <el-dialog
      v-model="saveSuccessVisible"
      title="保存成功"
      width="320px"
      center
      :show-close="false"
    >
      <div class="save-success-content">
        <el-icon color="#67C23A" :size="48"><CircleCheck /></el-icon>
        <p class="success-text">用户档案已更新</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="saveSuccessVisible = false"
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const { allergies, dietPreferences } = storeToRefs(userStore);
const userAllergies = ref([]);
const customAllergies = ref([]);
const userDietPreferences = computed({
  get: () => dietPreferences.value,
  set: (value) => userStore.setDietPreferences(value),
});
const newAllergy = ref("");
const lastUpdateTime = ref("");
const saveSuccessVisible = ref(false);

// 加载状态
const savingAllergies = ref(false);
const savingDiet = ref(false);

// 常用过敏源数据
const commonAllergies = [
  { id: 1, name: "花生" },
  { id: 2, name: "牛奶" },
  { id: 3, name: "鸡蛋" },
  { id: 4, name: "海鲜" },
  { id: 5, name: "大豆" },
  { id: 6, name: "坚果" },
  { id: 7, name: "麸质" },
  { id: 8, name: "芒果" },
];
const commonAllergySet = new Set(commonAllergies.map((item) => item.name));

// 饮食习惯选项
const dietOptions = [
  { id: 1, name: "素食", desc: "不含任何肉类制品" },
  { id: 2, name: "低碳水", desc: "控制碳水化合物摄入" },
  { id: 3, name: "低脂", desc: "低脂肪含量" },
  { id: 4, name: "低糖", desc: "控制糖分摄入" },
  { id: 5, name: "无添加糖", desc: "不含额外添加的糖" },
  { id: 6, name: "无防腐剂", desc: "不含人工防腐剂" },
  { id: 7, name: "无人工色素", desc: "不含人工色素" },
];

// 初始化用户数据（从 Pinia 恢复）
const initUserData = () => {
  userStore.hydrateFromStorage();
  const allAllergies = Array.isArray(allergies.value) ? allergies.value : [];
  userAllergies.value = allAllergies.filter((item) => commonAllergySet.has(item));
  customAllergies.value = allAllergies.filter((item) => !commonAllergySet.has(item));
  lastUpdateTime.value = "";
};

// 切换过敏源选择
const toggleAllergy = (allergy) => {
  const index = userAllergies.value.indexOf(allergy);
  if (index === -1) {
    userAllergies.value.push(allergy);
  } else {
    userAllergies.value.splice(index, 1);
  }
};

// 添加自定义过敏源
const addCustomAllergy = () => {
  const allergy = newAllergy.value.trim();
  if (allergy && !customAllergies.value.includes(allergy)) {
    customAllergies.value.push(allergy);
    newAllergy.value = "";
    ElMessage.success(`已添加自定义过敏源: ${allergy}`);
  } else if (customAllergies.value.includes(allergy)) {
    ElMessage.warning("该过敏源已存在");
  }
};

// 删除自定义过敏源
const removeCustomAllergy = (allergy) => {
  const index = customAllergies.value.indexOf(allergy);
  if (index !== -1) {
    customAllergies.value.splice(index, 1);
    ElMessage.info(`已移除自定义过敏源: ${allergy}`);
  }
};

// 保存过敏源设置
const saveAllergies = async () => {
  savingAllergies.value = true;

  try {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const allAllergies = [...userAllergies.value, ...customAllergies.value];
    userStore.setAllergies(allAllergies);
    lastUpdateTime.value = new Date().toLocaleString();
    showSaveSuccess();
    ElMessage.success("过敏源设置已保存");
  } catch {
    ElMessage.error("保存失败，请重试");
  } finally {
    savingAllergies.value = false;
  }
};

// 重置过敏源为默认值 - 新增方法
const resetAllergies = () => {
  userAllergies.value = [];
  customAllergies.value = [];
  userStore.setAllergies([]);
  ElMessage.info("过敏源设置已恢复默认");
};

// 切换饮食习惯选择
const toggleDietPreference = (preference) => {
  const index = userDietPreferences.value.indexOf(preference);
  if (index === -1) {
    userDietPreferences.value.push(preference);
  } else {
    userDietPreferences.value.splice(index, 1);
  }
};

// 保存饮食习惯设置
const saveDietPreferences = async () => {
  savingDiet.value = true;

  try {
    await new Promise((resolve) => setTimeout(resolve, 800));
    userStore.setDietPreferences(userDietPreferences.value);
    lastUpdateTime.value = new Date().toLocaleString();
    showSaveSuccess();
    ElMessage.success("饮食习惯设置已保存");
  } catch {
    ElMessage.error("保存失败，请重试");
  } finally {
    savingDiet.value = false;
  }
};

// 重置饮食习惯为默认值
const resetDietPreferences = () => {
  userStore.setDietPreferences([]);
  ElMessage.info("饮食习惯设置已恢复默认");
};

// 显示保存成功提示
const showSaveSuccess = () => {
  saveSuccessVisible.value = true;
};

// 页面加载时初始化数据
onMounted(() => {
  initUserData();
});
</script>

<style scoped>
.user-profile-simple {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 16px;
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 8px;
}

.back-btn {
  margin-right: 12px;
}

.profile-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.profile-content-simple {
  max-width: 800px;
  margin: 0 auto;
}

/* 卡片通用样式 */
.allergy-card-simple,
.diet-card-simple {
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

/* 区块样式 */
.section-block {
  margin-bottom: 24px;
}

.section-title {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.title-text {
  font-size: 16px;
  font-weight: 500;
  color: #606266;
  margin-right: 6px;
}

.title-hint {
  font-size: 13px;
  color: #909399;
}

/* 过敏源标签样式 */
.allergy-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.allergy-tag {
  padding: 15px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2.8px solid #dcdfe6;
  background-color: white;
}

.allergy-tag:hover {
  border-color: #c0c4cc;
  transform: translateY(-2px);
}

.allergy-tag.selected {
  background-color: #ecf5ff;
  border-color: #409eff;
  color: #409eff;
  font-weight: 500;
}

/* 自定义过敏源区域 */
.custom-allergy-area {
  background-color: #fafafa;
  border-radius: 8px;
  padding: 16px;
}

.custom-tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  min-height: 32px;
  align-items: center;
}

.custom-tag {
  font-size: 14px;
  padding: 6px 12px;
}

.empty-tips {
  font-size: 13px;
  color: #c0c4cc;
  font-style: italic;
}

.custom-input-area {
  width: 100%;
}

.add-btn {
  background-color: #409eff;
  color: white;
}

.add-btn:hover {
  background-color: #66b1ff;
}

/* 饮食习惯选项 */
.diet-options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); 
  gap: 8px;
}

.diet-option-item {
  background-color: white;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  min-height: 100px; /* 设置最小高度 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.diet-option-item:hover {
  border-color: #c0c4cc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.diet-option-item.selected {
  border-color: #409eff;
  background-color: #f0f9ff;
}



.option-icon {
  color: #606266;
}

.diet-option-item.selected .option-icon {
  color: #409eff;
}

.diet-option-text {
  text-align: center;
}

.option-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.option-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.selected-mark {
  position: absolute;
  top: 8px;
  right: 8px;
}

/* 提示信息区块 */
.tips-block {
  margin-top: 24px;
}

.warning-alert,
.success-alert {
  border-radius: 8px;
}
.warning-alert {
  background: linear-gradient(135deg, #fdf6ec 0%, #fde2e2 100%);
}
.success-alert {
  background: linear-gradient(135deg, #f0f9eb 0%, #e8f4ff 100%);
}

.alert-content {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
}

/* 删除原有的card-actions-simple样式 */

/* 修改：过敏源设置按钮垂直布局 */
.allergy-actions-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
  margin-top: 20px;
}

.allergy-actions-vertical .save-btn,
.allergy-actions-vertical .reset-btn {
  width: 200px;
  justify-content: center;
}
.allergy-actions-vertical .reset-btn {
  margin-left: 0px;
}

/* 修改：饮食习惯按钮垂直布局 */
.diet-actions-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
  margin-top: 20px;
}

.diet-actions-vertical .save-btn,
.diet-actions-vertical .reset-btn {
  width: 200px;
  justify-content: center;
}

.diet-actions-vertical .reset-btn {
  margin-left: 0px;
}
/* 状态面板 */
.status-panel {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  border: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 20px;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 150px;
}

.status-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.status-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

/* 保存成功弹窗 */
.save-success-content {
  text-align: center;
  padding: 20px 0;
}

.success-text {
  margin-top: 16px;
  font-size: 16px;
  color: #303133;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .profile-content-simple {
    padding: 0 8px;
  }

  .diet-options-grid {
  grid-template-columns: fr ; 
  }

  .diet-option-item {
    padding: 1px;
  }

  .status-panel {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .status-item {
    flex-direction: row;
    align-items: center;
    min-width: auto;
  }

  .status-label {
    margin-bottom: 0;
    margin-right: 8px;
  }

  .allergy-actions-vertical .save-btn,
  .allergy-actions-vertical .reset-btn,
  .diet-actions-vertical .save-btn,
  .diet-actions-vertical .reset-btn {
    width: 100%;
  }
}
@media (max-width: 300px) {
  .allergy-tags {
    justify-content: center;
  }

  .diet-options-grid {
    grid-template-columns: 1fr;
  }
}

</style>
