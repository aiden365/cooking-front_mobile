<script setup lang="ts">
import { Search2, StarN } from '@nutui/icons-vue'
import { showToast } from '@nutui/nutui'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getDishPage, type DishItem } from '../../api/dish'
import { getSystemLabels, type SystemLabel } from '../../api/label'
import { resolveAssetUrl } from '../../utils/assets'

defineOptions({
  name: 'DishList',
})

type CategoryOption = {
  id: number
  labelName: string
  isAll?: boolean
}

const router = useRouter()
const keyword = ref('')
const labels = ref<SystemLabel[]>([])
const activeCategoryId = ref<number>(0)
const dishes = ref<DishItem[]>([])
const pageNo = ref(1)
const pageSize = 7
const loading = ref(false)
const loadingMore = ref(false)
const labelLoading = ref(true)
const hasMore = ref(true)
const errorMessage = ref('')

const categoryOptions = computed<CategoryOption[]>(() => [
  { id: 0, labelName: '全部', isAll: true },
  ...labels.value,
])

const activeCategory = computed(
  () => categoryOptions.value.find((item) => item.id === activeCategoryId.value) ?? categoryOptions.value[0],
)

function getDishSearchKeyword() {
  if (activeCategory.value?.isAll) {
    return undefined
  }

  return activeCategory.value?.labelName
}

function handleSearch() {
  pageNo.value = 1
  hasMore.value = true
  dishes.value = []
  loadDishList();

  /*router.push({
    path: '/dish/search',
    query: {
      keyword: trimmedKeyword,
    },
  })*/
}

function goDetail(id: number) {
  router.push(`/dish/detail/${id}`)
}

async function loadCategories() {
  labelLoading.value = true

  try {
    const response = await getSystemLabels({
      pageNum: 1,
      pageSize: -1,
      type:2
    })

    labels.value = response.data.records
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '菜谱标签加载失败')
  } finally {
    labelLoading.value = false
  }
}

async function loadDishList(isLoadMore = false) {
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

    const response = await getDishPage(pageNo.value, pageSize, keyword.value, activeCategoryId.value)
    const nextList = response.data.records
    dishes.value = isLoadMore ? [...dishes.value, ...nextList] : nextList
    hasMore.value = response.data.current < response.data.pages

    if (response.data.pages === 0 || nextList.length < pageSize) {
      hasMore.value = false
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '菜谱列表加载失败'

    if (isLoadMore) {
      showToast.fail(message)
    } else {
      errorMessage.value = message
    }
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

async function selectCategory(categoryId: number) {
  if (activeCategoryId.value === categoryId && dishes.value.length) {
    return
  }

  activeCategoryId.value = categoryId
  pageNo.value = 1
  hasMore.value = true
  dishes.value = []
  await loadDishList()
}

async function handleLoadMore() {
  setTimeout(() => {
    pageNo.value += 1
    loadDishList(true)
  },1000)

}

async function reloadDishList() {
  pageNo.value = 1
  hasMore.value = true
  dishes.value = []
  await loadDishList()
}

function dishTags(dish: DishItem) {
  return (dish.labelNames ?? []).filter(Boolean).slice(0, 3)
}

onMounted(async () => {
  await loadCategories()
  await loadDishList()
})
</script>

<template>
  <section class="dish-list-page">
    <header class="search-header">
      <div class="searchbar">
        <Search2 size="18" color="#8f96a3" />
        <input
          v-model="keyword"
          type="text"
          maxlength="20"
          placeholder="搜索菜名"
          @keyup.enter="handleSearch"
        />
      </div>
      <button class="search-button" type="button" @click="handleSearch">搜索</button>
    </header>

    <section class="content-panel">
      <aside class="category-panel">
        <div v-if="labelLoading" class="category-state">加载中...</div>
        <template v-else>
          <button
            v-for="category in categoryOptions"
            :key="category.id"
            type="button"
            class="category-item"
            :class="{ 'category-item-active': activeCategoryId === category.id }"
            @click="selectCategory(category.id)"
          >
            {{ category.labelName }}
          </button>
        </template>
      </aside>

      <div class="dish-panel">
        <div v-if="errorMessage" class="panel-state">
          <p>{{ errorMessage }}</p>
          <button class="retry-button" type="button" @click="reloadDishList">重新加载</button>
        </div>
        <div v-else-if="loading" class="panel-state">菜谱加载中...</div>
        <div v-else-if="!dishes.length" class="panel-state">暂无相关菜谱</div>
        <nut-infinite-loading
          v-else
          :model-value="loadingMore"
          :has-more="hasMore"
          @load-more="handleLoadMore"
        >
          <article
            v-for="dish in dishes"
            :key="dish.id"
            class="dish-card"
            @click="goDetail(dish.id)"
          >
            <div class="cover-wrap">
              <img :src="resolveAssetUrl(dish.imgPath)" :alt="dish.name" class="dish-cover" />
              <div v-if="dish.videoPath" class="play-badge">
                <span class="play-triangle" />
              </div>
            </div>

            <div class="dish-info">
              <h2>{{ dish.name }}</h2>
              <div class="dish-tags">
                <span v-for="tag in dishTags(dish)" :key="`${dish.id}-${tag}`">{{ tag }}</span>
              </div>
              <div class="dish-footer">
                <span class="made-count">{{ dish.shareCount }}人做过</span>
                <span class="favorite-count">
                  <StarN size="16" color="#a8a8ad" />
                  {{ dish.collectCount }}
                </span>
              </div>
            </div>
          </article>
        </nut-infinite-loading>
      </div>
    </section>
  </section>
</template>

<style scoped>
.dish-list-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f6f6f6;
}

.search-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: calc(env(safe-area-inset-top) + 12px) 12px 12px;
  background: #ffffff;
}

