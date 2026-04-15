<template>
  <div class="h5-layout-container">
    <div class="content-wrapper">
      <router-view />
    </div>

    <div class="tabbar">
      <div
        v-for="item in tabbarList"
        :key="item.path"
        class="tabbar-item"
        :class="{ active: $route.path === item.path }"
        @click="switchTab(item.path)"
      >
        <i
          v-if="item.iconClass"
          :class="[item.iconClass, 'tabbar-icon']"
          aria-hidden="true"
        ></i>
        <component v-else :is="item.icon" class="tabbar-icon" />
        <span class="tabbar-text">{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const tabbarList = [
  { path: '/main/home', name: '首页', iconClass: 'ri-home-heart-fill' },
  { path: '/main/scan', name: '扫描', iconClass: 'ri-qr-scan-ai-line' },
  { path: '/main/community', name: '社区', iconClass: 'ri-community-fill' },
  { path: '/main/user', name: '我的', iconClass: 'ri-map-pin-user-fill' },
]

const switchTab = (path) => {
  router.push(path)
}
</script>

<style scoped>
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
  padding-bottom: 70px;
}

.tabbar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 92%;
  height: 56px;
  background-color: #fff;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
  position: fixed;
  bottom: 0;
  left: 4%;
  z-index: 999;
  border-top: none;
}

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

.tabbar-item.active {
  color: #409eff;
  transform: translateY(-1px);
}

.tabbar-icon {
  font-size: 20px;
  margin-bottom: 3px;
  transition: all 0.2s ease;
}

.tabbar-item.active .tabbar-icon {
  font-size: 21px;
}

.tabbar-text {
  line-height: 1;
  font-weight: 500;
}

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
