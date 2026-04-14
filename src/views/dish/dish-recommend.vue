<script setup lang="ts">
import { Left } from '@nutui/icons-vue'
import { showToast } from '@nutui/nutui'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { SystemLabel } from '../../api/label'
import { getSystemLabels, getUserLabels } from '../../api/label'
import {
  buildDietRecommendPreview,
  type DietRecommendNutrition,
  type DietRecommendPreview,
} from '../../api/dish'
import {
  getSystemNutritionList,
  getUserNutritionList,
  getUserProfile,
  type SystemNutritionItem,
  type UserNutritionItem,
  type UserProfileForm,
} from '../../api/user'
import MdiChevronRight from '~icons/mdi/chevron-right'

defineOptions({
  name: 'DishRecommend',
})

type RecommendProfile = UserProfileForm & {
  age?: number | string
}

type ConfirmRow = {
  key: string
  label: string
  value: string
  action: () => void
}

const router = useRouter()
const loading = ref(true)
const generating = ref(false)
const showResult = ref(false)

const nutritionOptions = ref<SystemNutritionItem[]>([])
const nutritions = ref<UserNutritionItem[]>([])
const systemLabels = ref<SystemLabel[]>([])
const selectedLabelIds = ref<number[]>([])
const recommendation = ref<DietRecommendPreview | null>(null)

const profile = ref<RecommendProfile>({
  userName: '',
  email: '',
  gender: 2,
  stature: '165cm',
  weight: '51kg',
  age: 28,
})

const profileRows = computed<ConfirmRow[]>(() => [
  {
    key: 'gender',
    label: '性别',
    value: formatGender(profile.value.gender),
    action: () => navigateWithConfirm('个人信息需要去个人资料页修改，是否现在前往？', '/user/my-profile'),
  },
  {
    key: 'age',
    label: '年龄',
    value: formatAge(profile.value.age),
    action: () => navigateWithConfirm('年龄信息需要去个人资料页修改，是否现在前往？', '/user/my-profile'),
  },
  {
    key: 'stature',
    label: '身高',
    value: formatMetric(profile.value.stature, 'cm'),
    action: () => navigateWithConfirm('身高信息需要去个人资料页修改，是否现在前往？', '/user/my-profile'),
  },
  {
    key: 'weight',
    label: '体重',
    value: formatMetric(profile.value.weight, 'kg'),
    action: () => navigateWithConfirm('体重信息需要去个人资料页修改，是否现在前往？', '/user/my-profile'),
  },
])

const nutritionRows = computed<ConfirmRow[]>(() => {
  if (!nutritions.value.length) {
    return [
      {
        key: 'empty-nutrition',
        label: '营养目标',
        value: '去完善',
        action: () =>
          navigateWithConfirm('当前还没有设置营养目标，是否现在前往营养目标页完善？', '/user/my-nutrition'),
      },
    ]
  }

  return nutritions.value.map((item) => ({
    key: String(item.id || item.nutritionId || item.nutritionName),
    label: item.nutritionName,
    value: item.aimValue,
    action: () =>
      navigateWithConfirm('营养目标需要去营养管理页修改，是否现在前往？', '/user/my-nutrition'),
  }))
})

const selectedLabelNames = computed(() =>
  systemLabels.value
    .filter((item) => selectedLabelIds.value.includes(item.id))
    .map((item) => item.labelName),
)

const resultStatusText = computed(() => {
  if (generating.value) {
    return recommendation.value?.status || '正在基于你的基本信息和健康状态，为你生成科学健康的饮食方案...'
  }

  return '已根据你的基本信息和健康状态，生成今日饮食推荐方案。'
})

function formatGender(gender: UserProfileForm['gender']) {
  if (gender === 1) {
    return '男'
  }

  if (gender === 2) {
    return '女'
  }

  return '保密'
}

function formatMetric(value: string | number | undefined, unit: string) {
  const text = String(value || '').trim()

  if (!text) {
    return `未填写${unit}`
  }

  return text.endsWith(unit) ? text : `${text}${unit}`
}

function formatAge(value: string | number | undefined) {
  const text = String(value || '').trim()

  if (!text) {
    return '未填写'
  }

  return text.endsWith('岁') ? text : `${text}`
}

function buildSkeletonRows(count: number) {
  return Array.from({ length: count }, (_, index) => index)
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/dish/search')
}

function navigateWithConfirm(message: string, path: string) {
  if (window.confirm(message)) {
    router.push(path)
  }
}

function toggleLabel(id: number) {
  if (selectedLabelIds.value.includes(id)) {
    selectedLabelIds.value = selectedLabelIds.value.filter((item) => item !== id)
    return
  }

  selectedLabelIds.value = [...selectedLabelIds.value, id]
}

function isLabelSelected(id: number) {
  return selectedLabelIds.value.includes(id)
}