.searchbar {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 12px;
  background: #ffffff;
  border-radius: 16px;
}

.searchbar input {
  flex: 1;
  min-width: 0;
  color: #444444;
  font-size: 15px;
  background: transparent;
  border: none;
  outline: none;
}

.searchbar input::placeholder {
  color: #a0a0a6;
}

.search-button {
  min-width: 64px;
  height: 38px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #ff7b6b 0%, #ff6858 100%);
  border: none;
  border-radius: 14px;
}

.content-panel {
  display: flex;
  flex: 1;
  min-height: 0;
  border-top: 12px solid #f6f6f6;
}

.category-panel {
  width: 108px;
  overflow-y: auto;
  padding: 0 0 18px;
  background: #ffffff;
  scrollbar-width: none;
}

.category-panel::-webkit-scrollbar,
.dish-panel::-webkit-scrollbar {
  display: none;
}

.category-item {
  width: 100%;
  min-height: 66px;
  padding: 0 14px;
  color: #1f1f1f;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.35;
  text-align: center;
  word-break: break-all;
  background: #ffffff;
  border: none;
}

.category-item-active {
  color: #ffffff;
  font-weight: 700;
  background: linear-gradient(180deg, #ff7667 0%, #ff6a5b 100%);
}

.category-state {
  padding: 20px 12px;
  color: #b3b3b9;
  font-size: 13px;
  text-align: center;
}

.dish-panel {
  flex: 1;
  overflow-y: auto;
  padding: 4px 10px 18px 8px;
  background: #f6f6f6;
  height: 95%;
}

.dish-card {
  display: flex;
  gap: 12px;
  padding: 0 0 14px;
}

.cover-wrap {
  position: relative;
  flex-shrink: 0;
  width: 132px;
  height: 132px;
}

.dish-cover {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
  background: #ececec;
}

.play-badge {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.78);
  border-radius: 999px;
  transform: translate(-50%, -50%);
}

.play-triangle {
  width: 0;
  height: 0;
  margin-left: 3px;
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
  border-left: 11px solid #ff7565;
}

.dish-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  padding: 2px 0;
}

.dish-info h2 {
  margin: 0;
  color: #161616;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.3;
}

.dish-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.dish-tags span {
  padding: 4px 8px;
  color: #2d2d2d;
  font-size: 13px;
  background: #fff0ed;
  border-radius: 999px;
}

.dish-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
  color: #a7a7ac;
  font-size: 13px;
}

.favorite-count {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.panel-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 240px;
  color: #b3b3b9;
  font-size: 14px;
  text-align: center;
}

.retry-button {
  min-width: 96px;
  height: 34px;
  color: #ff6a5b;
  font-size: 14px;
  background: #fff1ef;
  border: none;
  border-radius: 999px;
}
</style>
