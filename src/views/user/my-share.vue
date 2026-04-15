<script setup lang="ts">
import { Left, Search2, Date } from '@nutui/icons-vue'
import { showToast } from '@nutui/nutui'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getSharePage, type ShareListItem } from '../../api/share'
import { resolveAssetUrl } from '../../utils/assets'
import { getCurrentUserInfo } from '../../utils/user'


defineOptions({
  name: 'SharesList',
})

const router = useRouter()
const searchKeyword = ref('')
const appliedKeyword = ref('')
const shareList = ref<ShareListItem[]>([])
const loading = ref(false)
const refreshing = ref(false)
const loadingMore = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const total = ref(0)
const pageSize = 7
const hasMore = computed(() => currentPage.value < totalPages.value)
const isEmpty = computed(() => !loading.value && shareList.value.length === 0)

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/')
}

async function fetchShareList(pageNum = 1, reset = false) {
  if (reset) {
    loading.value = true
  } else {
    loadingMore.value = true
  }

  try {
    const userInfo = getCurrentUserInfo();
    const response = await getSharePage({
      pageNum,
      pageSize,
      userId: userInfo.userId,
      dishName: appliedKeyword.value
    })

    const { records, current, pages, total: totalCount } = response.data
    currentPage.value = current
    totalPages.value = pages || 1
    total.value = totalCount
    shareList.value = reset ? records : [...shareList.value, ...records]
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '分享列表加载失败')
  } finally {
    loading.value = false
    loadingMore.value = false
    refreshing.value = false
  }
}

async function refreshList() {
  if (refreshing.value) {
    return
  }

  refreshing.value = true
  setTimeout(() => {
    fetchShareList(1, true)
  }, 3000)

}

async function loadMore() {
  await fetchShareList(currentPage.value + 1, false)
}

async function submitSearch() {
  appliedKeyword.value = searchKeyword.value.trim()
  totalPages.value = 1
  currentPage.value = 1
  await fetchShareList(1, true)
}

onMounted(() => {
  void fetchShareList(1, true)
})
</script>

<template>
  <section class="share-list-page">
    <div class="top-panel">
      <header class="page-header">
        <button class="header-side" type="button" aria-label="返回" @click="goBack">
          <Left size="16" color="#8a8a8a" />
        </button>
        <h1>我的分享</h1>
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
            <div v-if="loading" class="state-box">正在加载分享内容...</div>
            <template v-else-if="!isEmpty">
              <section class="share-grid">
                <article
                    v-for="item in shareList"
                    :key="item.id"
                    class="share-card"
                    @click="router.push({
                    name: 'ShareDetail',
                    params: { id: String(item.id) },
                    query: {
                      dishId: String(item.dishId),
                      dishName: item.dishName,
                      imgPath: item.imgPath,
                      userName: item.userName,
                      likes: String(item.startCount),
                      createTime: item.createTime,
                    },
                  })"
                >
                  <img :src="resolveAssetUrl(item.imgPath)" class="share-cover" />
                  <h2>{{ item.dishName }}</h2>
                  <div class="share-meta">
                    <span class="author">删除</span>
                  </div>
                </article>
              </section>
            </template>

            <div v-else class="empty-state">
              <p>没有找到相关菜品分享</p>
              <span>换个菜名再试试吧</span>
            </div>
          </div>
        </nut-pull-refresh>
      </nut-infinite-loading>
    </section>
  </section>
</template>

<style scoped>
.share-list-page {
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
  margin-top: 20px;
  min-height: calc(100vh - var(--top-panel-height));
}

.share-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 14px;
  padding: 8px 22px 0;
}

.share-card {
  min-width: 0;
  cursor: pointer;
}

.share-cover {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1.42;
  object-fit: cover;
  border-radius: 10px;
  background: #f3f4f6;
}

.share-card h2 {
  margin: 12px 0 10px;
  color: #232323;
  font-size: 17px;
  font-weight: 500;
  line-height: 1.35;
}

.share-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.author,
.likes {
  color: #a7a7ac;
  font-size: 13px;
}

.author {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.likes {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
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

.list-footer {
  padding: 18px 0 10px;
  color: #b1b1b7;
  font-size: 13px;
  text-align: center;
}
</style>
