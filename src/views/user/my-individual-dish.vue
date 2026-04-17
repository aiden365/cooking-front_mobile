<script setup lang="ts">
import { Left, Search2 } from '@nutui/icons-vue'
import { showToast } from '@nutui/nutui'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  deleteMyIndividualDish,
  getMyIndividualDishPage,
  type IndividualDishItem,
} from '../../api/dish'
import { resolveAssetUrl } from '../../utils/assets'
import { getCurrentUserInfo } from '../../utils/user'

defineOptions({
  name: 'MyIndividualDish',
})

const router = useRouter()
const searchKeyword = ref('')
const appliedKeyword = ref('')
const dishList = ref<IndividualDishItem[]>([])
const loading = ref(false)
const refreshing = ref(false)
const loadingMore = ref(false)
const deletingDishId = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)
const total = ref(0)
const pageSize = 7
const hasMore = computed(() => currentPage.value < totalPages.value)
const isEmpty = computed(() => !loading.value && dishList.value.length === 0)

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/user/home')
}

function goDetail(item: IndividualDishItem) {
  router.push({
    name: 'DishIndividual',
    query: {
      individualDishId: String(item.id),
      dishId: String(item.dishId),
      dishName: item.dishName,
    },
  })
}

async function fetchDishList(pageNum = 1, reset = false) {
  if (reset) {
    loading.value = true
  } else {
    loadingMore.value = true
  }

  try {
    const userInfo = getCurrentUserInfo()
    const response = await getMyIndividualDishPage({
      pageNo: pageNum,
      pageSize,
      userId: userInfo.userId,
      search: appliedKeyword.value || undefined,
    })

    const { records, current, pages, total: totalCount } = response.data
    currentPage.value = current
    totalPages.value = pages || 1
    total.value = totalCount
    dishList.value = reset ? records : [...dishList.value, ...records]
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '个性化菜谱加载失败')
  } finally {
    loading.value = false
    loadingMore.value = false
    refreshing.value = false
  }
}

function refreshList() {
  if (refreshing.value) {
    return
  }

  refreshing.value = true
  window.setTimeout(() => {
    void fetchDishList(1, true)
  }, 600)
}

async function loadMore() {
  if (!hasMore.value || loadingMore.value) {
    return
  }

  await fetchDishList(currentPage.value + 1, false)
}

async function submitSearch() {
  appliedKeyword.value = searchKeyword.value.trim()
  totalPages.value = 1
  currentPage.value = 1
  await fetchDishList(1, true)
}

async function handleDeleteDish(item: IndividualDishItem) {
  if (deletingDishId.value === item.id) {
    return
  }

  const confirmed = window.confirm(`确认删除“${item.dishName}”吗？`)

  if (!confirmed) {
    return
  }

  deletingDishId.value = item.id

  try {
    await deleteMyIndividualDish(item.id)
    showToast.success('删除成功')

    const nextList = dishList.value.filter((dish) => dish.id !== item.id)
    dishList.value = nextList
    total.value = Math.max(0, total.value - 1)

    if (!nextList.length && currentPage.value > 1) {
      await fetchDishList(currentPage.value - 1, true)
      return
    }

    if (total.value > 0) {
      await fetchDishList(1, true)
    }
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '删除失败')
  } finally {
    deletingDishId.value = 0
  }
}

onMounted(() => {
  void fetchDishList(1, true)
})
</script>

