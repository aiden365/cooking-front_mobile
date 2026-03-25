<script setup lang="ts">
import { Search2, StarN } from '@nutui/icons-vue'
import { showToast } from '@nutui/nutui'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import backgroundImage from '../../assets/img/background1.png'
import bowlImage from '../../assets/img/bowl.png'
import dishImage1 from '../../assets/img/dish1.png'
import dishImage2 from '../../assets/img/dish2.png'

defineOptions({
  name: 'DishList',
})

type DishCategory =
  | '热门专题'
  | '禽类肉类'
  | '蔬菜水果'
  | '汤粥主食'
  | '水产海鲜'
  | '蛋奶豆制品'
  | '米面杂粮'
  | '烘焙西点'
  | '甜品饮料'
  | '腌咸制品'
  | '特色小吃'
  | '烧烤炸串'
  | '节日节气'

type DishListItem = {
  id: number
  name: string
  duration: string
  difficulty: string
  style: string
  madeCount: string
  favoriteText: string
  category: DishCategory
  cover: string
  hasVideo?: boolean
}

const router = useRouter()
const keyword = ref('')
const currentPage = ref(1)
const pageSize = 4
const isLoadingMore = ref(false)

const categories: DishCategory[] = [
  '热门专题',
  '禽类肉类',
  '蔬菜水果',
  '汤粥主食',
  '水产海鲜',
  '蛋奶豆制品',
  '米面杂粮',
  '烘焙西点',
  '甜品饮料',
  '腌咸制品',
  '特色小吃',
  '烧烤炸串',
  '节日节气',
]

const activeCategory = ref<DishCategory>('热门专题')

const allDishes: DishListItem[] = [
  {
    id: 11,
    name: '荷塘小炒',
    duration: '15分钟',
    difficulty: '零厨艺',
    style: '清爽鲜香',
    madeCount: '125人做过',
    favoriteText: '1.2w',
    category: '热门专题',
    cover: backgroundImage,
    hasVideo: true,
  },
  {
    id: 12,
    name: '麻婆豆腐',
    duration: '15分钟',
    difficulty: '用料少',
    style: '超下饭',
    madeCount: '63人做过',
    favoriteText: '9855',
    category: '热门专题',
    cover: bowlImage,
  },
  {
    id: 1,
    name: '红烧排骨',
    duration: '15分钟',
    difficulty: '零厨艺',
    style: '浓香入味',
    madeCount: '49人做过',
    favoriteText: '1.2w',
    category: '禽类肉类',
    cover: dishImage1,
  },
  {
    id: 13,
    name: '干锅花菜',
    duration: '15分钟',
    difficulty: '零厨艺',
    style: '焦香脆嫩',
    madeCount: '120人做过',
    favoriteText: '1.6w',
    category: '蔬菜水果',
    cover: dishImage2,
    hasVideo: true,
  },
  {
    id: 14,
    name: '冬瓜排骨汤',
    duration: '35分钟',
    difficulty: '家常汤品',
    style: '清甜不腻',
    madeCount: '88人做过',
    favoriteText: '7560',
    category: '汤粥主食',
    cover: backgroundImage,
  },
  {
    id: 15,
    name: '蒜蓉粉丝虾',
    duration: '20分钟',
    difficulty: '宴客菜',
    style: '鲜香入味',
    madeCount: '72人做过',
    favoriteText: '8921',
    category: '水产海鲜',
    cover: bowlImage,
  },
  {
    id: 16,
    name: '西红柿炒蛋',
    duration: '10分钟',
    difficulty: '零失败',
    style: '酸甜开胃',
    madeCount: '132人做过',
    favoriteText: '1.8w',
    category: '蛋奶豆制品',
    cover: bowlImage,
  },
  {
    id: 17,
    name: '葱油拌面',
    duration: '12分钟',
    difficulty: '快手主食',
    style: '葱香浓郁',
    madeCount: '95人做过',
    favoriteText: '6688',
    category: '米面杂粮',
    cover: backgroundImage,
  },
  {
    id: 18,
    name: '纸杯蛋糕',
    duration: '40分钟',
    difficulty: '新手烘焙',
    style: '松软香甜',
    madeCount: '56人做过',
    favoriteText: '5250',
    category: '烘焙西点',
    cover: dishImage2,
  },
  {
    id: 19,
    name: '杨枝甘露',
    duration: '18分钟',
    difficulty: '夏日甜品',
    style: '冰爽顺滑',
    madeCount: '61人做过',
    favoriteText: '7190',
    category: '甜品饮料',
    cover: bowlImage,
  },
  {
    id: 20,
    name: '自制腊肠炒饭',
    duration: '18分钟',
    difficulty: '香气十足',
    style: '粒粒分明',
    madeCount: '40人做过',
    favoriteText: '4032',
    category: '腌咸制品',
    cover: dishImage1,
  },
  {
    id: 21,
    name: '葱油饼',
    duration: '25分钟',
    difficulty: '街头风味',
    style: '外酥里软',
    madeCount: '84人做过',
    favoriteText: '8120',
    category: '特色小吃',
    cover: dishImage2,
  },
  {
    id: 22,
    name: '香辣鸡翅',
    duration: '30分钟',
    difficulty: '聚会小食',
    style: '麻辣过瘾',
    madeCount: '77人做过',
    favoriteText: '9340',
    category: '烧烤炸串',
    cover: dishImage1,
  },
  {
    id: 23,
    name: '腊八粥',
    duration: '45分钟',
    difficulty: '节日必备',
    style: '软糯香甜',
    madeCount: '58人做过',
    favoriteText: '6420',
    category: '节日节气',
    cover: backgroundImage,
  },
]

