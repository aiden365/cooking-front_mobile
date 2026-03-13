<script setup lang="ts">
import { Category, Horizontal, Left, Loading1, More } from '@nutui/icons-vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

defineOptions({
  name: 'DishIndividual',
})

const route = useRoute()
const router = useRouter()

const selectedLabels = computed(() => {
  const raw = route.query.labelNames

  if (typeof raw !== 'string' || !raw) {
    return []
  }

  return raw.split('|').filter(Boolean)
})

const sections = [
  {
    title: '一、主料清单',
    items: [
      '鸡蛋：2个。打入碗中，加少许盐（分量外，约1g）和5ml温开水（半冷水），充分搅打至蛋液均匀起泡，静置30秒使气泡稳定。',
      '不辣青椒（如柿子椒/甜椒）：去蒂、去籽，洗净后切成菱形片或细丝；优先选用表皮光滑、肉厚色亮的绿色或红色甜椒，确保无辣味。',
    ],
  },
  {
    title: '二、调料清单',
    items: [
      '食用油：25ml（约2汤匙），用于滑蛋与炒制。',
      '盐：2g（约1/3茶匙），全部用于合炒阶段；蛋液中不再额外加盐，避免钠摄入过高影响感冒恢复。',
      '姜末：3g（约1小勺，新鲜老姜切极细末），提升香气并增强暖胃感。',
    ],
  },
  {
    title: '三、制作步骤',
    items: [
      '准备姜末，老姜去皮，用刀背拍松后切极细末（可助发汗解表、缓解感冒症状，且温和不刺激）。',
      '热锅温油：锅烧至微热（约120°C，手悬于锅上方感温热即可），倒入食用油，转中小火，下姜末煸炒5-8秒至香气微出，避免炒焦。',
      '倒入青椒快速翻炒，保持脆嫩口感；再淋入蛋液，待边缘微凝时轻推成大块，保留滑嫩质地。',
    ],
  },
]

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/dish/detail/1')
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
      <section class="status-card">
        <div class="status-icon">
          <Loading1 size="16" color="#ff7d55" />
        </div>
        <p>正在基于你的饮食偏好和身体状态，为你生成个性化的菜谱方案...</p>
      </section>

      <section class="content-card">
        <article v-for="section in sections" :key="section.title" class="plan-section">
          <h2>{{ section.title }}</h2>
          <ol>
            <li v-for="(item, index) in section.items" :key="item">
              <span class="item-index">{{ index + 1 }}.</span>
              <span class="item-text">{{ item }}</span>
            </li>
          </ol>
        </article>
      </section>
    </main>
  </section>
</template>

<style scoped>
.individual-page {
  min-height: 100vh;
  background: #f7f7f7;
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
  font-size: 16px;
  line-height: 1.5;
}

.content-card {
  margin-top: 12px;
  padding: 18px 14px 24px;
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
</style>