<template>
  <section class="individual-page">
    <div class="top-panel">
      <header class="page-header">
        <button class="header-side" type="button" aria-label="返回" @click="goBack">
          <Left size="16" color="#8a8a8a" />
        </button>
        <h1>我的个性化菜谱</h1>
        <span class="header-side placeholder" />
      </header>

      <div class="search-section">
        <div class="searchbar">
          <Search2 size="18" color="#8f96a3" />
          <input
            v-model="searchKeyword"
            type="text"
            maxlength="20"
            placeholder="搜索菜名"
            @keyup.enter="submitSearch"
          />
          <button class="search-button" type="button" @click="submitSearch">搜索</button>
        </div>
      </div>
    </div>

    <section class="list-panel">
      <nut-infinite-loading :loading="loadingMore" :has-more="hasMore" @load-more="loadMore">
        <nut-pull-refresh :model-value="refreshing" @refresh="refreshList">
          <div class="list-content">
            <div v-if="loading" class="state-box">正在加载个性化菜谱...</div>
            <template v-else-if="!isEmpty">
              <section class="dish-list">
                <article v-for="item in dishList" :key="item.id"  class="dish-card" @click="goDetail(item)">
                  <img :src="resolveAssetUrl(item.imgPath)" :alt="item.dishName" class="dish-cover" />
                  <div class="dish-body">
                    <div class="dish-head">
                      <h2>{{ item.dishName }}</h2>
                    </div>
                    <p class="dish-desc">已生成的个性化菜谱方案，可继续查看详细做法和菜谱信息。</p>
                    <div class="dish-meta">
                      <time>{{ item.createTime }}</time>
                      <button
                        type="button"
                        class="delete-inline-button"
                        :disabled="deletingDishId === item.id"
                        @click.stop="handleDeleteDish(item)"
                      >
                        {{ deletingDishId === item.id ? '删除中...' : '删除' }}
                      </button>
                    </div>
                  </div>
                </article>
              </section>
            </template>

            <div v-else class="empty-state">
              <p>没有找到相关个性化菜谱</p>
              <span>换个菜名再试试吧</span>
            </div>
          </div>
        </nut-pull-refresh>
      </nut-infinite-loading>
    </section>
  </section>
</template>

<style scoped>
.individual-page {
  --top-panel-height: calc(env(safe-area-inset-top) + 102px);
  height: 100vh;
  overflow: hidden;
  background: #ffffff;
}

.top-panel {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 20;
  width: 100%;
  background: #ffffff;
}

.page-header {
  display: grid;
  grid-template-columns: 32px 1fr 32px;
  align-items: center;
  padding: calc(env(safe-area-inset-top) + 14px) 12px 12px;
  background: #ffffff;
}

.page-header h1 {
  margin: 0;
  color: #222222;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
}

.header-side {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
}

.placeholder {
  visibility: hidden;
}

.search-section {
  padding: 6px 10px 14px;
}

.searchbar {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 6px 0 12px;
  border: 1px solid #ffc1b8;
  border-radius: 15px;
  background: #ffffff;
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
  color: #9f9fa5;
}

.search-button {
  flex-shrink: 0;
  min-width: 66px;
  height: 36px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #ff8b7b 0%, #ff715f 100%);
  border: none;
  border-radius: 13px;
}

.list-panel {
  height: 100%;
  overflow-y: auto;
  padding-top: var(--top-panel-height);
  padding-bottom: calc(88px + env(safe-area-inset-bottom));
  box-sizing: border-box;
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
}

.list-content {
  min-height: calc(100vh - var(--top-panel-height));
  padding: 18px 14px 0;
  box-sizing: border-box;
}

.dish-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.swipe-item {
  overflow: hidden;
  border-radius: 16px;
}

.dish-card {
  display: grid;
  grid-template-columns: 116px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  padding: 12px;
  background: #ffffff;
  border: 1px solid #f1f2f5;
  border-radius: 16px;
  box-shadow: 0 10px 24px rgba(241, 102, 82, 0.06);
}

.dish-cover {
  display: block;
  width: 116px;
  height: 116px;
  object-fit: cover;
  border-radius: 12px;
  background: #f3f4f6;
}

.dish-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 116px;
}

.dish-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dish-head h2 {
  margin: 0;
  color: #232323;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.35;
}

.dish-id {
  display: inline-flex;
  width: fit-content;
  padding: 4px 10px;
  color: #ff7a6a;
  font-size: 12px;
  background: #fff1ee;
  border-radius: 999px;
}

.dish-desc {
  margin: 12px 0 0;
  color: #8f96a3;
  font-size: 13px;
  line-height: 1.5;
}

.dish-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: auto;
  color: #959aa6;
  font-size: 12px;
  line-height: 1.4;
}

.delete-inline-button {
  margin-left: auto;
  padding: 0;
  color: #ff7a6a;
  font-size: 13px;
  background: transparent;
  border: none;
}

.delete-inline-button:disabled {
  opacity: 0.65;
}

.delete-action {
  width: 74px;
  height: 100%;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  background: linear-gradient(180deg, #ff7e70 0%, #ff6355 100%);
  border: none;
}

.delete-action:disabled {
  opacity: 0.7;
}

.state-box,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(52vh + 32px);
  color: #9ca3af;
  font-size: 15px;
  text-align: center;
}

.empty-state span {
  margin-top: 8px;
  font-size: 13px;
}
</style>
