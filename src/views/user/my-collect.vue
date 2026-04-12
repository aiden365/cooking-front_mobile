<script setup lang="ts">
import { Left, StarN } from '@nutui/icons-vue'
import { showToast } from '@nutui/nutui'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getUserCollectList, type UserCollectGroup } from '../../api/user'
import MdiChevronDown from '~icons/mdi/chevron-down'

defineOptions({
  name: 'MyCollect',
})

const router = useRouter()
const loading = ref(true)
const collectGroups = ref<UserCollectGroup[]>([])
const backendBaseUrl = 'http://192.168.50.100:8082'

const hasData = computed(() => collectGroups.value.length > 0)

function formatLabels(labels: string) {
  return labels
    .split(/[，,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function goBack() {
  router.push('/user/home')
}



function formatCollectNum(value: number | string) {
  if (typeof value === 'string') {
    return value
  }

  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}w`
  }

  return String(value)
}

function formatDate(value: string) {
  return value.replace(/-/g, '.')
}

function resolveImageUrl(url: string) {
  if (!url) {
    return ''
  }

  if (/^https?:\/\//.test(url)) {
    return url
  }

  return `${backendBaseUrl}${url.startsWith('/') ? url : `/${url}`}`
}

async function loadCollects() {
  loading.value = true
  debugger;

  try {

    const response = await getUserCollectList()
    collectGroups.value = response.data
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '收藏列表加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadCollects()
})
</script>

<template>
  <section class="collect-page">
    <header class="page-header">
      <button class="back-button" type="button" @click="goBack">
        <Left size="18" />
      </button>
      <h1 class="page-title">我的收藏</h1>
      <div class="header-space" />
    </header>

    <section class="collect-content">
      <div v-if="loading" class="state-text">正在加载收藏菜谱...</div>
      <div v-else-if="!hasData" class="state-text">暂时还没有收藏内容</div>
      <template v-else>
        <section v-for="group in collectGroups" :key="group.day" class="date-group">
          <div class="date-title">
            <span>{{ formatDate(group.day) }}</span>
            <MdiChevronDown class="date-arrow" />
          </div>

          <article v-for="dish in group.dishes" :key="dish.id" class="collect-card">
            <img :src="resolveImageUrl(dish.img)" :alt="dish.name" class="dish-cover" />

            <div class="dish-main">
              <h2 class="dish-name">{{ dish.name }}</h2>
              <div class="dish-tags">
                <span v-for="label in formatLabels(dish.labels)" :key="label" class="dish-tag">
                  {{ label }}
                </span>
              </div>
            </div>

            <div class="dish-favorite">
              <StarN size="18" color="#b1b1b1" />
              <span>{{ formatCollectNum(dish.collectTotalNum) }}</span>
            </div>
          </article>
        </section>
      </template>
    </section>
  </section>
</template>

<style scoped>
.collect-page {
  min-height: 100vh;
  background: #ffffff;
}

.page-header {
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  align-items: center;
  padding: 46px 8px 18px;
  background: #f7f7f7;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: #8f96a3;
  background: transparent;
  border: none;
}

.page-title {
  margin: 0;
  color: #1a1a1a;
  font-size: 21px;
  font-weight: 500;
  text-align: center;
}

.header-space {
  width: 32px;
  height: 32px;
}

.collect-content {
  padding: 18px 16px 28px;
}

.date-group + .date-group {
  margin-top: 18px;
}

.date-title {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 20px;
  color: #1f1f1f;
  font-size: 18px;
  font-weight: 500;
}

.date-arrow {
  width: 20px;
  height: 20px;
  color: #8f96a3;
}

.collect-card {
  display: grid;
  grid-template-columns: 126px minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
}

.dish-cover {
  width: 126px;
  height: 126px;
  object-fit: cover;
  border-radius: 10px;
}

.dish-main {
  align-self: start;
  min-width: 0;
  padding-top: 2px;
}

.dish-name {
  margin: 0 0 16px;
  color: #1f1f1f;
  font-size: 19px;
  font-weight: 700;
  line-height: 1.25;
}

.dish-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.dish-tag {
  padding: 6px 12px;
  color: #303030;
  font-size: 14px;
  background: #f5f5f5;
  border-radius: 2px;
}

.dish-favorite {
  display: flex;
  align-items: center;
  gap: 4px;
  align-self: end;
  color: #9f9f9f;
  font-size: 18px;
  white-space: nowrap;
}

.state-text {
  padding: 40px 0;
  color: #9aa1ad;
  font-size: 15px;
  text-align: center;
}
</style>
