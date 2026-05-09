<script setup lang="ts">
import { CircleClose, Left, Search2, StarN, TriangleDown } from '@nutui/icons-vue'
import { showToast } from '@nutui/nutui'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getDishPage,
  searchDishIds,
  verifyDishName,
  type DishItem,
  type DishSearchParams,
} from '../../api/dish'
import { resolveAssetUrl } from '../../utils/assets'

defineOptions({
  name: 'DishSearch',
})

const route = useRoute()
const router = useRouter()

const keyword = ref('')
const appliedKeyword = ref('')
const sortBy = ref<DishSearchParams['sortBy']>('comprehensive')
const sortMethod = ref<'desc' | 'asc'>('desc')
const withVideo = ref(false)
const dishes = ref<DishItem[]>([])
const allDishes = ref<DishItem[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(false)
const errorMessage = ref('')
const searched = ref(false)
const generating = ref(false)
const pageNo = ref(1)
const matchedDishIds = ref<number[]>([])

const requestPageSize = 9999
const pageSize = 10

const sortOptions = [
  { key: 'comprehensive', label: '综合' },
  { key: 'favorite', label: '收藏量' },
  { key: 'activity', label: '活跃度' },
  { key: 'time', label: '时间' },
] as const

const hasResult = computed(() => dishes.value.length > 0)
const showEmptyGenerate = computed(
  () => searched.value && !loading.value && !errorMessage.value && !hasResult.value,
)

function applyKeywordFromRoute() {
  keyword.value = String(route.query.keyword).trim()
}

function resetSearchState() {
  dishes.value = []
  pageNo.value = 1
  hasMore.value = false
}

function parseTimeValue(time?: string) {
  if (!time) {
    return 0
  }

  const matched = time.trim().match(
    /^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2}):(\d{2}))?$/,
  )

  if (!matched) {
    return 0
  }

  const [, year, month, day, hour = '00', minute = '00', second = '00'] = matched
  const timestamp = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  ).getTime()

  return Number.isNaN(timestamp) ? 0 : timestamp
}

function compareBySortRule(left: DishItem, right: DishItem) {
  let leftValue = 0
  let rightValue = 0

  if (sortBy.value === 'favorite') {
    leftValue = left.collectCount || 0
    rightValue = right.collectCount || 0
  } else if (sortBy.value === 'activity') {
    leftValue = left.activeVal || 0
    rightValue = right.activeVal || 0
  } else if (sortBy.value === 'time') {
    leftValue = parseTimeValue(left.createTime)
    rightValue = parseTimeValue(right.createTime)
  } else {
    leftValue = left.id || 0
    rightValue = right.id || 0
  }

  const result = leftValue - rightValue
  return sortMethod.value === 'asc' ? result : -result
}

function applyLocalFiltersAndSort(isLoadMore = false) {
  const filteredList = withVideo.value
    ? allDishes.value.filter((item) => Boolean(item.videoPath))
    : [...allDishes.value]

  const sortedList = filteredList.sort(compareBySortRule)
  const endIndex = pageNo.value * pageSize
  dishes.value = sortedList.slice(0, endIndex)
  hasMore.value = endIndex < sortedList.length
  searched.value = true
}