const filteredDishes = computed(() => {
  if (activeCategory.value === '热门专题') {
    return allDishes
  }

  return allDishes.filter((item) => item.category === activeCategory.value)
})

const visibleDishes = computed(() => filteredDishes.value.slice(0, currentPage.value * pageSize))
const hasMore = computed(() => visibleDishes.value.length < filteredDishes.value.length)

function selectCategory(category: DishCategory) {
  activeCategory.value = category
  currentPage.value = 1
}

function handleSearch() {
  const trimmedKeyword = keyword.value.trim()

  if (!trimmedKeyword) {
    showToast.text('请输入菜名')
    return
  }

  router.push({
    path: '/dish/search',
    query: {
      keyword: trimmedKeyword,
    },
  })
}

function goDetail(id: number) {
  router.push(`/dish/detail/${id}`)
}

function loadMore() {
  if (!hasMore.value || isLoadingMore.value) {
    return
  }

  isLoadingMore.value = true

  window.setTimeout(() => {
    currentPage.value += 1
    isLoadingMore.value = false
  }, 240)
}

function handleListScroll(event: Event) {
  const target = event.target as HTMLElement

  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 90) {
    loadMore()
  }
}
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
        <button
          v-for="category in categories"
          :key="category"
          type="button"
          class="category-item"
          :class="{ 'category-item-active': activeCategory === category }"
          @click="selectCategory(category)"
        >
          {{ category }}
        </button>
      </aside>

      <div class="dish-panel" @scroll.passive="handleListScroll">
        <article
          v-for="dish in visibleDishes"
          :key="dish.id"
          class="dish-card"
          @click="goDetail(dish.id)"
        >
          <div class="cover-wrap">
            <img :src="dish.cover" :alt="dish.name" class="dish-cover" />
            <div v-if="dish.hasVideo" class="play-badge">
              <span class="play-triangle" />
            </div>
          </div>

          <div class="dish-info">
            <h2>{{ dish.name }}</h2>
            <div class="dish-tags">
              <span>{{ dish.duration }}</span>
              <span>{{ dish.difficulty }}</span>
              <span>{{ dish.style }}</span>
            </div>
            <div class="dish-footer">
              <span class="made-count">{{ dish.madeCount }}</span>
              <span class="favorite-count">
                <StarN size="16" color="#a8a8ad" />
                {{ dish.favoriteText }}
              </span>
            </div>
          </div>
        </article>

        <footer class="list-footer">
          <span v-if="isLoadingMore">加载中...</span>
          <span v-else-if="hasMore">下拉继续加载</span>
          <span v-else>已经到底啦</span>
        </footer>
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

.dish-panel {
  flex: 1;
  overflow-y: auto;
  padding: 4px 10px 18px 8px;
  background: #f6f6f6;
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
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 8px;
  margin-top: 24px;
  color: #2d2d2d;
  font-size: 14px;
}

.dish-tags span:last-child:nth-child(odd) {
  grid-column: 1 / -1;
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

.list-footer {
  padding: 10px 0 calc(12px + env(safe-area-inset-bottom));
  color: #b3b3b9;
  font-size: 13px;
  text-align: center;
}
</style>
