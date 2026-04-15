<script setup lang="ts">
import { HeartN, Left, StarN, TriangleDown } from '@nutui/icons-vue'
import { showToast } from '@nutui/nutui'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getDishDetail } from '../../api/dish'
import {
  addShareComment,
  deleteShareComment,
  getShareCommentList,
  getShareDetail,
  type ShareCommentItem,
} from '../../api/share'
import noImage from '../../assets/img/no_image.svg'
import { resolveAssetUrl } from '../../utils/assets'

defineOptions({
  name: 'ShareDetail',
})

type ShareDetailView = {
  id: number
  dishId: number
  title: string
  cover: string
  author: string
  likes: number
  createTime: string
  description: string
  dishSummary: string
  dishBadges: string[]
  collectCount: number
}

type ShareCommentReplyView = {
  id: number
  parentId: number
  userId: number
  nickname: string
  content: string
  time: string
  likes: number
}

type ShareCommentView = ShareCommentReplyView & {
  childCount: number
  replies: ShareCommentReplyView[]
  repliesLoaded: boolean
}

const router = useRouter()
const route = useRoute()

const detail = ref<ShareDetailView | null>(null)
const comments = ref<ShareCommentView[]>([])
const loading = ref(true)
const commentLoading = ref(false)
const showCommentPopup = ref(false)
const submittingComment = ref(false)
const commentDraft = ref('')
const replyParentId = ref(0)
const replyTargetName = ref('')
const errorMessage = ref('')

const commentCount = computed(() =>
  comments.value.reduce((total, item) => total + 1, 0),
)

const heroImage = computed(() => detail.value?.cover || noImage)

function getShareId() {
  return Number(route.params.id || route.query.shareId || 0)
}

function getDishId() {
  return Number(detail.value?.dishId || route.query.dishId || 0)
}

function getCurrentUserId() {
  const directUserId = Number(localStorage.getItem('userId') || '')

  if (!Number.isNaN(directUserId) && directUserId > 0) {
    return directUserId
  }

  const rawUserInfo = localStorage.getItem('userInfo')

  if (!rawUserInfo) {
    return 0
  }

  try {
    const parsed = JSON.parse(rawUserInfo) as { id?: number; userId?: number }
    return Number(parsed.userId || parsed.id || 0)
  } catch {
    return 0
  }
}

const currentUserId = getCurrentUserId()

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/share-list')
}

function getAvatarText(name: string) {
  return (name || '?').slice(0, 1).toUpperCase()
}

function canDeleteComment(userId?: number) {
  return currentUserId > 0 && currentUserId === userId
}

function mapCommentReply(item: ShareCommentItem): ShareCommentReplyView {
  return {
    id: item.id,
    parentId: item.parentId,
    userId: Number(item.userId || 0),
    nickname: item.userName || '匿名用户',
    content: item.content || '',
    time: item.createTime || '',
    likes: Number(item.startCount || 0),
  }
}

function mapCommentItem(item: ShareCommentItem): ShareCommentView {
  const replies = Array.isArray(item.childCommentList)
    ? item.childCommentList.map(mapCommentReply)
    : []

  return {
    ...mapCommentReply(item),
    childCount: Number(item.childCount || replies.length),
    replies,
    repliesLoaded: false,
  }
}

async function loadCommentList(shareId: number) {
  commentLoading.value = true

  try {
    const response = await getShareCommentList(shareId, 0)
    comments.value = response.data.map(mapCommentItem)
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '评论加载失败')
  } finally {
    commentLoading.value = false
  }
}

