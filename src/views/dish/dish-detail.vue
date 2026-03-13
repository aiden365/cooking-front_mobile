<script setup lang="ts">
import {
  Edit,
  HeartFill,
  HeartN,
  Left,
  Message,
  ShareN,
  StarN,
  TriangleDown,
} from '@nutui/icons-vue'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getDishDetail, type DishCommentReply, type DishDetail } from '../../api/dish'

defineOptions({
  name: 'DishDetail',
})

const router = useRouter()
const route = useRoute()
const detail = ref<DishDetail | null>(null)
const loading = ref(false)
const errorMessage = ref('')
const showAllSteps = ref(false)

const visibleSteps = computed(() => {
  if (!detail.value) {
    return []
  }

  return showAllSteps.value ? detail.value.steps : detail.value.steps.slice(0, 3)
})

async function loadDishDetail() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await getDishDetail(String(route.params.id || 1))
    detail.value = response.data
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '菜谱详情加载失败'
  } finally {
    loading.value = false
  }
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/dish/list')
}

function getAvatarText(name: string) {
  return name.slice(0, 1).toUpperCase()
}

function toggleFavorite() {
  if (!detail.value) {
    return
  }

  detail.value.isFavorite = !detail.value.isFavorite
}

function renderReplyPrefix(reply: DishCommentReply) {
  return `${reply.nickname}`
}

onMounted(() => {
  loadDishDetail()
})
</script>

