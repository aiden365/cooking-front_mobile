<script setup lang="ts">
import { CircleClose, Left, Search2, StarN, TriangleDown } from '@nutui/icons-vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getDishSearchList, type DishItem, type DishSearchParams } from '../../api/dish'

defineOptions({
  name: 'DishSearch',
})

const route = useRoute()
const router = useRouter()
const keyword = ref('')
const sortBy = ref<DishSearchParams['sortBy']>('comprehensive')
const withVideo = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const dishes = ref<DishItem[]>([])
const total = ref(0)

const sortOptions = [
  { key: 'comprehensive', label: '综合' },
  { key: 'favorite', label: '收藏量' },
  { key: 'activity', label: '活跃度' },
] as const

const hasResult = computed(() => dishes.value.length > 0)

async function loadSearchList() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await getDishSearchList({
      keyword: keyword.value,
      sortBy: sortBy.value,
      withVideo: withVideo.value,
      page: 1,
      pageSize: 10,
    })

    dishes.value = response.data.list
    total.value = response.data.total
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '搜索失败'
  } finally {
    loading.value = false
  }
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/')
}

function clearKeyword() {
  keyword.value = ''
  loadSearchList()
}

function applyKeywordFromRoute() {
  keyword.value = String(route.query.keyword || '').trim()
}

function goDetail(id?: number) {
  if (!id) return
  router.push(`/dish/detail/${id}`)
}

watch([sortBy, withVideo], () => {
  loadSearchList()
})

watch(
  () => route.query.keyword,
  () => {
    applyKeywordFromRoute()
    loadSearchList()
  },
)

onMounted(() => {
  applyKeywordFromRoute()
  loadSearchList()
})
</script>

<template>
  <section class="search-page">
    <header class="search-header">
      <button class="back-button" type="button" @click="goBack">
        <Left size="16" color="#7a7a7a" />
      </button>
      <h1>搜索</h1>
      <span class="header-placeholder" />
    </header>

    <div class="search-main">
      <div class="searchbar-wrap">
        <div class="searchbar">
          <Search2 size="18" color="#8d9199" />
          <input v-model="keyword" type="text" placeholder="搜索菜谱" @keyup.enter="loadSearchList" />
          <button v-if="keyword" class="clear-button" type="button" @click="clearKeyword">
            <CircleClose size="18" color="#999999" />
          </button>
        </div>
      </div>

      <section class="filter-row">
        <div class="sort-group">
          <button
            v-for="option in sortOptions"
            :key="option.key"
            type="button"
            class="sort-button"
            :class="{ 'sort-button-active': sortBy === option.key }"
            @click="sortBy = option.key"
          >
            <span>{{ option.label }}</span>
            <TriangleDown v-if="option.key !== 'comprehensive'" size="10" color="#333333" />
          </button>
        </div>

        <div class="filter-group">
          <button
            type="button"
            class="sort-button"
            :class="{ 'sort-button-active': sortBy === 'time' }"
            @click="sortBy = 'time'"
          >
            <span>时间</span>
            <TriangleDown size="10" color="#8c8c8c" />
          </button>

          <label class="video-filter">
            <input v-model="withVideo" type="checkbox" />
            <span>视频</span>
          </label>
        </div>
      </section>

      <section class="list-section">
        <div v-if="loading" class="state-box">搜索中...</div>
        <div v-else-if="errorMessage" class="state-box">{{ errorMessage }}</div>

        <template v-else-if="hasResult">
          <article
            v-for="dish in dishes"
            :key="dish.id"
            class="dish-card"
            @click="goDetail(dish.id)"
          >
            <img :src="dish.cover" :alt="dish.name" class="dish-cover" />
            <div class="dish-info">
              <h2>{{ dish.name }}，孩子们的最爱</h2>
              <div class="tag-row">
                <span v-for="tag in dish.tags?.slice(0, 2)" :key="tag" class="dish-tag">{{ tag }}</span>
              </div>
              <div class="dish-meta">
                <span>{{ dish.madeCount || 0 }}人做过</span>
                <span class="favorite-meta">
                  <StarN size="15" color="#a0a4ab" />
                  {{ dish.favoriteCount || 0 }}
                </span>
              </div>
            </div>
          </article>

          <div class="footer-dots">
            <span />
            <span />
            <span />
          </div>
        </template>

        <div v-else class="empty-box">
          <icon-mdi-loading class="empty-icon empty-icon-loading" />
          <p>正在智能生成...</p>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.search-page {
  min-height: 100vh;
  background: #ffffff;
}

.search-header {
  display: grid;
  grid-template-columns: 32px 1fr 32px;
  align-items: center;
  padding: calc(env(safe-area-inset-top) + 12px) 16px 14px;
  background: #ffffff;
}

.search-header h1 {
  margin: 0;
  color: #222222;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
}

.back-button,
.header-placeholder,
.clear-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
}

.search-main {
  border-top: 10px solid #f7f7f7;
}

.searchbar-wrap {
  padding: 18px 16px 10px;
}

.searchbar {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 50px;
  padding: 0 12px;
  border: 1px solid rgba(255, 126, 113, 0.55);
  border-radius: 16px;
}

.searchbar input {
  flex: 1;
  min-width: 0;
  color: #555555;
  font-size: 16px;
  border: none;
  outline: none;
}

.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 16px 6px;
}

.sort-group,
.filter-group {
  display: flex;
  align-items: center;
  gap: 20px;
}

.sort-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 6px 0;
  color: #262626;
  font-size: 16px;
  font-weight: 600;
  background: transparent;
  border: none;
}

.sort-button-active {
  color: #111111;
}

.sort-button-active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 4px;
  width: 32px;
  height: 3px;
  background: rgb(255, 126, 113);
  border-radius: 999px;
}

.video-filter {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #1f1f1f;
  font-size: 16px;
  font-weight: 600;
}

.video-filter input {
  width: 16px;
  height: 16px;
  accent-color: rgb(255, 126, 113);
}

.list-section {
  min-height: calc(100vh - 166px);
  padding: 8px 16px 28px;
}

.dish-card {
  display: flex;
  gap: 18px;
  padding: 18px 0;
}

.dish-cover {
  width: 170px;
  height: 170px;
  object-fit: cover;
  border-radius: 14px;
}

.dish-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.dish-info h2 {
  margin: 4px 0 14px;
  color: #1f1f1f;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.25;
}

.tag-row {
  display: flex;
  gap: 12px;
}

.dish-tag {
  padding: 7px 14px;
  color: #373737;
  font-size: 14px;
  background: #f5f5f5;
  border-radius: 6px;
}

.dish-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  color: #a0a4ab;
  font-size: 18px;
}

.favorite-meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.state-box,
.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 54vh;
  color: #9ca3af;
  font-size: 15px;
  text-align: center;
}

.empty-icon {
  font-size: 54px;
  color: rgb(255, 126, 113);
}

.empty-icon-loading {
  animation: spin 1s linear infinite;
}

.footer-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 90px 0 18px;
}

.footer-dots span {
  width: 7px;
  height: 7px;
  background: rgb(255, 126, 113);
  border-radius: 999px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>

