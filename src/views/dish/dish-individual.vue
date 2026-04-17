<script setup lang="ts">
import { Category, Horizontal, Left, Loading1, More } from '@nutui/icons-vue'
import { showToast } from '@nutui/nutui'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AiRecipeLauncher from '../../components/AiRecipeLauncher.vue'
import {
  getIndividualDishDetail,
  parseIndividualDishContent,
  streamIndividualDish,
  type IndividualDishBaseInfo,
  type IndividualDishFlavor,
  type IndividualDishMaterial,
  type IndividualDishStep,
  type IndividualDishStreamEvent,
} from '../../api/dish'

defineOptions({
  name: 'DishIndividual',
})

const route = useRoute()
const router = useRouter()
const individualDishId = computed(() => Number(route.query.individualDishId || 0))

const selectedLabels = computed(() => {
  const raw = route.query.labelNames

  if (typeof raw !== 'string' || !raw) {
    return []
  }

  return raw.split('|').filter(Boolean)
})

type RenderSection = {
  title: string
  items: string[]
}

const dishId = computed(() => Number(route.query.dishId || 0))
const labelIds = computed(() => {
  const raw = route.query.labelIds

  if (typeof raw !== 'string' || !raw.trim()) {
    return []
  }

  return raw
    .split(',')
    .map((value) => Number(value))
    .filter((value) => !Number.isNaN(value) && value > 0)
})

const baseInfo = ref<IndividualDishBaseInfo | null>(null)
const materials = ref<IndividualDishMaterial[]>([])
const flavors = ref<IndividualDishFlavor[]>([])
const steps = ref<IndividualDishStep[]>([])
const tips = ref('')
const loading = ref(true)
const streaming = ref(false)
const streamStarted = ref(false)
const streamFinished = ref(false)
const errorMessage = ref('')
const hasReceivedContent = computed(
  () =>
    Boolean(baseInfo.value) ||
    materials.value.length > 0 ||
    flavors.value.length > 0 ||
    steps.value.length > 0 ||
    Boolean(tips.value),
)
const statusText = computed(() => {
  if (errorMessage.value) {
    return errorMessage.value
  }

  if (streamFinished.value) {
    return '已基于你的饮食偏好和身体状态，生成个性化菜谱，你可以参考本次生成结果与您的实际情况进行烹饪。'
  }

  return '正在基于你的饮食偏好和身体状态，为你生成个性化的菜谱方案...'
})
const sections = computed<RenderSection[]>(() => {
  const nextSections: RenderSection[] = []

  if (materials.value.length) {
    nextSections.push({
      title: '一、主料清单',
      items: materials.value.map(
        (item) => `${item.name}：${item.dosage}${item.deal ? `。${item.deal}` : ''}`,
      ),
    })
  }

  if (flavors.value.length) {
    nextSections.push({
      title: '二、调料清单',
      items: flavors.value.map((item) => `${item.name}：${item.dosage}`),
    })
  }

  if (steps.value.length) {
    nextSections.push({
      title: '三、制作步骤',
      items: [...steps.value]
        .sort((left, right) => left.stepNumber - right.stepNumber)
        .map((item) => item.instruction),
    })
  }

  if (tips.value) {
    nextSections.push({
      title: '四、小贴士',
      items: [tips.value],
    })
  }

  return nextSections
})

let streamController: AbortController | null = null

function applyStreamEvent(event: IndividualDishStreamEvent) {
  streamStarted.value = true

  switch (event.type) {
    case 'start':
      errorMessage.value = ''
      return
    case 'base':
      baseInfo.value = event.data
      return
    case 'material':
      materials.value = [...materials.value, event.data]
      return
    case 'flavor':
      flavors.value = [...flavors.value, event.data]
      return
    case 'step':
      steps.value = [...steps.value, event.data].sort(
        (left, right) => left.stepNumber - right.stepNumber,
      )
      return
    case 'tips':
      tips.value = event.data
      return
    case 'done':
      streamFinished.value = true
      streaming.value = false
      loading.value = false
      return
    case 'error':
      errorMessage.value = event.message || '个性化菜谱生成失败'
      streaming.value = false
      loading.value = false
      return
  }
}

