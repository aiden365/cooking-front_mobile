<script setup lang="ts">
import { Left, Search2, HeartN } from '@nutui/icons-vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import backgroundImage from '../../assets/img/background1.png'
import bowlImage from '../../assets/img/bowl.png'
import dishImage1 from '../../assets/img/dish1.png'
import dishImage2 from '../../assets/img/dish2.png'

defineOptions({
  name: 'SharesList',
})

type ShareItem = {
  id: number
  title: string
  author: string
  likes: number
  cover: string
}

const router = useRouter()
const searchKeyword = ref('')
const appliedKeyword = ref('')
const pageSize = 4
const currentPage = ref(1)
const isLoadingMore = ref(false)

const shareList: ShareItem[] = [
  { id: 1, title: '红烧排骨', author: '美食课代表', likes: 93, cover: dishImage1 },
  { id: 2, title: '鸡蛋火腿炒青椒', author: '美食课代表', likes: 126, cover: dishImage2 },
  { id: 3, title: '青椒炒鸡蛋', author: '美食课代表', likes: 93, cover: backgroundImage },
  { id: 4, title: '西红柿炒蛋', author: '美食课代表', likes: 93, cover: bowlImage },
  { id: 5, title: '蒜香排骨', author: '下厨达人', likes: 108, cover: dishImage1 },
  { id: 6, title: '青椒火腿炒蛋', author: '家常菜小馆', likes: 87, cover: dishImage2 },
  { id: 7, title: '番茄滑蛋', author: '每日一菜', likes: 76, cover: bowlImage },
  { id: 8, title: '小炒鸡蛋', author: '烟火食堂', likes: 65, cover: backgroundImage },
]

const filteredShares = computed(() => {
  const keyword = appliedKeyword.value.trim()

  if (!keyword) {
    return shareList
  }

  return shareList.filter((item) => item.title.includes(keyword))
})

const visibleShares = computed(() => filteredShares.value.slice(0, currentPage.value * pageSize))
const hasMore = computed(() => visibleShares.value.length < filteredShares.value.length)
const isEmpty = computed(() => filteredShares.value.length === 0)

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/')
}

function submitSearch() {
  appliedKeyword.value = searchKeyword.value.trim()
  currentPage.value = 1
}

function loadMore() {
  if (!hasMore.value || isLoadingMore.value) {
    return
  }

  isLoadingMore.value = true

  window.setTimeout(() => {
    currentPage.value += 1
    isLoadingMore.value = false
  }, 260)
}

function handleScroll() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const viewportHeight = window.innerHeight
  const fullHeight = document.documentElement.scrollHeight

  if (scrollTop + viewportHeight >= fullHeight - 120) {
    loadMore()
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <section class="share-list-page">
    <div class="top-panel">
      <header class="page-header">
        <button class="header-side" type="button" aria-label="返回" @click="goBack">
          <Left size="16" color="#8a8a8a" />
        </button>
        <h1>美食圈子</h1>
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

    <section v-if="!isEmpty" class="share-grid">
      <article v-for="item in visibleShares" :key="item.id" class="share-card">
        <img :src="item.cover" :alt="item.title" class="share-cover" />
        <h2>{{ item.title }}</h2>
        <div class="share-meta">
          <span class="author">{{ item.author }}</span>
          <span class="likes">
            <HeartN size="17" color="#a9a9ad" />
            <span>{{ item.likes }}</span>
          </span>
        </div>
      </article>
    </section>

    <div v-else class="empty-state">
      <p>没有找到相关菜品分享</p>
      <span>换个菜名再试试吧</span>
    </div>

    <footer v-if="!isEmpty" class="list-footer">
      <span v-if="isLoadingMore">加载中...</span>
      <span v-else-if="hasMore">下拉继续加载</span>
      <span v-else>已经到底啦</span>
    </footer>
  </section>
</template>

<style scoped>
.share-list-page {
  min-height: 100vh;
  padding-bottom: calc(88px + env(safe-area-inset-bottom));
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

.share-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 14px;
  padding: calc(env(safe-area-inset-top) + 96px) 22px 0;
}

.share-card {
  min-width: 0;
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(52vh + 96px);
  padding-top: calc(env(safe-area-inset-top) + 96px);
  color: #9ca3af;
  font-size: 15px;
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
