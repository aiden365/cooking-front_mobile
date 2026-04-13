<script setup lang="ts">
import { showToast } from '@nutui/nutui'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getSystemLabels, getUserLabels, type SystemLabel } from '../api/label'

const props = withDefaults(
  defineProps<{
    initialSelectedIds?: number[]
  }>(),
  {
    initialSelectedIds: () => [],
  },
)

const emit = defineEmits<{
  generate: [payload: { labelIds: number[]; labelNames: string[] }]
}>()

const showPanel = ref(false)
const aiLabels = ref<SystemLabel[]>([])
const selectedLabelIds = ref<number[]>([])
const aiLoading = ref(false)
const aiLoaded = ref(false)
const aiErrorMessage = ref('')
const aiButtonTop = ref(360)
const isDragging = ref(false)
const movedDuringDrag = ref(false)

let pointerStartY = 0
let buttonStartTop = 0

const hasInitialSelection = computed(() => props.initialSelectedIds.length > 0)

watch(
  () => props.initialSelectedIds,
  (value) => {
    if (hasInitialSelection.value) {
      selectedLabelIds.value = [...value]
    }
  },
  { immediate: true },
)

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

async function loadAILabels(force = false) {
  if ((aiLoaded.value && !force) || aiLoading.value) {
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
    selectedLabelIds.value = hasInitialSelection.value
      ? [...props.initialSelectedIds]
      : userResponse.data
    aiLoaded.value = true
  } catch (error) {
    aiErrorMessage.value = error instanceof Error ? error.message : '标签加载失败'
  } finally {
    aiLoading.value = false
  }
}

function handleFloatClick() {
  if (movedDuringDrag.value) {
    movedDuringDrag.value = false
    return
  }

  showPanel.value = true
  void loadAILabels()
}

function toggleLabel(labelId: number) {
  if (selectedLabelIds.value.includes(labelId)) {
    selectedLabelIds.value = selectedLabelIds.value.filter((id) => id !== labelId)
    return
  }

  selectedLabelIds.value = [...selectedLabelIds.value, labelId]
}

function handleGenerate() {
  if (!selectedLabelIds.value.length) {
    showToast.text('请先选择至少一个标签')
    return
  }

  const labelNames = aiLabels.value
    .filter((label) => selectedLabelIds.value.includes(label.id))
    .map((label) => label.labelName)

  showPanel.value = false
  emit('generate', {
    labelIds: [...selectedLabelIds.value],
    labelNames,
  })
}

onMounted(() => {
  aiButtonTop.value = clampButtonTop(window.innerHeight * 0.52)
})

onBeforeUnmount(() => {
  stopDrag()
})
</script>

<template>
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

  <div v-if="showPanel" class="ai-popup-mask" @click="showPanel = false" />
  <section v-if="showPanel" class="ai-popup">
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
    <button type="button" class="ai-generate-button" @click="handleGenerate">生成</button>
  </section>
</template>

<style scoped>
.ai-popup-mask {
  position: fixed;
  inset: 0;
  z-index: 39;
  background: rgba(17, 24, 39, 0.32);
}

.ai-popup {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 40;
  display: flex;
  flex-direction: column;
  height: 52vh;
  min-height: 320px;
  padding: 12px 18px calc(16px + env(safe-area-inset-bottom));
  background: #ffffff;
  border-radius: 22px 22px 0 0;
  box-shadow: 0 -12px 32px rgba(15, 23, 42, 0.12);
}

.ai-popup-handle {
  width: 42px;
  height: 5px;
  margin: 0 auto;
  background: #e5e7eb;
  border-radius: 999px;
}

.ai-popup-title {
  margin: 16px 0 0;
  color: #111827;
  font-size: 18px;
  font-weight: 800;
  text-align: center;
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

.ai-state {
  flex: 1;
  color: #9ca3af;
  font-size: 14px;
  line-height: 1.6;
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