async function loadIndividualDish() {
  if (!dishId.value) {
    loading.value = false
    errorMessage.value = '缺少菜谱信息，暂时无法生成个性化菜谱'
    return
  }

  streamController?.abort()
  baseInfo.value = null
  materials.value = []
  flavors.value = []
  steps.value = []
  tips.value = ''
  errorMessage.value = ''
  loading.value = true
  streaming.value = true
  streamStarted.value = false
  streamFinished.value = false

  if (individualDishId.value > 0) {
    streaming.value = false

    try {
      const response = await getIndividualDishDetail(individualDishId.value)
      const events = parseIndividualDishContent(response.data.content)

      for (const event of events) {
        applyStreamEvent(event)
      }

      if (!streamFinished.value) {
        streamFinished.value = true
      }

      loading.value = false
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '个性化菜谱详情加载失败'
      loading.value = false
      showToast.fail(errorMessage.value)
    }

    return
  }

  streamController = new AbortController()

  try {
    await streamIndividualDish(
      {
        dishId: dishId.value,
        labelIds: labelIds.value,
      },
      {
        signal: streamController.signal,
        onEvent: applyStreamEvent,
      },
    )

    if (!streamFinished.value) {
      streamFinished.value = true
      streaming.value = false
      loading.value = false
    }
  } catch (error) {
    if (streamController.signal.aborted) {
      return
    }

    errorMessage.value = error instanceof Error ? error.message : '个性化菜谱生成失败'
    streaming.value = false
    loading.value = false
    showToast.fail(errorMessage.value)
  }
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/dish/detail/1')
}

function buildSkeletonRows(count: number) {
  return Array.from({ length: count }, (_, index) => index)
}

onMounted(() => {
  void loadIndividualDish()
})

watch(
  () => [route.query.individualDishId, route.query.dishId, route.query.labelIds].join('|'),
  () => {
    void loadIndividualDish()
  },
)

onBeforeUnmount(() => {
  streamController?.abort()
})

async function handleRegenerate(payload: { labelIds: number[]; labelNames: string[] }) {
  const nextQuery: Record<string, string> = {
    dishId: dishId.value ? String(dishId.value) : '',
    labelIds: payload.labelIds.join(','),
    labelNames: payload.labelNames.join('|'),
  }

  delete nextQuery.individualDishId

  await router.replace({
    name: 'DishIndividual',
    query: nextQuery,
  })
}
</script>

<template>
  <section class="individual-page">
    <header class="page-header">
      <button class="icon-button left-button" type="button" @click="goBack">
        <Left size="16" color="#7b7b7b" />
      </button>

      <div class="title-wrap">
        <div class="title-badge">
          <Category size="16" color="#ffffff" />
        </div>
        <div>
          <h1>个性化菜谱方案</h1>
          <p v-if="selectedLabels.length">{{ selectedLabels.join(' · ') }}</p>
        </div>
      </div>

      <div class="header-actions">
        <button class="icon-button" type="button">
          <More size="16" color="#444444" />
        </button>
        <button class="icon-button" type="button">
          <Horizontal size="16" color="#444444" />
        </button>
      </div>
    </header>

    <main class="page-content">
      <section class="status-card" :class="{ 'status-card-error': errorMessage }">
        <div class="status-icon">
          <Loading1 v-if="!errorMessage && !streamFinished" size="16" color="#ff7d55" />
          <Category v-else size="16" :color="errorMessage ? '#ff5a5a' : '#ff9f43'" />
        </div>
        <div class="status-copy">
          <p>{{ statusText }}</p>
