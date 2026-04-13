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
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AiRecipeLauncher from '../../components/AiRecipeLauncher.vue'
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
import { addUserDietPlan, getUserDietPlan, type UserDietMeal } from '../../api/user'

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

type DietMealOption = {
  order: 1 | 2 | 3
  label: '早餐' | '午餐' | '晚餐'
}

type CalendarCell = {
  key: string
  date: Date | null
  dayText: string
  subText: string
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
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
const showCommentPopup = ref(false)
const showScorePopup = ref(false)
const showDietPopup = ref(false)
const commentDraft = ref('')
const replyParentId = ref(0)
const replyTargetName = ref('')
const scoreLoading = ref(false)
const scoreSubmitting = ref(false)
const scoreLoaded = ref(false)
const dietPlanLoading = ref(false)
const dietSubmitting = ref(false)
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
const currentCalendarDate = ref(startOfDay(new Date()))
const selectedDietDate = ref(startOfDay(new Date()))
const selectedDietOrder = ref<0 | 1 | 2 | 3>(0)
const dietMeals = ref<UserDietMeal[]>([])
const dietPlanCache = ref<Record<string, UserDietMeal[]>>({})

let dietPlanRequestId = 0

const currentUserId = getCurrentUserId()

const visibleSteps = computed(() => {
  return showAllSteps.value ? steps.value : steps.value.slice(0, 3)
})

const commentCount = computed(() =>
  comments.value.reduce((total, item) => total + 1 + item.childCount, 0),
)

const heroCount = computed(() => steps.value.length)
const totalScorePercent = computed(() => getScorePercent(scoreStats.value.totalScore))
const dietMealOptions: DietMealOption[] = [
  { order: 1, label: '早餐' },
  { order: 2, label: '午餐' },
  { order: 3, label: '晚餐' },
]
const dietMonthLabel = computed(
  () =>
    `${String(currentCalendarDate.value.getMonth() + 1).padStart(2, '0')}月  ${currentCalendarDate.value.getFullYear()}年`,
)
const calendarCells = computed<CalendarCell[]>(() => {
  const year = currentCalendarDate.value.getFullYear()
  const month = currentCalendarDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const totalDays = new Date(year, month + 1, 0).getDate()
  const leadingBlankCount = firstDay.getDay()
  const cells: CalendarCell[] = []

  for (let index = 0; index < leadingBlankCount; index += 1) {
    cells.push({
      key: `blank-${year}-${month}-${index}`,
      date: null,
      dayText: '',
      subText: '',
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
    })
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const date = new Date(year, month, day)
    const relativeLabel = getRelativeDateLabel(date)

    cells.push({
      key: formatDateKey(date),
      date,
      dayText: relativeLabel || String(day),
      subText: relativeLabel ? String(day) : '',
      isCurrentMonth: true,
      isToday: isSameDate(date, new Date()),
      isSelected: isSameDate(date, selectedDietDate.value),
    })
  }

  return cells
})
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

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function isSameDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`
}

function getRelativeDateLabel(date: Date) {
  const current = startOfDay(new Date())
  const target = startOfDay(date)
  const dayDiff = Math.round((target.getTime() - current.getTime()) / 86400000)

  if (dayDiff === 0) {
    return '今天'
  }

  if (dayDiff === 1) {
    return '明天'
  }

  if (dayDiff === 2) {
    return '后天'
  }

  return ''
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

async function loadDietPlanByDate(date: Date) {
  const dishId = getDishId()
  const dateKey = formatDateKey(date)

  if (!dishId) {
    return
  }

  if (dietPlanCache.value[dateKey]) {
    applyDietPlanSelection(dietPlanCache.value[dateKey], dishId)
    return
  }

  const requestId = ++dietPlanRequestId
  dietPlanLoading.value = true

  try {
    const response = await getUserDietPlan(dateKey)

    if (requestId !== dietPlanRequestId) {
      return
    }

    dietPlanCache.value = {
      ...dietPlanCache.value,
      [dateKey]: response.data,
    }
    applyDietPlanSelection(response.data, dishId)
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '饮食计划加载失败')
  } finally {
    if (requestId === dietPlanRequestId) {
      dietPlanLoading.value = false
    }
  }
}

function applyDietPlanSelection(meals: UserDietMeal[], dishId: number) {
  dietMeals.value = meals

  const matchedMeal = meals.find((meal) =>
    meal.dishes.some((dish) => Number(dish.dishId) === dishId || Number(dish.id) === dishId),
  )

  selectedDietOrder.value = matchedMeal
    ? matchedMeal.key === 'breakfast'
      ? 1
      : matchedMeal.key === 'lunch'
        ? 2
        : 3
    : 0
}

function openDietPopup() {
  const today = startOfDay(new Date())
  currentCalendarDate.value = startOfDay(today)
  selectedDietDate.value = startOfDay(today)
  selectedDietOrder.value = 0
  dietPlanLoading.value = false
  showDietPopup.value = true
  void loadDietPlanByDate(today)
}

function closeDietPopup() {
  showDietPopup.value = false
}

function switchDietMonth(step: -1 | 1) {
  currentCalendarDate.value = new Date(
    currentCalendarDate.value.getFullYear(),
    currentCalendarDate.value.getMonth() + step,
    1,
  )
}

function selectDietDate(date: Date | null) {
  if (!date) {
    return
  }

  if (isSameDate(date, selectedDietDate.value)) {
    return
  }

  selectedDietDate.value = startOfDay(date)
  currentCalendarDate.value = new Date(date.getFullYear(), date.getMonth(), 1)
  void loadDietPlanByDate(date)
}

async function submitDietRecord() {
  const dishId = getDishId()

  if (!dishId) {
    return
  }

  if (!selectedDietOrder.value) {
    showToast.text('请选择餐次')
    return
  }

  dietSubmitting.value = true

  try {
    await addUserDietPlan({
      dishId,
      dietDate: formatDateKey(selectedDietDate.value),
      dietOrder: selectedDietOrder.value,
    })
    dietPlanCache.value = {}
    showToast.success('已加入饮食记录')
    showDietPopup.value = false
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '加入饮食记录失败')
  } finally {
    dietSubmitting.value = false
  }
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

function handleGeneratePlan(payload: { labelIds: number[]; labelNames: string[] }) {
  const dishId = getDishId()

  if (!dishId) {
    showToast.text('菜谱信息不存在')
    return
  }

  router.push({
    name: 'DishIndividual',
    query: {
      dishId: String(dishId),
      labelIds: payload.labelIds.join(','),
      labelNames: payload.labelNames.join('|'),
    },
  })
}

function goToSharePage() {
  const dishId = getDishId()

  if (!dishId) {
    showToast.text('菜谱信息不存在')
    return
  }

  router.push({
    name: 'ShareCreate',
    query: {
      dishId: String(dishId),
    },
  })
}

onMounted(() => {
  void loadDishData()
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

      <AiRecipeLauncher @generate="handleGeneratePlan" />
    </template>

    <footer v-if="detail" class="detail-actionbar">
      <button class="comment-input" type="button" @click="openCommentPopup()">
        说点什么...
      </button>
      <button type="button" class="action-item" @click="openScorePopup">
        <StarN size="18" color="#8b8b8b" />
        <span>评分</span>
      </button>
      <button type="button" class="action-item" @click="openDietPopup">
        <Edit size="18" color="#8b8b8b" />
        <span>记录</span>
      </button>
      <button type="button" class="action-item" @click="goToSharePage">
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

    <div v-if="showDietPopup" class="diet-popup-mask" @click="closeDietPopup" />
    <section v-if="showDietPopup" class="diet-popup">
      <div class="diet-popup-handle" />
      <div class="diet-popup-header">
        <button type="button" class="diet-popup-text-button" @click="closeDietPopup">取消</button>
        <div class="diet-popup-month">
          <button type="button" class="diet-month-switch" @click="switchDietMonth(-1)">
            <icon-mdi-chevron-left />
          </button>
          <span>{{ dietMonthLabel }}</span>
          <button type="button" class="diet-month-switch" @click="switchDietMonth(1)">
            <icon-mdi-chevron-right />
          </button>
        </div>
        <button
          type="button"
          class="diet-popup-text-button diet-popup-text-button-primary"
          :disabled="dietSubmitting"
          @click="submitDietRecord"
        >
          {{ dietSubmitting ? '提交中' : '完成' }}
        </button>
      </div>

      <div class="diet-week-row">
        <span>日</span>
        <span>一</span>
        <span>二</span>
        <span>三</span>
        <span>四</span>
        <span>五</span>
        <span>六</span>
      </div>

      <div class="diet-calendar-grid">
        <button
          v-for="cell in calendarCells"
          :key="cell.key"
          type="button"
          class="diet-day-cell"
          :class="{
            'diet-day-cell-empty': !cell.date,
            'diet-day-cell-today': cell.isToday && !cell.isSelected,
            'diet-day-cell-selected': cell.isSelected,
          }"
          :disabled="!cell.date"
          @click="selectDietDate(cell.date)"
        >
          <span class="diet-day-text">{{ cell.dayText }}</span>
          <span v-if="cell.subText" class="diet-day-subtext">{{ cell.subText }}</span>
        </button>
      </div>

      <div class="diet-meal-section" :class="{ 'diet-meal-section-loading': dietPlanLoading }">
        <button
          v-for="meal in dietMealOptions"
          :key="meal.order"
          type="button"
          class="diet-meal-option"
          :class="{ 'diet-meal-option-active': selectedDietOrder === meal.order }"
          @click="selectedDietOrder = meal.order"
        >
          {{ meal.label }}
        </button>
      </div>
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
.diet-popup-mask {
  position: fixed;
  inset: 0;
  z-index: 39;
  background: rgba(17, 24, 39, 0.32);
}

.comment-popup,
.score-popup,
.diet-popup {
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
.diet-popup-handle {
  width: 42px;
  height: 5px;
  margin: 0 auto;
  background: #e5e7eb;
  border-radius: 999px;
}

.comment-popup-title,
.score-popup-title {
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

.diet-popup {
  padding: 12px 18px calc(18px + env(safe-area-inset-bottom));
}

.diet-popup-header {
  display: grid;
  grid-template-columns: 56px 1fr 56px;
  align-items: center;
  margin-top: 10px;
}

.diet-popup-text-button {
  padding: 0;
  color: #111827;
  font-size: 16px;
  font-weight: 600;
  background: transparent;
  border: none;
}

.diet-popup-text-button-primary:disabled {
  opacity: 0.6;
}

.diet-popup-month {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #4b5563;
  font-size: 18px;
  font-weight: 500;
}

.diet-month-switch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  color: #a3a3a3;
  font-size: 22px;
  background: transparent;
  border: none;
}

.diet-week-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-top: 26px;
  color: #111827;
  font-size: 15px;
  font-weight: 700;
  text-align: center;
}

.diet-week-row span:first-child,
.diet-week-row span:last-child {
  color: #ff6f61;
}

.diet-calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px 2px;
  margin-top: 18px;
}

.diet-day-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  padding: 0;
  color: #8f96a3;
  background: transparent;
  border: none;
  border-radius: 14px;
}

.diet-day-cell-empty {
  pointer-events: none;
}

.diet-day-cell-today .diet-day-text {
  color: #ff6f61;
}

.diet-day-cell-selected {
  color: #ffffff;
  background: #ff7868;
}

.diet-day-cell-selected .diet-day-text,
.diet-day-cell-selected .diet-day-subtext {
  color: #ffffff;
}

.diet-day-text {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
}

.diet-day-subtext {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}

.diet-meal-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-top: 28px;
  min-height: 68px;
}

.diet-meal-option {
  height: 68px;
  color: #111827;
  font-size: 18px;
  font-weight: 700;
  background: #f1f1f4;
  border: none;
  border-radius: 14px;
}

.diet-meal-option-active {
  color: #ffffff;
  background: #ff6f61;
}

.diet-meal-section-loading .diet-meal-option {
  transition: opacity 0.18s ease;
  opacity: 0.72;
}

</style>
