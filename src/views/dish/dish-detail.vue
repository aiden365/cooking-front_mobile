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
import { showToast } from '@nutui/nutui'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  addDishCollect,
  getDishAppraiseTotal,
  addDishComment,
  deleteDishCollect,
  deleteDishComment,
  getDishCommentList,
  getDishDetail,
  getDishFlavorList,
  getDishMaterialList,
  getDishStepList,
  getDishUserAppraiseRecord,
  submitDishAppraise,
  type DishAppraiseRecordItem,
  type DishAppraiseTotalData,
  starDishComment,
  type DishCommentItem,
  type DishFlavorItem,
  type DishMaterialItem,
  type DishStepItem,
} from '../../api/dish'
import { getSystemLabels, getUserLabels, type SystemLabel } from '../../api/label'

defineOptions({
  name: 'DishDetail',
})

type DetailStepView = {
  id: number
  description: string
  images: string[]
}

type DetailCommentReplyView = {
  id: number
  parentId: number
  userId: number
  nickname: string
  content: string
  time: string
  likes: number
}

type DetailCommentView = DetailCommentReplyView & {
  childCount: number
  replies: DetailCommentReplyView[]
  repliesLoaded: boolean
  repliesLoading: boolean
}

type DetailViewModel = {
  id: number
  title: string
  takeTimes: string
  viewCount: number
  collectCount: number
  isFavorite: boolean
  shareCount: number
  cover: string
  checkStatus:number
}

const router = useRouter()
const route = useRoute()

const detail = ref<DetailViewModel | null>(null)
const materials = ref<DishMaterialItem[]>([])
const flavors = ref<DishFlavorItem[]>([])
const steps = ref<DetailStepView[]>([])
const comments = ref<DetailCommentView[]>([])
const loading = ref(false)
const commentLoading = ref(false)
const favoriteLoading = ref(false)
const submittingComment = ref(false)
const errorMessage = ref('')
const showAllSteps = ref(false)
const showAIPanel = ref(false)
const showCommentPopup = ref(false)
const showScorePopup = ref(false)
const aiButtonTop = ref(360)
const isDragging = ref(false)
const movedDuringDrag = ref(false)
const aiLabels = ref<SystemLabel[]>([])
const selectedLabelIds = ref<number[]>([])
const aiLoading = ref(false)
const aiLoaded = ref(false)
const aiErrorMessage = ref('')
const commentDraft = ref('')
const replyParentId = ref(0)
const replyTargetName = ref('')
const scoreLoading = ref(false)
const scoreSubmitting = ref(false)
const scoreLoaded = ref(false)
const scoreStats = ref<DishAppraiseTotalData>({
  dishId: 0,
  manipulationAvg: 0,
  equalAvg: 0,
  satisfactionAvg: 0,
  totalScore: 0,
})
const userScore = ref<DishAppraiseRecordItem>({
  manipulationScore: 0,
  equalScore: 0,
  satisfactionScore: 0,
})

let pointerStartY = 0
let buttonStartTop = 0

const currentUserId = getCurrentUserId()

const visibleSteps = computed(() => {
  return showAllSteps.value ? steps.value : steps.value.slice(0, 3)
})

const commentCount = computed(() =>
  comments.value.reduce((total, item) => total + 1 + item.childCount, 0),
)

const heroCount = computed(() => steps.value.length)
const totalScorePercent = computed(() => getScorePercent(scoreStats.value.totalScore))
const scoreDimensionList = computed(() => [
  {
    key: 'manipulationScore' as const,
    label: '操作性',
    average: scoreStats.value.manipulationAvg,
  },
  {
    key: 'equalScore' as const,
    label: '匹配度',
    average: scoreStats.value.equalAvg,
  },
  {
    key: 'satisfactionScore' as const,
    label: '满意度',
    average: scoreStats.value.satisfactionAvg,
  },
])
const aiNoticeText = computed(() => {
  if (!detail.value) {
    return ''
  }

  if (detail.value.checkStatus === 2) {
    return 'AI生成声明：该菜谱内容由 AI 生成并已经过人工校准，请结合实际烹饪场景灵活调整。'
  }

  return 'AI生成声明：该菜谱内容由 AI 生成，暂未经过人工校准，请谨慎参考并结合实际情况调整。'
})