<!--          <span v-if="baseInfo?.take_times && !errorMessage" class="status-meta">
            预计用时：{{ baseInfo.take_times }}
          </span>-->
        </div>
      </section>

      <section class="content-card">
        <template v-if="loading && !hasReceivedContent">
          <article class="plan-section plan-section-skeleton">
            <div class="skeleton-title" />
            <div v-for="row in buildSkeletonRows(3)" :key="`material-${row}`" class="skeleton-line" />
          </article>
          <article class="plan-section plan-section-skeleton">
            <div class="skeleton-title skeleton-title-short" />
            <div v-for="row in buildSkeletonRows(2)" :key="`flavor-${row}`" class="skeleton-line skeleton-line-short" />
          </article>
          <article class="plan-section plan-section-skeleton">
            <div class="skeleton-title" />
            <div v-for="row in buildSkeletonRows(4)" :key="`step-${row}`" class="skeleton-line" />
          </article>
        </template>

        <template v-else-if="hasReceivedContent">
          <section v-if="baseInfo" class="dish-summary">
            <h2>{{ baseInfo.dishName }}</h2>
            <p v-if="baseInfo.takeTimes">预计用时 {{ baseInfo.takeTimes }}</p>
          </section>

          <article v-for="section in sections" :key="section.title" class="plan-section">
            <h2>{{ section.title }}</h2>
            <ol>
              <li v-for="(item, index) in section.items" :key="`${section.title}-${index}`">
                <span class="item-index">{{ index + 1 }}.</span>
                <span class="item-text">{{ item }}</span>
              </li>
            </ol>
          </article>
        </template>

        <div v-else class="empty-state">
          {{ errorMessage || '暂未生成个性化菜谱内容' }}
        </div>

        <div v-if="streaming && hasReceivedContent" class="streaming-hint">
          正在继续补充内容...
        </div>
      </section>
    </main>

    <AiRecipeLauncher :initial-selected-ids="labelIds" @generate="handleRegenerate" />
  </section>
</template>

<style scoped>
.individual-page {
  min-height: 100vh;
  height: 100vh;
  overflow-y: auto;
  background: #f7f7f7;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: calc(env(safe-area-inset-top) + 14px) 14px 14px;
  background: #ffffff;
}

.left-button {
  margin-left: -6px;
}

.title-wrap {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 10px;
  min-width: 0;
}

.title-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #f7b54a, #ec8d3b);
  border-radius: 999px;
  box-shadow: 0 8px 18px rgba(236, 141, 59, 0.28);
}

.title-wrap h1 {
  margin: 0;
  color: #171717;
  font-size: 20px;
  font-weight: 800;
}

.title-wrap p {
  margin: 3px 0 0;
  color: #9ca3af;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 999px;
}

.page-content {
  padding: 14px;
}

.status-card,
.content-card {
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

.status-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 16px 14px;
}

.status-card-error {
  border: 1px solid rgba(255, 90, 90, 0.12);
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-top: 2px;
}

.status-copy {
  flex: 1;
}

.status-card p {
  margin: 0;
  color: #3b3b3b;
  font-size: 16px;
  line-height: 1.5;
}

.status-meta {
  display: inline-block;
  margin-top: 6px;
  color: #9ca3af;
  font-size: 12px;
}

.content-card {
  margin-top: 12px;
  padding: 18px 14px 24px;
}

.dish-summary {
  padding-bottom: 8px;
}

.dish-summary h2 {
  margin: 0;
  color: #171717;
  font-size: 22px;
  font-weight: 800;
}

.dish-summary p {
  margin: 6px 0 0;
  color: #9ca3af;
  font-size: 13px;
}

.plan-section + .plan-section {
  margin-top: 24px;
}

.plan-section h2 {
  margin: 0 0 14px;
  color: #1f2937;
  font-size: 18px;
  font-weight: 800;
}

.plan-section ol {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.plan-section li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: #303133;
  font-size: 16px;
  line-height: 1.8;
}

.item-index {
  color: #1d72ff;
  font-weight: 700;
}

.item-text {
  flex: 1;
}

.plan-section-skeleton + .plan-section-skeleton {
  margin-top: 24px;
}

.skeleton-title,
.skeleton-line {
  border-radius: 999px;
  background: linear-gradient(90deg, #efefef 25%, #f8f8f8 37%, #efefef 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}

.skeleton-title {
  width: 42%;
  height: 22px;
  margin-bottom: 16px;
}

.skeleton-title-short {
  width: 34%;
}

.skeleton-line {
  height: 16px;
}

.skeleton-line + .skeleton-line {
  margin-top: 14px;
}

.skeleton-line-short {
  width: 78%;
}

.empty-state {
  padding: 12px 0 4px;
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
}

.streaming-hint {
  margin-top: 18px;
  color: #ff8a47;
  font-size: 13px;
  text-align: center;
}

@keyframes shimmer {
  0% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0 50%;
  }
}
</style>
