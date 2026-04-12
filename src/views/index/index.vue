<script setup lang="ts">
import { ArrowDown, PlayCircleFill, Search2, StarN } from '@nutui/icons-vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { showToast } from '@nutui/nutui'
import {
  getHomeConfig,
  getHomeRecipes,
  type HomeRecipe,
  type HomeTag,
  type PlanItem,
} from '../../api/home'
import {getUserDietPlan} from "../../api/user";
import {getSystemLabels, SystemLabel} from "../../api/label";
defineOptions({
  name: 'Index',
})

const keyword = ref('')
const banners = ref<string[]>([
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80',
])
const plans = ref<PlanItem[]>([])
const tags = ref<SystemLabel[]>([])
const recipes = ref<HomeRecipe[]>([])
const activeBanner = ref(0)
const pageNo = ref(1)
const pageSize = 6
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const errorMessage = ref('')

let bannerTimer: ReturnType<typeof setInterval> | null = null

const bannerStyle = computed(() =>
  banners.value.map((image, index) => ({
    backgroundImage: `linear-gradient(180deg, rgba(16, 12, 9, 0.1), rgba(16, 12, 9, 0.46)), url(${image})`,
    opacity: index === activeBanner.value ? 1 : 0,
  })),
)

function getToday() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function stringToColor(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  const colorPalettes = [
    { color: '#ea580c', background: '#fff1eb' },
    { color: '#dc2626', background: '#fef2f2' },
    { color: '#16a34a', background: '#f0fdf4' },
    { color: '#2563eb', background: '#eff6ff' },
    { color: '#9333ea', background: '#faf5ff' },
    { color: '#db2777', background: '#fdf2f8' },
    { color: '#0891b2', background: '#ecfeff' },
    { color: '#ca8a04', background: '#fefce8' },
  ]

  const index = Math.abs(hash) % colorPalettes.length
  return colorPalettes[index]
}


// 使用
const today = getToday()


function startBannerRotation() {
  if (bannerTimer || banners.value.length <= 1) {
    return
  }

  bannerTimer = setInterval(() => {
    activeBanner.value = (activeBanner.value + 1) % banners.value.length
  }, 3200)
}

async function loadHomeConfig() {
  startBannerRotation()
}