async function loadPageData() {
  const shareId = getShareId()

  if (!shareId) {
    errorMessage.value = '分享信息不存在'
    loading.value = false
    return
  }

  loading.value = true

  try {
    const shareResponse = await getShareDetail(shareId)
    const shareData = shareResponse.data
    const dishResponse = await getDishDetail(shareData.dishId)
    const dishData = dishResponse.data
    const createTime = shareData.createTime || String(route.query.createTime || '').trim()
    const queryLikes = Number(route.query.likes || 0)

    detail.value = {
      id: shareData.id,
      dishId: shareData.dishId,
      title: shareData.dishName || dishData.name,
      cover: resolveAssetUrl(shareData.imgPath) || resolveAssetUrl(dishData.imgPath) || noImage,
      author: String(route.query.userName || '').trim() || '美食用户',
      likes: Number.isNaN(queryLikes) ? 0 : queryLikes,
      createTime: createTime || '',
      description: shareData.description || '暂无分享内容',
      dishSummary: `${dishData.collectCount}人收藏`,
      dishBadges: [`预计${dishData.takeTimes}`, `分享 ${dishData.shareCount}`],
      collectCount: dishData.collectCount,
    }

    errorMessage.value = ''
    await loadCommentList(shareId)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '分享详情加载失败'
  } finally {
    loading.value = false
  }
}

function toggleReplies(commentId: number) {
  comments.value = comments.value.map((item) => {
    if (item.id !== commentId || item.childCount === 0) {
      return item
    }

    return {
      ...item,
      repliesLoaded: !item.repliesLoaded,
    }
  })
}

function openCommentPopup(parentId = 0, targetName = '') {
  replyParentId.value = parentId
  replyTargetName.value = targetName
  commentDraft.value = ''
  showCommentPopup.value = true
}

function closeCommentPopup() {
  showCommentPopup.value = false
  commentDraft.value = ''
  replyParentId.value = 0
  replyTargetName.value = ''
}

function handleLikeComment(commentId: number) {
  comments.value = comments.value.map((comment) => {
    if (comment.id === commentId) {
      return { ...comment, likes: comment.likes + 1 }
    }

    return {
      ...comment,
      replies: comment.replies.map((reply) =>
        reply.id === commentId ? { ...reply, likes: reply.likes + 1 } : reply,
      ),
    }
  })
}

async function handleDeleteComment(commentId: number) {
  const confirmed = window.confirm('确认删除这条评论吗？')

  if (!confirmed) {
    return
  }

  const shareId = getShareId()

  if (!shareId) {
    return
  }

  try {
    await deleteShareComment({
      shareId: commentId,
      commentId,
    })
    showToast.success('删除成功')
    await loadCommentList(shareId)
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '删除失败')
  }
}

async function submitComment() {
  const content = commentDraft.value.trim()
  const shareId = getShareId()

  if (!content) {
    showToast.text('请输入评论内容')
    return
  }

  if (!shareId) {
    return
  }

  submittingComment.value = true

  try {
    await addShareComment({
      shareId,
      parentId: replyParentId.value,
      content,
    })
    closeCommentPopup()
    showToast.success('评论成功')
    await loadCommentList(shareId)
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '评论失败')
  } finally {
    submittingComment.value = false
  }
}

function handleShareAction() {
  showToast.text('发布按钮仅作占位展示')
}

onMounted(() => {
  void loadPageData()
})
</script>

<template>
  <section class="share-detail-page">
    <header class="page-header">
      <button class="header-back" type="button" @click="goBack">
        <Left size="18" color="#7f8792" />
      </button>
      <h1 class="page-title">分享详情</h1>
      <div class="header-placeholder" />
    </header>

    <section v-if="loading" class="page-state">正在加载分享内容...</section>
    <section v-else-if="errorMessage" class="page-state">{{ errorMessage }}</section>

    <section v-else-if="detail" class="page-scroll">
      <section class="detail-panel">
        <div class="dish-card">
          <img :src="heroImage" :alt="detail.title" class="dish-cover" />

          <div class="dish-info">
            <h2 class="dish-title">{{ detail.title }}</h2>
            <div class="dish-badges">
              <span v-for="badge in detail.dishBadges" :key="badge" class="dish-badge">{{ badge }}</span>
            </div>
            <p class="dish-summary">{{ detail.dishSummary }}</p>
          </div>

          <div class="dish-like">
            <StarN size="16" color="#b3a694" />
            <span>{{ detail.collectCount }}</span>
          </div>
        </div>

        <article class="description-card">
          <p>{{ detail.description }}</p>
        </article>

        <img :src="heroImage" :alt="detail.title" class="share-image" />
      </section>

      <div class="section-divider" />

      <section class="comment-panel comments-section">
        <h3 class="section-title">分享评论({{ commentCount }})</h3>
        <div v-if="commentLoading" class="comment-state">评论加载中...</div>
        <div v-else-if="!comments.length" class="comment-state">还没有评论，来抢个沙发吧</div>

        <article v-for="comment in comments" :key="comment.id" class="comment-card">
          <div class="comment-avatar">{{ getAvatarText(comment.nickname) }}</div>
          <div class="comment-body">
            <div class="comment-top">
              <div class="comment-copy">
                <p class="comment-name">{{ comment.nickname }}</p>
                <p class="comment-content">{{ comment.content }}</p>
                <p class="comment-meta">
                  {{ comment.time }}
                  <span class="comment-link" @click="openCommentPopup(comment.id, comment.nickname)">回复</span>
                  <span
                    v-if="canDeleteComment(comment.userId)"
                    class="comment-link"
                    @click="handleDeleteComment(comment.id)"
                  >
                    删除
                  </span>
                </p>
              </div>
