<template>
  <div>
    <h1>首页</h1>
    <p>{{num}}</p>
  </div>
</template>

<script setup>
import { ref } from "vue"
const num = ref(0)
</script>

<style scoped>

</style>