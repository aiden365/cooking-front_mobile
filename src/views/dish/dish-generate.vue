<script setup lang="ts">
import { Category, Left, Loading1, Message } from '@nutui/icons-vue'
import { showToast } from '@nutui/nutui'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  streamDishGenerate,
  type IndividualDishBaseInfo,
  type IndividualDishFlavor,
  type IndividualDishMaterial,
  type IndividualDishStep,
  type IndividualDishStreamEvent,
} from '../../api/dish'

defineOptions({
  name: 'DishGenerate',
})

type DetailViewModel = {
  title: string
  takeTimes: string
}

type DetailStepView = {
  id: number
  description: string
}

const route = useRoute()
const router = useRouter()

const dishName = computed(() => String(route.query.dishName || '').trim())
const detail = ref<DetailViewModel | null>(null)
const materials = ref<IndividualDishMaterial[]>([])
const flavors = ref<IndividualDishFlavor[]>([])
const steps = ref<DetailStepView[]>([])
const tips = ref('')
const loading = ref(true)
const streamFinished = ref(false)
const errorMessage = ref('')

let streamController: AbortController | null = null

const heroCount = computed(() => steps.value.length)
const statusText = computed(() => {
  if (errorMessage.value) {
    return errorMessage.value
  }

  if (streamFinished.value) {
    return '菜谱生成完成，你可以根据当前内容开始准备食材并尝试制作。'
  }

  return '正在为你生成菜谱，请稍候...'
})

const takeTimesText = computed(() => detail.value?.takeTimes || '')

function buildSkeletonRows(count: number) {
  return Array.from({ length: count }, (_, index) => index)
}

function applyStreamEvent(event: IndividualDishStreamEvent) {
  switch (event.type) {
    case 'start':
      errorMessage.value = ''
      return
    case 'base':
      applyBaseInfo(event.data)
      return
    case 'material':
      materials.value = [...materials.value, event.data]
      return
    case 'flavor':
      flavors.value = [...flavors.value, event.data]
      return
    case 'step':
      steps.value = [...steps.value, mapStepItem(event.data)].sort((left, right) => left.id - right.id)
      return
    case 'tips':
      tips.value = event.data
      return
    case 'done':
      streamFinished.value = true
      loading.value = false
      return
    case 'error':
      errorMessage.value = event.message || '菜谱生成失败'
      loading.value = false
      return
  }
}

function applyBaseInfo(baseInfo: IndividualDishBaseInfo) {
  detail.value = {
    title: baseInfo.dishName || dishName.value || 'AI生成菜谱',
    takeTimes: baseInfo.take_times || baseInfo.takeTimes || '',
  }
}

function mapStepItem(step: IndividualDishStep) {
  return {
    id: Number(step.stepNumber) || steps.value.length + 1,
    description: step.instruction,
  }
}

async function loadGeneratedDish() {
  if (!dishName.value) {
    loading.value = false
    errorMessage.value = '缺少菜名，暂时无法生成菜谱'
    return
  }

  streamController?.abort()
  streamController = new AbortController()
  detail.value = null
  materials.value = []
  flavors.value = []
  steps.value = []
  tips.value = ''
  errorMessage.value = ''
  loading.value = true
  streamFinished.value = false

  try {
    await streamDishGenerate(
      {
        dishName: dishName.value,
      },
      {
        signal: streamController.signal,
        onEvent: applyStreamEvent,
      },
    )

    if (!streamFinished.value) {
      streamFinished.value = true
      loading.value = false
    }
  } catch (error) {
    if (streamController.signal.aborted) {
      return
    }

    errorMessage.value = error instanceof Error ? error.message : '菜谱生成失败'
    loading.value = false
    showToast.fail(errorMessage.value)
  }
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/dish/search')
}

onMounted(() => {
  void loadGeneratedDish()
})

onBeforeUnmount(() => {
  streamController?.abort()
})
</script>