function normalizeNutritionList(
  userList: UserNutritionItem[],
  optionList: SystemNutritionItem[],
): DietRecommendNutrition[] {
  const optionMap = optionList.reduce<Record<number, SystemNutritionItem>>((acc, item) => {
    acc[item.id] = item
    return acc
  }, {})

  return userList
    .filter((item) => item.nutritionId || item.nutritionName)
    .map((item) => ({
      name: item.nutritionName || optionMap[item.nutritionId || 0]?.nutritionName || '营养目标',
      value: item.aimValue,
    }))
}

async function loadPageData() {
  loading.value = true

  try {
    const [profileResponse, systemLabelResponse, userLabelResponse, systemNutritionResponse, userNutritionResponse] =
      await Promise.all([
        getUserProfile(),
        getSystemLabels({
          pageNum: 1,
          pageSize: -1,
        }),
        getUserLabels(),
        getSystemNutritionList(),
        getUserNutritionList(),
      ])

    profile.value = {
      ...profile.value,
      ...(profileResponse.data as RecommendProfile),
      age: (profileResponse.data as RecommendProfile).age ?? profile.value.age,
    }
    systemLabels.value = systemLabelResponse.data.records
    selectedLabelIds.value = userLabelResponse.data
    nutritionOptions.value = systemNutritionResponse.data
    nutritions.value = userNutritionResponse.data
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '饮食推荐信息加载失败')
  } finally {
    loading.value = false
  }
}

async function handleGenerate() {
  if (!selectedLabelIds.value.length) {
    showToast.text('请至少选择一个标签后再生成')
    return
  }

  showResult.value = true
  generating.value = true
  recommendation.value = buildDietRecommendPreview({
    profile: {
      gender: formatGender(profile.value.gender),
      age: String(profile.value.age || 28),
      stature: formatMetric(profile.value.stature, 'cm'),
      weight: formatMetric(profile.value.weight, 'kg'),
    },
    nutritions: normalizeNutritionList(nutritions.value, nutritionOptions.value),
    selectedLabelNames: selectedLabelNames.value,
  })

  await new Promise((resolve) => {
    window.setTimeout(resolve, 1100)
  })

  generating.value = false
}

function backToConfirm() {
  showResult.value = false
}

onMounted(() => {
  void loadPageData()
})
</script>

<template>
  <section class="recommend-page">
    <header class="page-header">
      <button class="back-button" type="button" @click="goBack">
        <Left size="18" color="#8d94a0" />
      </button>
      <h1 class="page-title">饮食推荐</h1>
      <button
        v-if="showResult"
        class="header-action"
        type="button"
        @click="backToConfirm"
      >
        重新生成
      </button>
      <div v-else class="header-space" />
    </header>

    <main class="page-body">
      <template v-if="!showResult">
        <div class="page-content">
          <div class="content-scroll">
            <section class="info-card">
              <h2 class="card-title">确认您的基本信息</h2>
              <div v-if="loading" class="card-loading">正在加载基本信息...</div>
              <button
                v-for="row in profileRows"
                v-else
                :key="row.key"
                class="info-row"
                type="button"
                @click="row.action"
              >
                <span class="info-label">{{ row.label }}</span>
                <span class="info-value">
                  {{ row.value }}
                  <MdiChevronRight class="row-arrow" />
                </span>
              </button>
            </section>

            <section class="info-card">
              <h2 class="card-title">填写您的营养目标信息</h2>
              <div v-if="loading" class="card-loading">正在加载营养目标...</div>
              <button
                v-for="row in nutritionRows"
                v-else
                :key="row.key"
                class="info-row"
                type="button"
                @click="row.action"
              >
                <span class="info-label">{{ row.label }}</span>
                <span class="info-value">
                  {{ row.value }}
                  <MdiChevronRight class="row-arrow" />
                </span>
              </button>
            </section>

            <section class="info-card">
              <h2 class="card-title">饮食偏好和身体状态</h2>
              <div v-if="loading" class="card-loading">正在加载标签...</div>
              <div v-else class="label-scroll">
                <button
                  v-for="item in systemLabels"
                  :key="item.id"
                  class="label-chip"
                  :class="{ 'label-chip-active': isLabelSelected(item.id) }"
                  type="button"
                  @click="toggleLabel(item.id)"
                >
                  {{ item.labelName }}
                </button>
                <div v-if="!systemLabels.length" class="empty-text">暂无可选标签</div>
              </div>
            </section>
          </div>
        </div>

        <footer class="action-bar">
          <button
            class="generate-button"
            type="button"
            :disabled="loading"
            @click="handleGenerate"
          >
            生成饮食方案
          </button>
        </footer>
      </template>

      <div v-else class="page-content">
        <div class="content-scroll">
          <section class="status-card" :class="{ 'status-card-generating': generating }">
            <div class="status-dot" />
            <p>{{ resultStatusText }}</p>
          </section>

          <section class="result-card">
            <h2 class="section-title">一、饮食推荐：</h2>

            <template v-if="generating">
              <div v-for="row in buildSkeletonRows(3)" :key="row" class="result-skeleton">
                <div class="skeleton-line skeleton-line-title" />
                <div class="skeleton-line" />
                <div class="skeleton-line skeleton-line-short" />
              </div>
            </template>

            <ol v-else class="recommend-list">
              <li
                v-for="meal in recommendation?.meals || []"
                :key="meal.key"
                class="recommend-item"
              >
                <div class="item-content">
                  <strong>{{ meal.title }}：{{ meal.dishName }}。</strong>
                  <span>{{ meal.description }}</span>
                </div>
              </li>
            </ol>
          </section>

          <section class="result-card">
            <h2 class="section-title">二、饮食分析：</h2>
            <div v-if="generating" class="result-skeleton result-skeleton-analysis">
              <div class="skeleton-line" />
              <div class="skeleton-line" />
              <div class="skeleton-line" />
              <div class="skeleton-line skeleton-line-short" />
            </div>
            <p v-else class="analysis-text">{{ recommendation?.analysis }}</p>
          </section>
        </div>
      </div>
    </main>
  </section>