function getDishId() {
  return Number(route.params.id || 0)
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

function resolveMediaPath(path?: string) {
  if (!path) {
    return ''
  }

  if (/^https?:\/\//.test(path)) {
    return path
  }

  if (path.startsWith('/')) {
    return `http://192.168.50.100:8083${path}`
  }

  return path
}

function mapStepList(stepList: DishStepItem[]) {
  return [...stepList]
    .sort((a, b) => a.sort - b.sort)
    .map<DetailStepView>((item) => {
      const image = resolveMediaPath(item.stepImage)

      return {
        id: item.id,
        description: item.stepDescribe,
        images: image ? [image] : [],
      }
    })
}

function mapReplyItem(item: DishCommentItem): DetailCommentReplyView {
  return {
    id: item.id,
    parentId: item.parentId,
    userId: item.userId,
    nickname: item.userName,
    content: item.content,
    time: item.createTime,
    likes: item.startCount,
  }
}

async function loadCommentList(dishId: number) {
  commentLoading.value = true
  try {
    const parentResponse = await getDishCommentList(dishId, 0)
    comments.value = parentResponse.data.map<DetailCommentView>((comment) => ({
      ...mapReplyItem(comment),
      childCount: comment.childCount,
      replies: [],
      repliesLoaded: false,
      repliesLoading: false,
    }))
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '评论加载失败')
  } finally {
    commentLoading.value = false
  }
}

async function toggleReplies(commentId: number) {
  const dishId = getDishId()
  const current = comments.value.find((item) => item.id === commentId)

  if (!current || current.childCount === 0) {
    return
  }

  if (current.repliesLoaded) {
    comments.value = comments.value.map((item) =>
      item.id === commentId
        ? { ...item, repliesLoaded: false, replies: [] }
        : item,
    )
    return
  }

  if (current.repliesLoading) {
    return
  }

  comments.value = comments.value.map((item) =>
    item.id === commentId ? { ...item, repliesLoading: true } : item,
  )

  try {
    const response = await getDishCommentList(dishId, commentId)
    comments.value = comments.value.map((item) =>
      item.id === commentId
        ? {
            ...item,
            replies: response.data.map(mapReplyItem),
            repliesLoaded: true,
            repliesLoading: false,
          }
        : item,
    )
  } catch (error) {
    comments.value = comments.value.map((item) =>
      item.id === commentId ? { ...item, repliesLoading: false } : item,
    )
    showToast.fail(error instanceof Error ? error.message : '回复加载失败')
  }
}

