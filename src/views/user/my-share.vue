<script setup lang="ts">import { Left, Search2, HeartN } from '@nutui/icons-vue'
import { showToast } from '@nutui/nutui'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getUserShareList, type UserShareItem } from '../../api/user'

defineOptions({
  name: 'MyShare',
})

const router = useRouter()
const keyword = ref('')
const appliedKeyword = ref('')
const loading = ref(true)
const shareList = ref<UserShareItem[]>([])


function goBack() {
  router.push('/user/home')
}

function submitSearch() {
  loadShares();
}

async function loadShares() {
  loading.value = true

  try {
    const response = await getUserShareList({
      pageNum: 1,
      pageSize: -1,
      search: appliedKeyword.value.trim(),
    })
    shareList.value = response.data.records;
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '分享列表加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadShares()
})
</script>

<template>
  <section class="my-share-page">
    <header class="page-header">
      <button class="back-button" type="button" @click="goBack">
        <Left size="18" />
      </button>
      <h1 class="page-title">我的分享</h1>
      <div class="header-space" />
    </header>

    <section class="search-section">
      <div class="search-shell">
        <Search2 size="18" color="#8f96a3" />
        <input
          v-model="keyword"
          class="search-input"
          type="text"
          maxlength="20"
          placeholder="搜索标签"
          @keyup.enter="submitSearch"
        />
        <button class="search-button" type="button" @click="submitSearch">搜索</button>
      </div>
    </section>

    <section v-if="loading" class="state-text">正在加载我的分享...</section>
    <section v-else-if="!shareList.length" class="state-text">没有找到相关分享内容</section>
    <section v-else class="share-grid">
      <article v-for="item in shareList" :key="item.id" class="share-card">
        <img :src="item.imgPath" class="share-cover" />
        <div class="share-card-body">
          <h2 class="share-title">{{ item.dishName }}</h2>
          <div class="share-meta">
            <span class="share-likes">
              <HeartN size="17" color="#a9a9ad" />
              <span>{{ item.startCount }}</span>
            </span>
          </div>
        </div>
      </article>
    </section>
  </section>
</template>

<style scoped>
.my-share-page {
  min-height: 100vh;
  padding-bottom: 24px;
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

.search-section {
  padding: 18px 16px 10px;
}

.search-shell {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 46px;
  padding: 0 4px 0 12px;
  border: 1px solid #ffb9ae;
  border-radius: 17px;
  background: #ffffff;
}

.search-input {
  flex: 1;
  min-width: 0;
  color: #414141;
  font-size: 15px;
  background: transparent;
  border: none;
  outline: none;
}

.search-input::placeholder {
  color: #9da3ae;
}

.search-button {
  min-width: 68px;
  height: 38px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #ff8b7b 0, #ff715f 100%);
  border: none;
  border-radius: 14px;
}

.share-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px 14px;
  padding: 16px 16px 0;
}

.share-card {
  min-width: 0;
}

.share-cover {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1.28;
  object-fit: cover;
  border-radius: 10px;
  background: #f3f4f6;
}

.share-card-body {
  padding: 14px 6px 0;
}

.share-title {
  display: -webkit-box;
  min-height: 50px;
  margin: 0 0 10px;
  overflow: hidden;
  color: #232323;
  font-size: 17px;
  font-weight: 500;
  line-height: 1.45;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.share-meta {
  display: flex;
  justify-content: flex-end;
}

.share-likes {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #a7a7ac;
  font-size: 13px;
}

.state-text {
  padding: 46px 0;
  color: #9aa1ad;
  font-size: 15px;
  text-align: center;
}
</style>
emplate>
