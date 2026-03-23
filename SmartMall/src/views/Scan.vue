<template>
  <div class="scan-page">
    <!-- 顶部导航 -->
    <header class="header">
      <h1>扫描商品</h1>
      <button class="icon-btn" @click="goBack">
        <i class="fas fa-times"></i>
      </button>
      <button class="icon-btn history-btn" @click="goToHistory">
        <i class="fas fa-history"></i>
      </button>
    </header>

    <!-- 扫描区域 -->
    <div class="scan-container" v-if="!showManualInput && !showResult">
      <!-- 摄像头组件 -->
      <ScanCamera
        ref="cameraRef"
        :flash-on="flashOn"
        @barcode-scanned="handleBarcodeScanned"
        @camera-error="handleCameraError"
      />
      
      <!-- 扫描提示 -->
      <div class="scan-overlay">
        <div class="scan-frame">
          <div class="scan-line"></div>
        </div>
        <div class="scan-hint">
          <h3>对准商品条形码</h3>
          <p>将条形码置于框内，保持平稳，自动识别</p>
        </div>
      </div>
      
      <!-- 过敏警告 -->
      <AllergyAlert
        v-if="showAllergyAlert"
        :allergens="matchedAllergens"
        @close="showAllergyAlert = false"
      />
    </div>

    <!-- 手动输入组件 -->
    <ManualInput
      v-if="showManualInput"
      @submit="handleManualSubmit"
      @close="showManualInput = false"
    />

    <!-- 扫描结果组件 -->
    <ScanResult
      v-if="showResult"
      :product="currentProduct"
      :barcode="currentBarcode"
      :match-score="matchScore"
      @close="showResult = false"
      @save="saveToHistory"
      @share="shareProduct"
    />

    <!-- 底部控制栏 -->
    <div class="controls" v-if="!showManualInput && !showResult">
      <button class="control-btn" @click="toggleFlash">
        <i class="fas fa-bolt" :class="{ 'flash-on': flashOn }"></i>
        <span>{{ flashOn ? '关闭闪光' : '闪光灯' }}</span>
      </button>
      <button class="control-btn" @click="toggleManualInput">
        <i class="fas fa-keyboard"></i>
        <span>手动输入</span>
      </button>
      <button class="control-btn" @click="selectFromAlbum">
        <i class="fas fa-images"></i>
        <span>相册识别</span>
      </button>
    </div>

    <!-- 加载动画 -->
    <LoadingSpinner v-if="isLoading" message="正在分析商品信息..." />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import ScanCamera from '../components/ScanCamera.vue'
import ManualInput from '../components/ManualInput.vue'
import ScanResult from '../components/ScanResult.vue'
import AllergyAlert from '../components/AllergyAlert.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { mockProducts } from '../utils/mockData.js'
import { calculateMatchScore, checkAllergens } from '../utils/barcodeScanner.js'
import '../styles/scan-styles.css'

const router = useRouter()

// 响应式数据
const flashOn = ref(false)
const showManualInput = ref(false)
const showResult = ref(false)
const showAllergyAlert = ref(false)
const isLoading = ref(false)
const currentBarcode = ref('')
const currentProduct = ref(null)
const matchScore = ref(0)
const matchedAllergens = ref([])
const cameraRef = ref(null)

// 用户过敏源（实际应从用户设置获取）
const userAllergens = ['牛奶', '花生']

// 计算属性
const productFound = computed(() => {
  return currentProduct.value !== null
})

// 方法
const toggleFlash = () => {
  flashOn.value = !flashOn.value
  if (cameraRef.value) {
    cameraRef.value.toggleFlash(flashOn.value)
  }
}

const toggleManualInput = () => {
  showManualInput.value = !showManualInput.value
  if (showManualInput.value && cameraRef.value) {
    cameraRef.value.stopCamera()
  } else if (!showManualInput.value && cameraRef.value) {
    cameraRef.value.startCamera()
  }
}

const selectFromAlbum = () => {
  alert('从相册选择图片识别功能开发中')
  // 实际项目中应实现图片选择并识别条码
}

const goBack = () => {
  if (confirm('确定要退出扫描吗？')) {
    if (cameraRef.value) {
      cameraRef.value.stopCamera()
    }
    router.push('/home') // 返回首页
  }
}

const goToHistory = () => {
  router.push('/history') // 跳转到历史页面
}

const handleBarcodeScanned = (barcode) => {
  if (isLoading.value) return
  
  currentBarcode.value = barcode
  isLoading.value = true
  
  // 模拟API请求延迟
  setTimeout(() => {
    fetchProductData(barcode)
    isLoading.value = false
  }, 1500)
}

const handleManualSubmit = (barcode) => {
  showManualInput.value = false
  handleBarcodeScanned(barcode)
}

const handleCameraError = (error) => {
  console.error('摄像头错误:', error)
  alert('摄像头访问失败，请检查权限设置')
}

const fetchProductData = (barcode) => {
  // 检查商品是否存在
  const product = mockProducts[barcode]
  
  if (product) {
    currentProduct.value = product
    
    // 检查过敏原
    const allergens = checkAllergens(product, userAllergens)
    matchedAllergens.value = allergens
    
    // 显示过敏警告
    if (allergens.length > 0) {
      showAllergyAlert.value = true
    }
    
    // 计算匹配度
    matchScore.value = calculateMatchScore(product, userAllergens)
    
    // 显示结果
    showResult.value = true
  } else {
    // 商品不存在
    showResult.value = true
    currentProduct.value = null
  }
}

const saveToHistory = () => {
  alert('已保存到扫描历史')
  // 实际项目中应调用API保存记录
}

const shareProduct = () => {
  if (navigator.share) {
    navigator.share({
      title: '智慧购物 - 商品分享',
      text: `我在智慧购物发现了${currentProduct.value.name}，分享给你看看`,
      url: window.location.href,
    })
  } else {
    alert('链接已复制到剪贴板')
  }
}

// 生命周期钩子
onMounted(() => {
  console.log('扫描页面已加载')
})

onUnmounted(() => {
  if (cameraRef.value) {
    cameraRef.value.stopCamera()
  }
})
</script>