<template>
  <section class="detail-page">
    <header class="detail-hero detail-hero-compact">
      <button class="back-button" type="button" @click="goBack">
        <Left color="#ffffff" size="18" />
      </button>
      <div v-if="steps.length" class="gallery-count">
        <Message size="14" color="#ffffff" />
        <span>{{ heroCount }}</span>
      </div>
    </header>

    <section class="detail-section detail-intro">
      <div class="intro-main">
        <h1 class="dish-title">{{ detail?.title || dishName || 'AI生成菜谱' }}</h1>
        <p class="dish-stats">
          {{ takeTimesText ? `预计用时 ${takeTimesText}` : '正在生成详细菜谱内容' }}
        </p>
      </div>
      <div class="title-badge">
        <Category size="16" color="#ffffff" />
      </div>
    </section>

    <section class="detail-section ai-notice-section">
      <div class="status-card" :class="{ 'status-card-error': errorMessage }">
        <div class="status-icon">
          <Loading1 v-if="!errorMessage && !streamFinished" size="16" color="#ff7d55" />
          <Category v-else size="16" :color="errorMessage ? '#ff5a5a' : '#ff9f43'" />
        </div>
        <p>{{ statusText }}</p>
      </div>
    </section>

    <section class="detail-section">
      <h2 class="section-title">主料清单</h2>
      <div class="list-block">
        <template v-if="loading && !materials.length">
          <div v-for="row in buildSkeletonRows(3)" :key="`material-${row}`" class="list-row skeleton-row">
            <div class="skeleton-line skeleton-line-title" />
            <div class="skeleton-line skeleton-line-value" />
          </div>
        </template>
        <div v-for="(item, index) in materials" :key="`${item.name}-${index}`" class="list-row list-row-start">
          <div>
            <span>{{ item.name }}</span>
            <p v-if="item.deal" class="list-deal">{{ item.deal }}</p>
          </div>
          <strong>{{ item.dosage }}</strong>
        </div>
        <div v-if="!loading && !materials.length" class="section-empty">暂无主料信息</div>
      </div>
    </section>

    <section class="detail-section">
      <h2 class="section-title">调料清单</h2>
      <div class="list-block">
        <template v-if="loading && !flavors.length">
          <div v-for="row in buildSkeletonRows(2)" :key="`flavor-${row}`" class="list-row skeleton-row">
            <div class="skeleton-line skeleton-line-title" />
            <div class="skeleton-line skeleton-line-value" />
          </div>
        </template>
        <div v-for="(item, index) in flavors" :key="`${item.name}-${index}`" class="list-row">
          <span>{{ item.name }}</span>
          <strong>{{ item.dosage }}</strong>
        </div>
        <div v-if="!loading && !flavors.length" class="section-empty">暂无调料信息</div>
      </div>
    </section>

    <section class="detail-section">
      <h2 class="section-title">烹饪步骤</h2>
      <template v-if="loading && !steps.length">
        <article v-for="row in buildSkeletonRows(3)" :key="`step-${row}`" class="step-card skeleton-step-card">
          <div class="skeleton-line skeleton-line-step-title" />
          <div class="skeleton-line skeleton-line-step" />
          <div class="skeleton-line skeleton-line-step skeleton-line-step-short" />
        </article>
      </template>

      <article v-for="(step, index) in steps" :key="step.id" class="step-card">
        <p class="step-text">
          <strong>步骤{{ index + 1 }}/{{ steps.length }}</strong>
        </p>
        <div class="step-body">{{ step.description }}</div>
      </article>

      <div v-if="!loading && !steps.length" class="section-empty">暂无步骤信息</div>
    </section>

    <section v-if="tips || loading" class="detail-section">
      <h2 class="section-title">小贴士</h2>
      <div v-if="loading && !tips" class="tips-card skeleton-step-card">
        <div class="skeleton-line skeleton-line-step" />
        <div class="skeleton-line skeleton-line-step skeleton-line-step-short" />
      </div>
      <div v-else class="tips-card">{{ tips }}</div>
    </section>
  </section>
</template>

<style scoped>
.detail-page {
  min-height: 100vh;
  padding-bottom: 28px;
  background: #f4f4f4;
}

.detail-hero {
  position: relative;
  height: 318px;
  overflow: hidden;
  background: #ddd;
}

.detail-hero-compact {
  height: calc(env(safe-area-inset-top) + 96px);
  background: linear-gradient(180deg, #fff2ef 0%, #fff 100%);
}

.back-button {
  position: absolute;
  top: calc(env(safe-area-inset-top) + 16px);
  left: 14px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: rgba(17, 24, 39, 0.28);
  border: none;
  border-radius: 999px;
}

.gallery-count {
  position: absolute;
  right: 16px;
  bottom: 16px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  color: #ffffff;
  font-size: 13px;
  background: rgba(17, 24, 39, 0.38);
  border-radius: 999px;
}

.detail-section {
  margin: 12px 14px 0;
  padding: 18px 16px;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.05);
}

.detail-intro {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-top: -26px;
  position: relative;
  z-index: 1;
}

.intro-main {
  min-width: 0;
}

.dish-title {
  margin: 0;
  color: #111827;
  font-size: 28px;
  font-weight: 800;
}

.dish-stats {
  margin: 10px 0 0;
  color: #9ca3af;
  font-size: 14px;
}

.title-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #f7b54a, #ec8d3b);
  border-radius: 999px;
  box-shadow: 0 8px 18px rgba(236, 141, 59, 0.28);
}

.ai-notice-section {
  padding: 0;
  background: transparent;
  box-shadow: none;
}

.status-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 16px 14px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
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

.status-card p {
  margin: 0;
  color: #3b3b3b;
  font-size: 15px;
  line-height: 1.6;
}

.section-title {
  margin: 0 0 16px;
  color: #111827;
  font-size: 20px;
  font-weight: 800;
}

.list-block {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.list-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  color: #374151;
  font-size: 15px;
}

.list-row-start {
  align-items: flex-start;
}

.list-row strong {
  flex-shrink: 0;
  color: #111827;
}

.list-deal {
  margin: 6px 0 0;
  color: #9ca3af;
  font-size: 13px;
  line-height: 1.5;
}

.step-card,
.tips-card {
  padding: 16px;
  background: #faf7f3;
  border-radius: 16px;
}

.step-card + .step-card {
  margin-top: 14px;
}

.step-text {
  margin: 0;
  color: #111827;
  font-size: 16px;
}

.step-body {
  margin-top: 10px;
  color: #374151;
  font-size: 15px;
  line-height: 1.8;
}

.tips-card {
  color: #4b5563;
  font-size: 15px;
  line-height: 1.8;
}

.section-empty {
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
}

.skeleton-row,
.skeleton-step-card {
  position: relative;
  overflow: hidden;
}

.skeleton-line {
  border-radius: 999px;
  background: linear-gradient(90deg, #efefef 25%, #f8f8f8 37%, #efefef 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}

.skeleton-line-title {
  width: 44%;
  height: 14px;
}

.skeleton-line-value {
  width: 22%;
  height: 14px;
}

.skeleton-line-step-title {
  width: 30%;
  height: 15px;
}

.skeleton-line-step {
  width: 100%;
  height: 14px;
  margin-top: 12px;
}

.skeleton-line-step-short {
  width: 72%;
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