async function loadDishList() {
  if (loading.value || loadingMore.value) {
    return
  }

  loading.value = true
  errorMessage.value = ''
  resetSearchState()

  try {
    const response = await getDishPage({
      pageNo: 1,
      pageSize: requestPageSize,
      dishIds: matchedDishIds.value,
    })

    allDishes.value = response.data.records ?? []
    applyLocalFiltersAndSort()
    searched.value = true
  } catch (error) {
    allDishes.value = []
    errorMessage.value = error instanceof Error ? error.message : '搜索失败'
    searched.value = true
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

async function loadSearchList() {
  const trimmedKeyword = appliedKeyword.value.trim()

  if (loading.value || loadingMore.value) {
    return
  }

  if (!trimmedKeyword) {
    matchedDishIds.value = []
    allDishes.value = []
    searched.value = false
    errorMessage.value = ''
    resetSearchState()
    showToast.text('请输入搜索内容')
    return
  }

  loading.value = true
  errorMessage.value = ''
  resetSearchState()

  try {
    const searchResponse = await searchDishIds({
      dishName: trimmedKeyword,
    })

    matchedDishIds.value = searchResponse.data ?? []
    allDishes.value = []
    searched.value = true

    if (!matchedDishIds.value.length) {
      return
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '搜索失败'
    searched.value = true
    return
  } finally {
    loading.value = false
  }

  await loadDishList()
}

function handleSearch() {
  appliedKeyword.value = keyword.value.trim()
  void loadSearchList()
}

function handleSortChange(nextSortBy: typeof sortOptions[number]['key']) {
  if (nextSortBy === 'comprehensive') {
    sortBy.value = nextSortBy
    sortMethod.value = 'desc'
  } else if (sortBy.value === nextSortBy) {
    sortMethod.value = sortMethod.value === 'desc' ? 'asc' : 'desc'
  } else {
    sortBy.value = nextSortBy
    sortMethod.value = 'desc'
  }

  if (!searched.value || !matchedDishIds.value.length) {
    return
  }

  pageNo.value = 1
  applyLocalFiltersAndSort()
}

function getSortArrowClass(optionKey: typeof sortOptions[number]['key']) {
  if (sortBy.value !== optionKey) {
    return 'sort-arrow'
  }

  return sortMethod.value === 'asc' ? 'sort-arrow sort-arrow-active sort-arrow-asc' : 'sort-arrow sort-arrow-active'
}

function handleLoadMore() {
  if (!hasMore.value || loading.value || loadingMore.value) {
    return
  }

  loadingMore.value = true
  pageNo.value += 1
  applyLocalFiltersAndSort(true)
  loadingMore.value = false
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
  appliedKeyword.value = ''
  sortBy.value = 'comprehensive'
  sortMethod.value = 'desc'
  withVideo.value = false
  matchedDishIds.value = []
  allDishes.value = []
  searched.value = false
  errorMessage.value = ''
  resetSearchState()
}

function goDetail(id?: number) {
  if (!id) {
    return
  }

  router.push(`/dish/detail/${id}`)
}

async function handleGenerateDish() {
  const dishName = keyword.value.trim()

  if (!dishName) {
    showToast.text('请输入菜名后再生成')
    return
  }

  if (generating.value) {
    return
  }

  generating.value = true

  try {
    const response = await verifyDishName(dishName)

    if (!response.data) {
      showToast.text('请输入正确的菜名')
      return
    }


    router.push({
      name: 'DishDetail',
      params: {
        id: '0',
      },
      query: {
        dishName,
      },
    })
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '菜名验证失败')
  } finally {
    generating.value = false
  }
}

watch(withVideo, () => {
  if (!searched.value) {
    return
  }

  pageNo.value = 1
  applyLocalFiltersAndSort()
})

watch(
  () => route.query.keyword,
  () => {
    applyKeywordFromRoute()
    appliedKeyword.value = keyword.value.trim()

    if (appliedKeyword.value) {
      void loadSearchList()
    }
  },
)

onMounted(() => {
  applyKeywordFromRoute()
  appliedKeyword.value = keyword.value.trim()

  if (appliedKeyword.value) {
    void loadSearchList()
  }
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

    <section class="search-toolbar">
      <div class="searchbar-wrap">
        <div class="searchbar">
          <Search2 size="18" color="#8d9199" />
          <input
            v-model="keyword"
            type="text"
            placeholder="搜索菜谱"
            @keyup.enter="handleSearch"
          />
          <button v-if="keyword" class="clear-button" type="button" @click="clearKeyword">
            <CircleClose size="18" color="#999999" />
          </button>
        </div>
        <button type="button" class="search-action" @click="handleSearch">搜索</button>
      </div>

      <section class="filter-row">
        <div class="sort-group">
          <button
            v-for="option in sortOptions"
            :key="option.key"
            type="button"
            class="sort-button"
            :class="{ 'sort-button-active': sortBy === option.key }"
            @click="handleSortChange(option.key)"
          >
            <span>{{ option.label }}</span>
            <TriangleDown
              v-if="option.key !== 'comprehensive'"
              size="10"
              :color="sortBy === option.key ? 'rgb(255, 126, 113)' : '#333333'"
              :class="getSortArrowClass(option.key)"
            />
          </button>
        </div>

        <label class="video-filter">
          <input v-model="withVideo" type="checkbox" />
          <span>视频</span>
        </label>
      </section>
    </section>

    <section class="list-section">
      <div v-if="loading" class="state-box">搜索中...</div>
      <div v-else-if="errorMessage" class="state-box">{{ errorMessage }}</div>
      <div v-else-if="showEmptyGenerate" class="empty-box">
<!--        <Search2 class="empty-icon" color="rgb(255, 126, 113)" />-->
        <p>未检索到相关的菜谱</p>
        <button class="generate-button" type="button" :disabled="generating" @click="handleGenerateDish">
          {{ generating ? '生成中...' : '立即生成' }}
        </button>
      </div>
      <div v-else-if="!searched" class="state-box">输入菜名后点击搜索</div>
      <nut-infinite-loading
        v-else
        :model-value="loadingMore"
        :has-more="hasMore"
        @load-more="handleLoadMore"
      >
        <article v-for="dish in dishes" :key="dish.id" class="dish-card" @click="goDetail(dish.id)">
          <img :src="resolveAssetUrl(dish.imgPath)" :alt="dish.name" class="dish-cover" />
          <div class="dish-info">
            <h2>{{ dish.name }}</h2>
            <div class="tag-row">
              <span v-for="tag in dish.labelNames?.slice(0, 2) ?? []" :key="tag" class="dish-tag">
                {{ tag }}
              </span>
            </div>
            <div class="dish-meta">
              <span>{{ dish.shareCount || 0 }}人做过</span>
              <span class="favorite-meta">
                <StarN size="15" color="#a0a4ab" />
                {{ dish.collectCount || 0 }}
              </span>
            </div>
          </div>
        </article>
      </nut-infinite-loading>
    </section>
  </section>
</template>

<style scoped>
.search-page {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.search-header {
  display: grid;
  grid-template-columns: 32px 1fr 32px;
  align-items: center;
  padding: calc(env(safe-area-inset-top) + 12px) 16px 14px;
  background: #ffffff;
  border-bottom: 1px solid #f2f2f2;
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

.search-toolbar {
  flex-shrink: 0;
  background: #ffffff;
  border-bottom: 10px solid #f7f7f7;
}

.searchbar-wrap {
  display: flex;
  gap: 12px;
  padding: 18px 16px 10px;
}

.searchbar {
  display: flex;
  flex: 1;
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

.search-action {
  width: 78px;
  height: 50px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #ff7f67, #ff9f62);
  border: none;
  border-radius: 16px;
}

.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 16px 10px;
}

.sort-group {
  display: flex;
  align-items: center;
  gap: 20px;
  overflow-x: auto;
  scrollbar-width: none;
}

.sort-group::-webkit-scrollbar {
  display: none;
}

.sort-button {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
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

.sort-arrow {
  transition: transform 0.2s ease, color 0.2s ease;
}

.sort-arrow-active {
  color: rgb(255, 126, 113);
}

.sort-arrow-asc {
  transform: rotate(180deg);
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
  flex-shrink: 0;
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
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px 28px;
  -webkit-overflow-scrolling: touch;
}

.dish-card {
  display: flex;
  gap: 18px;
  padding: 18px 0;
}

.dish-card + .dish-card {
  border-top: 1px solid #f4f4f4;
}

.dish-cover {
  width: 132px;
  height: 132px;
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
  font-size: 22px;
  font-weight: 800;
  line-height: 1.25;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
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
  font-size: 16px;
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
  font-size: 52px;
  color: rgb(255, 126, 113);
}

.generate-button {
  min-width: 132px;
  height: 44px;
  margin-top: 18px;
  padding: 0 18px;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  background: linear-gradient(135deg, #ff7f67, #ff9f62);
  border: none;
  border-radius: 999px;
}

.generate-button:disabled {
  opacity: 0.65;
}
</style>