<!--              <button type="button" class="comment-like" @click="handleLikeComment(comment.id)">
                <HeartN size="15" color="#a1a1aa" />
                <span>{{ comment.likes }}</span>
              </button>-->
            </div>

            <button
              v-if="comment.childCount"
              type="button"
              class="reply-toggle"
              @click="toggleReplies(comment.id)"
            >
              {{ comment.repliesLoaded ? '收起回复' : `展开 ${comment.childCount} 条回复` }}
              <TriangleDown
                size="12"
                color="#ff7a6a"
                :style="{ transform: comment.repliesLoaded ? 'rotate(180deg)' : 'rotate(0deg)' }"
              />
            </button>

            <div v-if="comment.repliesLoaded && comment.replies.length" class="reply-list">
              <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                <div class="reply-avatar">{{ getAvatarText(reply.nickname) }}</div>
                <div class="reply-content">
                  <div class="reply-top">
                    <div>
                      <p class="comment-name">{{ reply.nickname }}</p>
                      <p class="comment-content">{{ reply.content }}</p>
                      <p class="comment-meta">
                        {{ reply.time }}
                      </p>
                    </div>
<!--                    <button type="button" class="comment-like" @click="handleLikeComment(reply.id)">
                      <HeartN size="14" color="#a1a1aa" />
                      <span>{{ reply.likes }}</span>
                    </button>-->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </section>
    </section>

    <footer v-if="detail" class="detail-actionbar">
      <button class="comment-input" type="button" @click="openCommentPopup()">
        说点什么...
      </button>
      <button type="button" class="publish-button" @click="handleShareAction">
        发布
      </button>
    </footer>

    <div v-if="showCommentPopup" class="comment-popup-mask" @click="closeCommentPopup" />
    <section v-if="showCommentPopup" class="comment-popup">
      <div class="comment-popup-handle" />
      <h3 class="comment-popup-title">
        {{ replyParentId ? `回复 ${replyTargetName || '评论'}` : '发布评论' }}
      </h3>
      <textarea
        v-model="commentDraft"
        class="comment-textarea"
        maxlength="200"
        :placeholder="replyParentId ? '请输入回复内容' : '请输入评论内容'"
      />
      <div class="comment-popup-footer">
        <button class="comment-popup-cancel" type="button" @click="closeCommentPopup">取消</button>
        <button
          class="comment-popup-submit"
          type="button"
          :disabled="submittingComment"
          @click="submitComment"
        >
          {{ submittingComment ? '提交中...' : '提交' }}
        </button>
      </div>
    </section>
  </section>
</template>

<style scoped>
.share-detail-page {
  min-height: 100vh;
  height: 100vh;
  overflow-y: auto;
  background: #ffffff;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.share-detail-page::-webkit-scrollbar {
  display: none;
}

.page-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  align-items: center;
  padding: calc(env(safe-area-inset-top) + 14px) 12px 14px;
  background: #ffffff;
}

.header-back,
.header-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.header-back {
  padding: 0;
  background: transparent;
  border: none;
}

.page-title {
  margin: 0;
  color: #2b2b2b;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
}

.page-state {
  padding: 64px 18px;
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
}