async function loadDishData() {
  const dishId = getDishId()

  if (!dishId) {
    errorMessage.value = '菜谱信息不存在'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const [detailResponse, materialResponse, flavorResponse, stepResponse] = await Promise.all([
      getDishDetail(dishId),
      getDishMaterialList(dishId),
      getDishFlavorList(dishId),
      getDishStepList(dishId),
    ])

    const stepList = mapStepList(stepResponse.data)

    detail.value = {
      id: detailResponse.data.id,
      title: detailResponse.data.name,
      takeTimes: detailResponse.data.takeTimes,
      viewCount: detailResponse.data.viewCount,
      collectCount: detailResponse.data.collectCount,
      isFavorite: detailResponse.data.userCollected,
      shareCount: detailResponse.data.shareCount,
      cover: stepList[0]?.images[0] ?? '',
      checkStatus: detailResponse.data.checkStatus,
    }

    materials.value = materialResponse.data
    flavors.value = flavorResponse.data
    steps.value = stepList

    await loadCommentList(dishId)
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

async function toggleFavorite() {
  if (!detail.value || favoriteLoading.value) {
    return
  }

  favoriteLoading.value = true

  try {
    if (detail.value.isFavorite) {
      await deleteDishCollect(detail.value.id)
      detail.value.isFavorite = false
      detail.value.collectCount = Math.max(0, detail.value.collectCount - 1)
      showToast.success('已取消收藏')
    } else {
      await addDishCollect(detail.value.id)
      detail.value.isFavorite = true
      detail.value.collectCount += 1
      showToast.success('收藏成功')
    }
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '收藏操作失败')
  } finally {
    favoriteLoading.value = false
  }
}

function renderReplyPrefix(reply: DetailCommentReplyView) {
  return reply.nickname
}

function normalizeScore(value: number) {
  return Math.min(5, Math.max(0, Math.round(Number(value) || 0)))
}

function createEmptyUserScore(): DishAppraiseRecordItem {
  return {
    manipulationScore: 0,
    equalScore: 0,
    satisfactionScore: 0,
  }
}

function getScorePercent(score: number) {
  return `${Math.min(100, Math.max(0, (Number(score) / 5) * 100))}%`
}

function formatScore(score: number) {
  return (Number(score) || 0).toFixed(1)
}

function isStarFilled(score: number, index: number) {
  return score >= index
}

function canDeleteComment(userId: number) {
  return currentUserId > 0 && currentUserId === userId
}

async function handleStarComment(commentId: number) {
  try {
    await starDishComment(commentId)
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
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '点赞失败')
  }
}

async function handleDeleteComment(commentId: number) {
  const confirmed = window.confirm('确认删除这条评论吗？')

  if (!confirmed) {
    return
  }

  try {
    await deleteDishComment(commentId)
    showToast.success('删除成功')
    await loadCommentList(getDishId())
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '删除失败')
  }
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

async function loadScoreData(force = false) {
  const dishId = getDishId()

  if (!dishId || scoreLoading.value || (scoreLoaded.value && !force)) {
    return
  }

  scoreLoading.value = true

  try {
    const [totalResponse, recordResponse] = await Promise.all([
      getDishAppraiseTotal(dishId),
      getDishUserAppraiseRecord(dishId),
    ])


    scoreStats.value = {
      dishId: totalResponse.data.dishId,
      manipulationAvg: Number(totalResponse.data.manipulationAvg) || 0,
      equalAvg: Number(totalResponse.data.equalAvg) || 0,
      satisfactionAvg: Number(totalResponse.data.satisfactionAvg) || 0,
      totalScore: Number(totalResponse.data.totalScore) || 0,
    }
    userScore.value = recordResponse.data
      ? {
          manipulationScore: normalizeScore(recordResponse.data.manipulationScore),
          equalScore: normalizeScore(recordResponse.data.equalScore),
          satisfactionScore: normalizeScore(recordResponse.data.satisfactionScore),
        }
      : createEmptyUserScore()
    scoreLoaded.value = true
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '评分信息加载失败')
  } finally {
    scoreLoading.value = false
  }
}

function openScorePopup() {
  showScorePopup.value = true
  void loadScoreData(true)
}

function closeScorePopup() {
  showScorePopup.value = false
}

function setUserScore(key: keyof DishAppraiseRecordItem, score: number) {
  userScore.value = {
    ...userScore.value,
    [key]: score,
  }
}

async function submitScore() {
  const dishId = getDishId()
  const { manipulationScore, equalScore, satisfactionScore } = userScore.value

  if (!dishId) {
    return
  }

  if (!manipulationScore || !equalScore || !satisfactionScore) {
    showToast.text('请完成三个维度的评分后再提交')
    return
  }

  scoreSubmitting.value = true

  try {
    await submitDishAppraise({
      dishId,
      manipulationScore,
      equalScore,
      satisfactionScore,
    })
    showToast.success('评分成功')
    await loadScoreData(true)
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '评分失败')
  } finally {
    scoreSubmitting.value = false
  }
}

