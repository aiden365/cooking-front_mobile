<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getRecommendDishes, type DishItem } from '../../api/dish'

defineOptions({
  name: 'Index',
})

const loading = ref(false)
const dishes = ref<DishItem[]>([])
const errorMessage = ref('')

async function loadRecommendDishes() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await getRecommendDishes()
    dishes.value = response.data
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '加载推荐菜谱失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRecommendDishes()
})
</script>

<template>
  <section class="page">
    <h1 class="page-title">首页</h1>
    <p class="page-desc">当前页面已接入 Axios + Mock，可直接联调前端假数据。</p>
    <p v-if="loading">推荐菜谱加载中...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <ul v-else class="dish-list">
      <li v-for="dish in dishes" :key="dish.id" class="dish-item">
        <h2>{{ dish.name }}</h2>
        <p>{{ dish.description }}</p>
        <small>{{ dish.calories }} kcal · {{ dish.tags.join(' / ') }}</small>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.page {
  padding: 16px;
}

.page-title {
  margin: 0 0 8px;
}

.page-desc {
  margin: 0 0 16px;
  color: #666;
}

.dish-list {
  display: grid;
  gap: 12px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.dish-item {
  padding: 12px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
}

.dish-item h2,
.dish-item p,
.dish-item small {
  margin: 0;
}

.dish-item p {
  margin: 8px 0;
}
</style>
