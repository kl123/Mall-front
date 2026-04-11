<template>
  <!-- H5 主容器：占满屏幕，底部留导航栏高度 -->
  <div class="h5-layout-container">
    <!-- 顶部路由视图：内容区域，自适应剩余高度 -->
    <div class="content-wrapper">
      <router-view></router-view>
    </div>

    <!-- 底部导航栏：固定在底部，H5 适配 -->
    <div class="tabbar">
      <div 
        class="tabbar-item"
        v-for="item in tabbarList"
        :key="item.path"
        @click="switchTab(item.path)"
        :class="{ active: $route.path === item.path }"
      >
        <!-- Element Plus 图标 -->
        <component :is="item.icon" class="tabbar-icon" />
        <!-- 导航文字 -->
        <span class="tabbar-text">{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// 底部导航配置：路径/名称/图标
const tabbarList = [
  { path: '/main/home', name: '首页', icon: 'House' },
  { path: '/main/scan', name: '扫描', icon: 'FullScreen' },
  { path: '/main/Community', name: '社区', icon: 'Operation' },
  { path: '/main/User', name: '我的', icon: 'Setting' }
]

// 切换导航方法
const switchTab = (path) => {
  router.push(path)
}
</script>

<style scoped>
/* 全局容器 */
.h5-layout-container {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 70px; /* 预留更多空间给美化后的导航栏 */
}

/* 美化后的底部导航栏 */
.tabbar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 92%;
  height: 56px;
  background-color: #fff;
  border-radius: 16px 16px 0 0; /* 顶部圆角 */
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08); /* 顶部阴影 */
  position: fixed;
  bottom: 0;
  left: 4%;
  z-index: 999;
  border-top: none; /* 去掉原来的上边框 */
}

/* 导航项样式 */
.tabbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 4px 0;
}

/* 选中态高亮 */
.tabbar-item.active {
  color: #409eff;
  transform: translateY(-1px); /* 轻微上浮效果 */
}

/* 图标样式 */
.tabbar-icon {
  font-size: 20px;
  margin-bottom: 3px;
  transition: all 0.2s ease;
}

.tabbar-item.active .tabbar-icon {
  font-size: 21px; /* 选中时图标放大 */
}

/* 文字样式 */
.tabbar-text {
  line-height: 1;
  font-weight: 500;
}

/* 小屏适配 */
@media (max-width: 375px) {
  .content-wrapper {
    padding-bottom: 80px;
  }
  .tabbar {
    width: 94%;
    left: 3%;
    height: 54px;
  }
}
</style>