async function submitComment() {
  const content = commentDraft.value.trim()
  const dishId = getDishId()

  if (!content) {
    showToast.text('请输入评论内容')
    return
  }

  if (!dishId) {
    return
  }

  submittingComment.value = true

  try {
    await addDishComment({
      dishId,
      parentId: replyParentId.value,
      content,
    })
    showToast.success('评论成功')
    closeCommentPopup()
    await loadCommentList(dishId)
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '评论失败')
  } finally {
    submittingComment.value = false
  }
}

function clampButtonTop(nextTop: number) {
  const viewportHeight = window.innerHeight
  const minTop = 120
  const maxTop = viewportHeight - 220

  return Math.min(Math.max(nextTop, minTop), maxTop)
}

function handlePointerMove(event: PointerEvent) {
  if (!isDragging.value) {
    return
  }

  const deltaY = event.clientY - pointerStartY

  if (Math.abs(deltaY) > 4) {
    movedDuringDrag.value = true
  }

  aiButtonTop.value = clampButtonTop(buttonStartTop + deltaY)
}

function stopDrag() {
  isDragging.value = false
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerup', stopDrag)
}

function handlePointerDown(event: PointerEvent) {
  pointerStartY = event.clientY
  buttonStartTop = aiButtonTop.value
  movedDuringDrag.value = false
  isDragging.value = true

  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('pointerup', stopDrag)
}

function handleFloatClick() {
  if (movedDuringDrag.value) {
    movedDuringDrag.value = false
    return
  }

  showAIPanel.value = true
  void loadAILabels()
}

async function loadAILabels() {
  if (aiLoaded.value || aiLoading.value) {
    return
  }

  aiLoading.value = true
  aiErrorMessage.value = ''

  try {
    const [systemResponse, userResponse] = await Promise.all([
      getSystemLabels({
        pageNum: 1,
        pageSize: -1,
      }),
      getUserLabels(),
    ])

    aiLabels.value = systemResponse.data.records
    selectedLabelIds.value = userResponse.data
    aiLoaded.value = true
  } catch (error) {
    aiErrorMessage.value = error instanceof Error ? error.message : '标签加载失败'
  } finally {
    aiLoading.value = false
  }
}

function toggleLabel(labelId: number) {
  if (selectedLabelIds.value.includes(labelId)) {
    selectedLabelIds.value = selectedLabelIds.value.filter((id) => id !== labelId)
    return
  }

  selectedLabelIds.value = [...selectedLabelIds.value, labelId]
}

function handleGeneratePlan() {
  const selectedNames = aiLabels.value
    .filter((label) => selectedLabelIds.value.includes(label.id))
    .map((label) => label.labelName)

  showAIPanel.value = false

  router.push({
    name: 'DishIndividual',
    query: {
      labelNames: selectedNames.join('|'),
    },
  })
}

onMounted(() => {
  aiButtonTop.value = clampButtonTop(window.innerHeight * 0.52)
  void loadDishData()
})

onBeforeUnmount(() => {
  stopDrag()
})
</script>