<template>
  <section class="detail-page">
    <div v-if="loading" class="page-state">菜谱详情加载中...</div>
    <div v-else-if="errorMessage" class="page-state">{{ errorMessage }}</div>
    <template v-else-if="detail">
      <header class="detail-hero">
        <img :src="detail.cover" :alt="detail.title" class="hero-image" />
        <button class="back-button" type="button" @click="goBack">
          <Left color="#ffffff" size="18" />
        </button>
        <div class="gallery-count">
          <Message size="14" color="#ffffff" />
          <span>{{ detail.galleryCount }}</span>
        </div>
      </header>

      <section class="detail-section detail-intro">
        <div class="intro-main">
          <h1 class="dish-title">{{ detail.title }}</h1>
          <p class="dish-stats">
            浏览{{ detail.browseCount }} · 收藏{{ detail.favoriteCount }} · {{ detail.cookedCount }}
          </p>
        </div>
        <button class="favorite-button" type="button" @click="toggleFavorite">
          <component
            :is="detail.isFavorite ? HeartFill : HeartN"
            :color="detail.isFavorite ? 'rgb(255,111,97)' : 'rgb(255,111,97)'"
            size="18"
          />
          <span>{{ detail.isFavorite ? '已收藏' : '收藏' }}</span>
        </button>
      </section>

      <section class="detail-section">
        <h2 class="section-title">主料清单</h2>
        <div class="list-block">
          <div v-for="item in detail.ingredients" :key="item.name" class="list-row">
            <span>{{ item.name }}</span>
            <strong>{{ item.amount }}</strong>
          </div>
        </div>
      </section>

      <section class="detail-section">
        <h2 class="section-title">调料清单</h2>
        <div class="list-block">
          <div v-for="item in detail.seasonings" :key="item.name" class="list-row">
            <span>{{ item.name }}</span>
            <strong>{{ item.amount }}</strong>
          </div>
        </div>
      </section>

      <section class="detail-section">
        <div class="section-head">
          <h2 class="section-title">烹饪步骤</h2>
        </div>

        <article v-for="(step, index) in visibleSteps" :key="step.id" class="step-card">
          <p class="step-text">
            <strong>步骤{{ index + 1 }}/{{ detail.steps.length }}</strong>
            {{ step.description }}
          </p>
          <div class="step-gallery" :class="{ 'step-gallery-double': step.images.length > 1 }">
            <img v-for="image in step.images" :key="image" :src="image" :alt="step.description" />
          </div>
        </article>

        <button class="expand-button" type="button" @click="showAllSteps = !showAllSteps">
          <span>{{ showAllSteps ? '收起步骤' : '查看全部' }}</span>
          <TriangleDown
            size="10"
            color="#6b7280"
            :style="{ transform: showAllSteps ? 'rotate(180deg)' : 'rotate(0deg)' }"
          />
        </button>
      </section>

      <section class="detail-section comments-section">
        <h2 class="section-title">菜谱评论({{ detail.commentCount }})</h2>

        <article v-for="comment in detail.comments" :key="comment.id" class="comment-card">
          <div class="comment-avatar">{{ getAvatarText(comment.nickname) }}</div>
          <div class="comment-body">
            <div class="comment-top">
              <div>
                <p class="comment-name">{{ comment.nickname }}</p>
                <p class="comment-content">{{ comment.content }}</p>
                <p class="comment-meta">{{ comment.time }}&nbsp;&nbsp;回复</p>
              </div>
              <div class="comment-like">
                <HeartN size="14" color="#9ca3af" />
                <span>{{ comment.likes }}</span>
              </div>
            </div>

            <div v-if="comment.replies.length" class="reply-list">
              <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                <div class="reply-avatar">{{ getAvatarText(reply.nickname) }}</div>
                <div class="reply-content">
                  <p class="comment-name">{{ renderReplyPrefix(reply) }}</p>
                  <p class="comment-content">{{ reply.content }}</p>
                  <div class="reply-bottom">
                    <p class="comment-meta">{{ reply.time }}&nbsp;&nbsp;回复</p>
                    <div class="comment-like">
                      <HeartN size="14" color="#9ca3af" />
                      <span>{{ reply.likes || '' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </section>
    </template>

    <footer v-if="detail" class="detail-actionbar">
      <div class="comment-input">说点什么...</div>
      <button type="button" class="action-item">
        <StarN size="18" color="#8b8b8b" />
        <span>评分</span>
      </button>
      <button type="button" class="action-item">
        <Edit size="18" color="#8b8b8b" />
        <span>记录</span>
      </button>
      <button type="button" class="action-item">
        <ShareN size="18" color="#8b8b8b" />
        <span>分享</span>
      </button>
    </footer>
  </section>
</template>

<style scoped>
.detail-page {
  min-height: 100vh;
  padding-bottom: 92px;
  background: #f4f4f4;
}

.page-state {
  padding: 48px 16px;
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
}

.detail-hero {
  position: relative;
  height: 318px;
  overflow: hidden;
  background: #ddd;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.back-button {
  position: absolute;
  top: calc(env(safe-area-inset-top) + 12px);
  left: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: rgba(17, 24, 39, 0.38);
  border: none;
  border-radius: 999px;
  backdrop-filter: blur(6px);
}

.gallery-count {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  color: #ffffff;
  font-size: 12px;
  background: rgba(17, 24, 39, 0.52);
  border-radius: 999px;
}

.detail-section {
  margin-top: 8px;
  padding: 18px 14px;
  background: #ffffff;
}

.detail-intro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.intro-main {
  min-width: 0;
}

.dish-title {
  margin: 0;
  color: #222;
  font-size: 29px;
  font-weight: 800;
}

.dish-stats {
  margin-top: 10px;
  color: #9ca3af;
  font-size: 14px;
}

.favorite-button {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  color: rgb(255, 111, 97);
  font-size: 14px;
  font-weight: 700;
  background: #fff;
  border: 1px solid rgb(255, 111, 97);
  border-radius: 999px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.section-title {
  margin: 0 0 14px;
  color: #171717;
  font-size: 18px;
  font-weight: 800;
}

.section-head .section-title {
  margin-bottom: 0;
}

.cook-mode {
  color: rgb(255, 111, 97);
  font-size: 14px;
  font-weight: 700;
  background: transparent;
  border: none;
}

.list-block {
  border-top: 1px solid #f1f1f1;
}

.list-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 0;
  color: #444;
  font-size: 15px;
  border-bottom: 1px solid #f1f1f1;
}

.list-row strong {
  color: #2b2b2b;
  font-weight: 700;
}

.step-card + .step-card {
  margin-top: 18px;
}

.step-text {
  margin: 0 0 12px;
  color: #303133;
  font-size: 16px;
  line-height: 1.7;
}

.step-text strong {
  margin-right: 8px;
  color: #111827;
}

.step-gallery {
  display: grid;
  gap: 10px;
}

.step-gallery img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 12px;
}

.step-gallery-double {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.step-gallery-double img {
  height: 172px;
}

.expand-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 100%;
  margin-top: 16px;
  color: #6b7280;
  font-size: 15px;
  background: transparent;
  border: none;
}

.comments-section {
  margin-bottom: 6px;
}

.comment-card {
  display: flex;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid #f1f1f1;
}

.comment-avatar,
.reply-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 700;
  background: #9fd6b2;
  border-radius: 999px;
}

.comment-avatar {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.comment-name {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  font-weight: 700;
}

.comment-content {
  margin: 4px 0 0;
  color: #222;
  font-size: 16px;
  line-height: 1.5;
}

.comment-meta {
  margin: 6px 0 0;
  color: #9ca3af;
  font-size: 13px;
}

.comment-like {
  display: flex;
  align-items: center;
  gap: 3px;
  color: #9ca3af;
  font-size: 13px;
}

.reply-list {
  margin-top: 14px;
  padding-left: 6px;
}

.reply-item {
  display: flex;
  gap: 10px;
}

.reply-item + .reply-item {
  margin-top: 14px;
}

.reply-avatar {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  font-size: 12px;
}

.reply-content {
  flex: 1;
}

.reply-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.detail-actionbar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.98);
  border-top: 1px solid #ececec;
}

.comment-input {
  flex: 1;
  height: 38px;
  padding: 0 14px;
  color: #b8b8b8;
  font-size: 14px;
  line-height: 38px;
  background: #f3f4f6;
  border-radius: 999px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 34px;
  color: #8b8b8b;
  font-size: 12px;
  background: transparent;
  border: none;
}
</style>