.page-scroll {
  padding: 0 0 calc(92px + env(safe-area-inset-bottom));
}

.detail-panel {
  padding: 0;
  background: #ffffff;
}

.dish-card {
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  margin: 0 10px;
  padding: 8px;
  background: #ffffff;
  border: 1px solid #ffb573;
}

.dish-cover {
  width: 104px;
  height: 104px;
  object-fit: cover;
  border-radius: 4px;
}

.dish-info {
  min-width: 0;
}

.dish-title {
  margin: 0;
  color: #7a4a20;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
}

.dish-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.dish-badge {
  padding: 4px 1px;
  color: #7b6a58;
  font-size: 13px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.65);
  border-radius: 4px;
}

.dish-summary {
  margin: 14px 0 0;
  color: #b09a88;
  font-size: 15px;
}

.dish-like {
  align-self: end;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #b09a88;
  font-size: 13px;
}

.share-image {
  display: block;
  width: calc(100% - 32px);
  margin: 0 auto;
  aspect-ratio: 1 / 1.08;
  object-fit: cover;
  background: #f3f4f6;
}

.description-card {
  padding: 18px 16px 22px;
  background: #ffffff;
}

.description-card p {
  margin: 0;
  color: #444444;
  font-size: 15px;
  line-height: 1.8;
}

.section-divider {
  height: 1px;
  margin: 0;
  background: #f1f1f1;
}

.section-title {
  margin: 0 0 14px;
  padding: 18px 14px 0;
  color: #171717;
  font-size: 18px;
  font-weight: 800;
}

.comments-section {
  margin-bottom: 6px;
  background: #ffffff;
}

.comment-state {
  padding: 24px 0 10px;
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
}

.comment-card {
  display: flex;
  gap: 12px;
  padding: 14px 14px;
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

.comment-top,
.reply-top {
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

.comment-link {
  margin-left: 10px;
  color: inherit;
}

.comment-like {
  display: flex;
  align-items: center;
  gap: 3px;
  color: #9ca3af;
  font-size: 13px;
  background: transparent;
  border: none;
}

.reply-toggle {
  margin-top: 10px;
  padding: 0;
  color: rgb(255, 111, 97);
  font-size: 13px;
  background: transparent;
  border: none;
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
  min-width: 0;
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
  border-top: 1px solid rgba(244, 229, 225, 0.94);
}

.comment-input {
  flex: 1;
  height: 38px;
  padding: 0 14px;
  color: #b8b8b8;
  font-size: 14px;
  text-align: left;
  background: #f3f4f6;
  border: none;
  border-radius: 999px;
}

.publish-button {
  min-width: 56px;
  height: 38px;
  color: #ff6f61;
  font-size: 14px;
  font-weight: 700;
  background: transparent;
  border: none;
}

.comment-popup-mask {
  position: fixed;
  inset: 0;
  z-index: 39;
  background: rgba(17, 24, 39, 0.32);
}

.comment-popup {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 40;
  padding: 12px 18px calc(16px + env(safe-area-inset-bottom));
  background: #ffffff;
  border-radius: 22px 22px 0 0;
  box-shadow: 0 -12px 32px rgba(15, 23, 42, 0.12);
}

.comment-popup-handle {
  width: 42px;
  height: 5px;
  margin: 0 auto;
  background: #e5e7eb;
  border-radius: 999px;
}

.comment-popup-title {
  margin: 16px 0 0;
  color: #111827;
  font-size: 18px;
  font-weight: 800;
  text-align: center;
}

.comment-textarea {
  width: 100%;
  min-height: 120px;
  margin-top: 16px;
  padding: 14px;
  font-size: 14px;
  line-height: 1.6;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  outline: none;
  resize: none;
}

.comment-popup-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}

.comment-popup-cancel,
.comment-popup-submit {
  min-width: 84px;
  height: 40px;
  border: none;
  border-radius: 999px;
}

.comment-popup-cancel {
  color: #6b7280;
  background: #f3f4f6;
}

.comment-popup-submit {
  color: #ffffff;
  background: linear-gradient(135deg, #ff6f61, #ff9275);
}

.comment-popup-submit:disabled {
  opacity: 0.6;
}
</style>