<template>
  <section class="detail-page">
    <div v-if="loading" class="page-state">菜谱详情加载中...</div>
    <div v-else-if="errorMessage" class="page-state">{{ errorMessage }}</div>
    <template v-else-if="detail">
      <header class="detail-hero" :class="{ 'detail-hero-compact': !detail.cover }">
        <img v-if="detail.cover" :src="detail.cover" :alt="detail.title" class="hero-image" />
        <button class="back-button" type="button" @click="goBack">
          <Left color="#ffffff" size="18" />
        </button>
        <div v-if="detail.cover" class="gallery-count">
          <Message size="14" color="#ffffff" />
          <span>{{ heroCount }}</span>
        </div>
      </header>

      <section class="detail-section detail-intro">
        <div class="intro-main">
          <h1 class="dish-title">{{ detail.title }}</h1>
          <p class="dish-stats">
            预计用时 {{ detail.takeTimes }} · 分享 {{ detail.shareCount }} · 收藏 {{ detail.collectCount }}
          </p>
        </div>
        <button
          class="favorite-button"
          type="button"
          :disabled="favoriteLoading"
          @click="toggleFavorite"
        >
          <component
            :is="detail.isFavorite ? HeartFill : HeartN"
            :color="'rgb(255,111,97)'"
            size="18"
          />
          <span>{{ detail.isFavorite ? '已收藏' : '收藏' }}</span>
        </button>
      </section>

      <section class="detail-section ai-notice-section">
        <div class="ai-notice">
          <div class="ai-notice-track">
            <span>{{ aiNoticeText }}</span>
            <span>{{ aiNoticeText }}</span>
          </div>
        </div>
      </section>

      <section class="detail-section">
        <h2 class="section-title">主料清单</h2>
        <div class="list-block">
          <div v-for="item in materials" :key="item.id" class="list-row list-row-start">
            <div>
              <span>{{ item.materialName }}</span>
              <p v-if="item.deal" class="list-deal">{{ item.deal }}</p>
            </div>
            <strong>{{ item.dosage }}</strong>
          </div>
        </div>
      </section>

      <section class="detail-section">
        <h2 class="section-title">调料清单</h2>
        <div class="list-block">
          <div v-for="item in flavors" :key="item.id" class="list-row">
            <span>{{ item.flavorName }}</span>
            <strong>{{ item.dosage }}</strong>
          </div>
        </div>
      </section>

      <section class="detail-section">
        <div class="section-head">
          <h2 class="section-title">烹饪步骤</h2>
        </div>

        <article v-for="(step, index) in visibleSteps" :key="step.id" class="step-card">
          <p class="step-text">
            <strong>步骤{{ index + 1 }}/{{ steps.length }}</strong>
            <div>{{ step.description }}</div>
          </p>
          <div v-if="step.images.length" class="step-gallery">
            <img v-for="image in step.images" :key="image" :src="image" />
          </div>
        </article>

        <button
          v-if="steps.length > 3"
          class="expand-button"
          type="button"
          @click="showAllSteps = !showAllSteps"
        >
          <span>{{ showAllSteps ? '收起步骤' : '查看全部' }}</span>
          <TriangleDown
            size="10"
            color="#6b7280"
            :style="{ transform: showAllSteps ? 'rotate(180deg)' : 'rotate(0deg)' }"
          />
        </button>
      </section>

      <section class="detail-section comments-section">
        <h2 class="section-title">菜谱评论({{ commentCount }})</h2>
        <div v-if="commentLoading" class="comment-state">评论加载中...</div>
        <div v-else-if="!comments.length" class="comment-state">还没有评论，来抢个沙发吧</div>

        <article v-for="comment in comments" :key="comment.id" class="comment-card">
          <div class="comment-avatar">{{ getAvatarText(comment.nickname) }}</div>
          <div class="comment-body">
            <div class="comment-top">
              <div>
                <p class="comment-name">{{ comment.nickname }}</p>
                <p class="comment-content">{{ comment.content }}</p>
                <p class="comment-meta">
                  {{ comment.time }}
                  <span class="comment-link" @click="openCommentPopup(comment.id, comment.nickname)">
                    回复
                  </span>
                  <span
                    v-if="canDeleteComment(comment.userId)"
                    class="comment-link"
                    @click="handleDeleteComment(comment.id)"
                  >
                    删除
                  </span>
                </p>
              </div>
<!--              <button class="comment-like" type="button" @click="handleStarComment(comment.id)">
                <HeartN size="14" color="#9ca3af" />
                <span>{{ comment.likes }}</span>
              </button>-->
            </div>

            <button
              v-if="comment.childCount > 0"
              class="reply-toggle"
              type="button"
              @click="toggleReplies(comment.id)"
            >
              {{
                comment.repliesLoading
                  ? '回复加载中...'
                  : comment.repliesLoaded
                    ? '收起回复'
                    : `共 ${comment.childCount} 条回复`
              }}
            </button>

            <div v-if="comment.repliesLoaded && comment.replies.length" class="reply-list">
              <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                <div class="reply-avatar">{{ getAvatarText(reply.nickname) }}</div>
                <div class="reply-content">
                  <p class="comment-name">{{ renderReplyPrefix(reply) }}</p>
                  <p class="comment-content">{{ reply.content }}</p>
                  <p class="comment-meta">
                    {{ reply.time }}