async function loadRecipes(isLoadMore = false) {
  if ((!hasMore.value && isLoadMore) || loading.value || loadingMore.value) {
    return
  }

  if (isLoadMore) {
    loadingMore.value = true
  } else {
    loading.value = true
    errorMessage.value = ''
  }

  try {
    const response = await getHomeRecipes(pageNo.value, pageSize)
    const nextList = response.data.records
    recipes.value = isLoadMore ? [...recipes.value, ...nextList] : nextList
    hasMore.value = response.data.current < response.data.pages
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '首页数据加载失败'
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

async function handleLoadMore() {
  setTimeout(() => {
    pageNo.value += 1
    loadRecipes(true);
  },1000)
}

async function loadDietPlan() {

  try {
    const response = await getUserDietPlan(today)
    for (let i = 0; i < 3; i++) {
      plans.value[i] = {
        id: response.data[i]?.dishes?.[0]?.id,
        label: response.data[i]?.label ?? ['早餐', '午餐', '晚餐'][i],
        value: response.data[i]?.dishes?.[0]?.name ?? '暂无'
      }
    }
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '饮食记录加载失败')
  } finally {
  }
}

async function loadSystemLabels(){
  const systemResponse = await getSystemLabels({
    pageNum: 1,
    pageSize: 10
  });
  tags.value = systemResponse.data.records;
}


onMounted(async () => {
  try {
    await loadHomeConfig()
    await loadRecipes()
    await loadDietPlan()
    await loadSystemLabels();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '首页数据加载失败'
  }
})

onBeforeUnmount(() => {
  if (bannerTimer) {
    clearInterval(bannerTimer)
  }
})
</script>

<template>
  <section class="home-page">
    <header class="hero">
      <div class="hero-carousel">
        <div
          v-for="(style, index) in bannerStyle"
          :key="banners[index] || index"
          class="hero-slide"
          :style="style"
        />
        <div class="hero-dots">
          <span
            v-for="(_, index) in banners"
            :key="index"
            class="hero-dot"
            :class="{ 'hero-dot-active': activeBanner === index }"
          />
        </div>
      </div>
    </header>

    <div class="top-panel">
      <div class="search-shell">
        <nut-searchbar
          v-model="keyword"
          placeholder="想吃点什么呀？"
          shape="round"
          class="home-searchbar"
        >
          <template #leftin>
            <Search2 color="#9ca3af" />
          </template>
        </nut-searchbar>
      </div>

      <section class="plan-card">
        <div class="plan-title">
          <span>今日<br />计划</span>
          <ArrowDown color="#ff715d" size="12" />
        </div>
        <div class="plan-content">
          <div v-for="plan in plans" :key="plan.id" class="plan-item">
            <span class="plan-label">{{ plan.label }}</span>
            <span class="plan-value">{{ plan.value }}</span>
          </div>
        </div>
      </section>

      <section class="tag-strip">
        <div
          v-for="tag in tags"
          :key="tag.id"
          class="tag-pill"
          :style="stringToColor(tag.id+'-'+tag.labelName)"
        >
          {{ tag.labelName }}
        </div>
      </section>
    </div>

    <section class="feed-section">
      <div v-if="errorMessage" class="state-text">{{ errorMessage }}</div>
      <div v-else-if="loading" class="state-text">首页内容加载中...</div>
      <nut-infinite-loading
        v-else
        :model-value="loadingMore"
        :has-more="hasMore"
        @load-more="handleLoadMore"
      >
        <div class="recipe-grid">
          <article v-for="recipe in recipes" :key="recipe.id" class="recipe-card">
            <div class="recipe-cover-wrap">
              <img :src="recipe.imgPath" class="recipe-cover" />
              <div v-if="recipe.badge" class="recipe-badge">{{ recipe.badge }}</div>
              <div v-if="recipe.video" class="recipe-video">
                <PlayCircleFill size="14" color="#ffffff" />
              </div>
            </div>

            <div class="recipe-meta">
              <h3 class="recipe-title">{{ recipe.name }}</h3>
              <div class="recipe-favorite">
                <StarN size="12" color="#9ca3af" />
                <span>{{ recipe.collectCount }}</span>
              </div>
            </div>
          </article>
        </div>
      </nut-infinite-loading>
    </section>
  </section>
</template>

<style scoped>
.home-page {
  height: calc(100vh - 66px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background:
    linear-gradient(180deg, #f4f1ec 0, #f7f4ef 240px, #f9f7f4 240px, #f9f7f4 100%);
}

.hero {
  position: relative;
}

.hero-carousel {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.hero-slide {
  position: absolute;
  inset: 0;
  background-position: center;
  background-size: cover;
  transition: opacity 0.6s ease;
}

.hero-dots {
  position: absolute;
  right: 20px;
  bottom: 48px;
  display: flex;
  gap: 6px;
}

.hero-dot {
  width: 7px;
  height: 7px;
  background: rgba(255, 255, 255, 0.38);
  border-radius: 999px;
}

.hero-dot-active {
  width: 18px;
  background: #ffffff;
}

.top-panel {
  z-index: 20;
  flex-shrink: 0;
  padding: 0 14px 12px;
  margin-top: -34px;
  background: linear-gradient(180deg, rgba(249, 247, 244, 0) 0, #f9f7f4 34px, #f9f7f4 100%);
}

.search-shell {
  padding: 0 18px;
}

:deep(.home-searchbar) {
  padding: 0;
  background: transparent;
}

:deep(.home-searchbar .nut-searchbar__content) {
  height: 52px;
  padding: 0 16px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 28px;
  box-shadow: 0 10px 24px rgba(25, 20, 15, 0.14);
}

:deep(.home-searchbar .nut-searchbar__search-input) {
  font-size: 16px;
}

.plan-card {
  display: flex;
  align-items: stretch;
  gap: 14px;
  padding: 16px 14px;
  margin-top: 16px;
  background: #f9e8e4;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(224, 162, 155, 0.16);
}

.plan-title {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 58px;
  color: #ff715d;
  font-size: 13px;
  font-weight: 700;
  line-height: 18px;
}

.plan-content {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  flex: 1;
  gap: 10px;
}

.plan-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.plan-label {
  color: #9ca3af;
  font-size: 13px;
}

.plan-value {
  overflow: hidden;
  color: #4b5563;
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.tag-strip {
  display: flex;
  gap: 10px;
  padding: 16px 2px 4px;
  overflow-x: auto;
  scrollbar-width: none;
}

.tag-strip::-webkit-scrollbar {
  display: none;
}

.tag-pill {
  flex: 0 0 auto;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 700;
  border-radius: 999px;
}

.feed-section {
  flex: 1;
  overflow-y: auto;
  padding: 2px 14px 18px;
  scrollbar-width: none;
}

.feed-section::-webkit-scrollbar {
  display: none;
}

.recipe-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 12px;
}

.recipe-card {
  width: 100%;
}

.recipe-cover-wrap {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  background: #ebe5df;
}

.recipe-cover {
  display: block;
  width: 100%;
  height: 176px;
  object-fit: cover;
}

.recipe-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  max-width: 80px;
  padding: 5px 9px;
  color: #f97316;
  font-size: 14px;
  font-weight: 800;
  background: rgba(255, 247, 237, 0.92);
  border-radius: 12px;
}

.recipe-video {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(17, 24, 39, 0.45);
  border-radius: 999px;
  backdrop-filter: blur(4px);
}

.recipe-title {
  margin: 12px 4px 8px;
  color: #111827;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recipe-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 4px;
  color: #9ca3af;
  font-size: 13px;
}

.recipe-author,
.recipe-favorite {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

.recipe-author span,
.recipe-favorite span {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.author-avatar {
  width: 18px;
  height: 18px;
  border-radius: 999px;
}

.state-text {
  padding: 28px 0;
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
}
</style>