</template>

<style scoped>
.recommend-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f7f7f7;
  box-sizing: border-box;
}

.page-header {
  display: grid;
  grid-template-columns: 44px 1fr 74px;
  align-items: center;
  padding: calc(env(safe-area-inset-top) + 8px) 10px 14px;
  background: #ffffff;
  flex-shrink: 0;
}

.back-button,
.header-action {
  border: none;
  background: transparent;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.page-title {
  margin: 0;
  color: #1f1f1f;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
}

.header-action {
  justify-self: end;
  color: #ff6d61;
  font-size: 13px;
  font-weight: 600;
}

.header-space {
  width: 32px;
  height: 32px;
  justify-self: end;
}

.page-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin-bottom: 13%;
}

.page-content {
  flex: 1;
  min-height: 0;
  padding: 12px 10px 0;
}

.content-scroll {
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 12px;
}

.content-scroll::-webkit-scrollbar {
  display: none;
}

.info-card,
.status-card,
.result-card {
  background: #ffffff;
  border-radius: 8px;
}

.info-card + .info-card,
.status-card + .result-card,
.result-card + .result-card {
  margin-top: 12px;
}

.info-card {
  padding: 14px 12px;
}

.card-title,
.section-title {
  margin: 0 0 12px;
  color: #202020;
  font-size: 16px;
  font-weight: 700;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 39px;
  padding: 0;
  color: #1f1f1f;
  background: transparent;
  border: none;
}

.info-row + .info-row {
  margin-top: 8px;
}

.info-label {
  font-size: 15px;
  font-weight: 600;
}

.info-value {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #8c92a0;
  font-size: 15px;
  font-weight: 600;
}

.row-arrow {
  width: 16px;
  height: 16px;
}

.label-scroll {
  display: flex;
  gap: 12px;
  min-height: 200px;
  max-height: 200px;
  padding-right: 4px;
  overflow-y: auto;
  flex-wrap: wrap;
  align-content: flex-start;
}

.label-chip {
  min-width: 76px;
  height: 34px;
  padding: 0 16px;
  color: #585d68;
  font-size: 14px;
  font-weight: 600;
  background: #ffffff;
  border: 1px solid #d3d6de;
  border-radius: 999px;
}

.label-chip-active {
  color: #ffffff;
  background: linear-gradient(135deg, #ff7f68 0, #ff685f 100%);
  border-color: transparent;
}

.status-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 12px;
}

.status-card-generating .status-dot {
  animation: pulse 1.2s ease infinite;
}

.status-dot {
  width: 8px;
  height: 8px;
  margin-top: 8px;
  background: #ff7565;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-card p {
  margin: 0;
  color: #5a5f68;
  font-size: 14px;
  line-height: 1.6;
}

.result-card {
  padding: 14px 12px;
}

.recommend-list {
  padding-left: 18px;
  margin: 0;
}

.recommend-item {
  color: #303133;
  font-size: 15px;
  line-height: 1.8;
}

.recommend-item + .recommend-item {
  margin-top: 10px;
}

.recommend-item::marker {
  color: #3a7afe;
  font-weight: 700;
}

.item-content strong {
  color: #23262d;
  font-weight: 700;
}

.analysis-text {
  margin: 0;
  color: #303133;
  font-size: 15px;
  line-height: 1.85;
}

.action-bar {
  flex-shrink: 0;
  padding: 10px 10px calc(18px + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.96);
}

.generate-button {
  width: 100%;
  height: 48px;
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
  background: #ff6f63;
  border: none;
  border-radius: 10px;
  margin-bottom: 10%;
}

.generate-button:disabled {
  opacity: 0.72;
}

.card-loading,
.empty-text {
  color: #a0a5b1;
  font-size: 14px;
  line-height: 1.6;
}

.result-skeleton {
  padding: 6px 0;
}

.result-skeleton + .result-skeleton {
  margin-top: 10px;
}

.result-skeleton-analysis {
  padding-top: 2px;
}

.skeleton-line {
  height: 14px;
  border-radius: 999px;
  background: linear-gradient(90deg, #efefef 25%, #f8f8f8 37%, #efefef 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}

.skeleton-line + .skeleton-line {
  margin-top: 12px;
}

.skeleton-line-title {
  width: 48%;
}

.skeleton-line-short {
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

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.4;
    transform: scale(1.2);
  }
}
</style>