<!--                    <span class="comment-link" @click="openCommentPopup(comment.id, reply.nickname)">
                      回复
                    </span>-->
                    <span
                      v-if="canDeleteComment(reply.userId)"
                      class="comment-link"
                      @click="handleDeleteComment(reply.id)"
                    >
                      删除
                    </span>
                  </p>
                </div>
<!--                <button class="comment-like" type="button" @click="handleStarComment(reply.id)">
                  <HeartN size="14" color="#9ca3af" />
                  <span>{{ reply.likes }}</span>
                </button>-->
              </div>
            </div>
          </div>
        </article>
      </section>

      <button
        class="ai-float-button"
        type="button"
        :style="{ top: `${aiButtonTop}px` }"
        @pointerdown="handlePointerDown"
        @click="handleFloatClick"
      >
        <span class="ai-float-glow" />
        <span class="ai-float-icon">
          <icon-mdi-robot-excited-outline />
        </span>
        <span class="ai-float-text">AI小助手</span>
      </button>
    </template>

    <footer v-if="detail" class="detail-actionbar">
      <button class="comment-input" type="button" @click="openCommentPopup()">
        说点什么...
      </button>
      <button type="button" class="action-item" @click="openScorePopup">
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

    <div v-if="showScorePopup" class="score-popup-mask" @click="closeScorePopup" />
    <section v-if="showScorePopup" class="score-popup">
      <div class="score-popup-handle" />
      <h3 class="score-popup-title">菜谱评分</h3>
      <div v-if="scoreLoading" class="score-popup-state">评分信息加载中...</div>
      <template v-else>
        <section class="score-summary-card">
          <div
            class="score-ring"
            :style="{ '--score-progress': totalScorePercent }"
          >
            <div class="score-ring-inner">{{ formatScore(scoreStats.totalScore) }}</div>
          </div>

          <div class="score-progress-list">
            <div
              v-for="item in scoreDimensionList"
              :key="item.key"
              class="score-progress-item"
            >
              <div class="score-progress-track">
                <div class="score-progress-value">{{ formatScore(item.average) }}</div>
                <div
                  class="score-progress-bar"
                  :style="{ width: getScorePercent(item.average) }"
                />
              </div>
            </div>
          </div>
        </section>

        <section class="score-editor">
          <div
            v-for="item in scoreDimensionList"
            :key="`${item.key}-editor`"
            class="score-row"
          >
            <span class="score-label">{{ item.label }}</span>
            <div class="score-stars">
              <button
                v-for="starIndex in 5"
                :key="`${item.key}-${starIndex}`"
                type="button"
                class="score-star-button"
                @click="setUserScore(item.key, starIndex)"
              >
                <icon-mdi-star
                  v-if="isStarFilled(userScore[item.key], starIndex)"
                  class="score-star-icon score-star-filled"
                />
                <icon-mdi-star-outline
                  v-else
                  class="score-star-icon score-star-empty"
                />
              </button>
            </div>
          </div>
        </section>

        <button
          type="button"
          class="score-submit-button"
          :disabled="scoreSubmitting"
          @click="submitScore"
        >
          {{ scoreSubmitting ? '提交中...' : '立即评分' }}
        </button>
      </template>
    </section>

    <div v-if="showAIPanel" class="ai-popup-mask" @click="showAIPanel = false" />
    <section v-if="showAIPanel" class="ai-popup">
      <div class="ai-popup-handle" />
      <h3 class="ai-popup-title">AI个性化菜谱</h3>
      <div class="ai-popup-body">
        <p class="ai-popup-desc">选择你的饮食偏好，生成更贴合您喜好的菜谱方案。</p>

        <div v-if="aiLoading" class="ai-state">标签加载中...</div>
        <div v-else-if="aiErrorMessage" class="ai-state">{{ aiErrorMessage }}</div>
        <div v-else class="ai-label-scroll">
          <button
            v-for="label in aiLabels"
            :key="label.id"
            type="button"
            class="ai-label-chip"
            :class="{ 'ai-label-chip-active': selectedLabelIds.includes(label.id) }"
            @click="toggleLabel(label.id)"
          >
            {{ label.labelName }}
          </button>
        </div>
      </div>
      <button type="button" class="ai-generate-button" @click="handleGeneratePlan">生成</button>
    </section>
  </section>
