<template>
  <div class="profile">
    <h2>个人档案设置</h2>

    <section class="part">
      <h3>过敏源</h3>
      <div class="list"></div>
    </section>

    <section class="part">
      <h3>饮食习惯</h3>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// 静态数据
const ALLERGY_OPTIONS = [
  { id: "peanut", name: "花生" },
  { id: "milk", name: "牛奶" },
  { id: "egg", name: "鸡蛋" },
  { id: "wheat", name: "小麦" },
  { id: "soy", name: "大豆" },
  { id: "seafood", name: "海鲜" },
  { id: "nuts", name: "坚果" },
  { id: "gluten", name: "麸质" },
];
const DIET_PREFERENCES = [
  { id: "vegetarian", name: "素食" },
  { id: "vegan", name: "纯素" },
  { id: "low_sugar", name: "低糖" },
  { id: "low_salt", name: "低盐" },
  { id: "low_fat", name: "低脂" },
  { id: "organic", name: "有机优先" },
  { id: "halal", name: "清真" },
  { id: "keto", name: "生酮饮食" },
];


// 响应式数据
const allergyOptions = ref(ALLERGY_OPTIONS);
const selectedAllergies = ref([]);
const customAllergy = reg('');
const dietPreferences = ref(DIET_PREFERENCES);
const selectedPreference = ref([]);
const saving = ref(false);



</script>
