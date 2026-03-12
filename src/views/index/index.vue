<template>
  <div class="index-page">
    <!-- 顶部搜索 -->
    <div class="search-bar-container">
      <nut-searchbar v-model="searchValue" placeholder="搜索菜谱、食材"></nut-searchbar>
    </div>

    <!-- 今日计划 -->
    <div class="today-plan-section">
      <nut-cell title="今日计划" desc=""></nut-cell>
      <div class="plan-items">
        <nut-grid :column-num="3" :border="false">
          <nut-grid-item text="早餐"><nut-icon name="eat"/></nut-grid-item>
          <nut-grid-item text="午餐"><nut-icon name="eat"/></nut-grid-item>
          <nut-grid-item text="晚餐"><nut-icon name="eat"/></nut-grid-item>
        </nut-grid>
      </div>
    </div>

    <!-- 菜谱瀑布流 -->
    <div class="recipe-list-section">
      <nut-cell title="热门推荐"></nut-cell>
      <div class="recipe-waterfall">
        <div v-for="item in recipeList" :key="item.id" class="recipe-item">
          <img :src="item.imageUrl" alt="" class="recipe-image">
          <div class="recipe-info">
            <p class="recipe-title">{{ item.title }}</p>
            <div class="author-info">
              <nut-avatar size="small" :src="item.authorAvatar"></nut-avatar>
              <span class="author-name">{{ item.authorName }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const searchValue = ref('');

const recipeList = ref([
  {
    id: 1,
    title: '美味的红烧肉',
    imageUrl: 'https://via.placeholder.com/150',
    authorAvatar: 'https://via.placeholder.com/30',
    authorName: '美食家A',
  },
  {
    id: 2,
    title: '清爽的凉拌黄瓜',
    imageUrl: 'https://via.placeholder.com/150',
    authorAvatar: 'https://via.placeholder.com/30',
    authorName: '大厨B',
  },
  // ... more items
]);

</script>

<style scoped>
.index-page {
  padding: 0 16px;
}

.search-bar-container {
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  padding: 8px 0;
}

.today-plan-section, .recipe-list-section {
  margin-top: 16px;
}

.recipe-waterfall {
  column-count: 2;
  column-gap: 8px;
}

.recipe-item {
  break-inside: avoid;
  margin-bottom: 8px;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.recipe-image {
  width: 100%;
  display: block;
}

.recipe-info {
  padding: 8px;
}

.recipe-title {
  font-size: 14px;
  font-weight: bold;
  margin: 0;
}

.author-info {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.author-name {
  margin-left: 8px;
  font-size: 12px;
  color: #888;
}
</style>