</template>

<style scoped>
.detail-page {
  height: 100vh;
  padding-bottom: 92px;
  overflow-y: auto;
  background: #f4f4f4;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.detail-page::-webkit-scrollbar {
  display: none;
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

.detail-hero-compact {
  height: calc(env(safe-area-inset-top) + 0px);
  background: linear-gradient(180deg, #fff7f5 0%, #fff 100%);
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

.detail-hero-compact .back-button {
  background: rgba(255, 111, 97, 0.12);
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

.ai-notice-section {
  padding: 10px 14px;
}

.ai-notice {
  overflow: hidden;
  padding: 10px 0;
  color: #c2410c;
  font-size: 13px;
  line-height: 1;
  background: linear-gradient(135deg, #fff7ed 0%, #fff1f2 100%);
  border: 1px solid rgba(255, 111, 97, 0.22);
  border-radius: 14px;
}

.ai-notice-track {
  display: flex;
  width: max-content;
  white-space: nowrap;
  animation: ai-notice-scroll 16s linear infinite;
}

.ai-notice-track span {
  display: inline-block;
  padding-right: 48px;
}

@keyframes ai-notice-scroll {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
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

.favorite-button:disabled {
  opacity: 0.6;
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

.list-block {
  border-top: 1px solid #f1f1f1;
}

.list-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 15px 0;
  color: #444;
  font-size: 15px;
  border-bottom: 1px solid #f1f1f1;
}

.list-row-start {
  align-items: flex-start;
}

.list-row strong {
  color: #2b2b2b;
  font-weight: 700;
}

.list-deal {
  margin: 6px 0 0;
  color: #9ca3af;
  font-size: 12px;
  line-height: 1.5;
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

.comment-state {
  padding: 24px 0 10px;
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
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

.comment-link {
  margin-left: 10px;
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

.reply-list {
  margin-top: 14px;
  padding-left: 6px;
}

.reply-toggle {
  margin-top: 10px;
  padding: 0;
  color: rgb(255, 111, 97);
  font-size: 13px;
  background: transparent;
  border: none;
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
  text-align: left;
  background: #f3f4f6;
  border: none;
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

.comment-popup-mask,
.score-popup-mask,
.ai-popup-mask {
  position: fixed;
  inset: 0;
  z-index: 39;
  background: rgba(17, 24, 39, 0.32);
}

.comment-popup,
.score-popup,
.ai-popup {
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

.comment-popup-handle,
.score-popup-handle,
.ai-popup-handle {
  width: 42px;
  height: 5px;
  margin: 0 auto;
  background: #e5e7eb;
  border-radius: 999px;
}

.comment-popup-title,
.score-popup-title,
.ai-popup-title {
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
  background: linear-gradient(135deg, rgb(255, 111, 97), rgb(255, 140, 110));
}

.comment-popup-submit:disabled {
  opacity: 0.6;
}

.score-popup {
  padding: 12px 16px calc(20px + env(safe-area-inset-bottom));
}

.score-popup-title {
  margin-bottom: 18px;
}

.score-popup-state {
  padding: 28px 0 18px;
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
}

.score-summary-card {
  display: flex;
  align-items: center;
  gap: 18px;
}

.score-ring {
  --score-progress: 0%;
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 118px;
  height: 118px;
  border-radius: 50%;
  background: conic-gradient(#ffc61a var(--score-progress), #ececf6 0);
}

.score-ring::after {
  content: '';
  position: absolute;
  inset: 15px;
  background: #ffffff;
  border-radius: 50%;
}

.score-ring-inner {
  position: relative;
  z-index: 1;
  color: #111827;
  font-size: 20px;
  font-weight: 800;
}

.score-progress-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.score-progress-item {
  display: flex;
  align-items: center;
}

.score-progress-track {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  height: 22px;
  overflow: hidden;
  background: #ececf6;
  border-radius: 999px;
}

.score-progress-value {
  position: absolute;
  left: 14px;
  z-index: 1;
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
}

.score-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #ffca14 0%, #ffc107 100%);
  border-radius: inherit;
}

.score-editor {
  margin-top: 26px;
}

.score-row {
  display: flex;
  align-items: center;
  gap: 18px;
}

.score-row + .score-row {
  margin-top: 26px;
}

.score-label {
  width: 96px;
  color: #1f2937;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
}

.score-stars {
  display: flex;
  align-items: center;
  gap: 6px;
}

.score-star-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: transparent;
  border: none;
}

.score-star-icon {
  font-size: 34px;
}

.score-star-filled {
  color: #ffc633;
}

.score-star-empty {
  color: #d9dbe3;
}

.score-submit-button {
  width: 100%;
  height: 52px;
  margin-top: 54px;
  color: #ffffff;
  font-size: 18px;
  font-weight: 800;
  background: linear-gradient(135deg, #ff6f61 0%, #ff6b63 100%);
  border: 1px solid #2e7cf6;
  border-radius: 999px;
}

.score-submit-button:disabled {
  opacity: 0.65;
}

.ai-popup {
  display: flex;
  flex-direction: column;
  height: 52vh;
  min-height: 320px;
}

.ai-popup-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding-top: 14px;
}

.ai-popup-desc {
  margin: 0 0 12px;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}

.ai-label-scroll {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 12px 10px;
  align-content: flex-start;
  overflow-y: auto;
  padding-bottom: 12px;
  scrollbar-width: none;
}

.ai-label-scroll::-webkit-scrollbar {
  display: none;
}

.ai-label-chip {
  padding: 10px 16px;
  color: #4b5563;
  font-size: 14px;
  font-weight: 600;
  background: #f3f4f6;
  border: 1px solid transparent;
  border-radius: 999px;
}

.ai-label-chip-active {
  color: rgb(255, 111, 97);
  background: rgba(255, 111, 97, 0.1);
  border-color: rgba(255, 111, 97, 0.25);
}

.ai-state {
  flex: 1;
  color: #9ca3af;
  font-size: 14px;
  line-height: 1.6;
}

.ai-generate-button {
  width: 100%;
  height: 46px;
  margin-top: 12px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, rgb(255, 111, 97), rgb(255, 140, 110));
  border: none;
  border-radius: 14px;
}

.ai-float-button {
  position: fixed;
  right: 10px;
  z-index: 34;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  width: 66px;
  height: 74px;
  padding: 0;
  color: #ffffff;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.03)),
    linear-gradient(160deg, #ff7e71 0%, #ff7e71 52%, #ff7e71 100%);
  border: 1px solid rgba(255, 255, 255, 0.26);
  border-radius: 22px;
  box-shadow:
    0 10px 30px rgba(45, 124, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  touch-action: none;
}

.ai-float-glow {
  position: absolute;
  top: -12px;
  right: -10px;
  width: 48px;
  height: 48px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0, rgba(255, 255, 255, 0) 72%);
  opacity: 0.9;
}

.ai-float-icon {
  position: relative;
  z-index: 1;
  display: block;
  line-height: 1;
  font-size: 24px;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.35));
}

.ai-float-text {
  position: relative;
  z-index: 1;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.9px;
  text-transform: uppercase;
  opacity: 0.96;
}
</style>
