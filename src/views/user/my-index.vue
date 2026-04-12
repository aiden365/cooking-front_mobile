<script setup lang="ts">
import { Star } from '@nutui/icons-vue'
import { computed, onMounted, ref} from 'vue'
import { useRouter } from 'vue-router'
import MdiFoodForkDrink from '~icons/mdi/food-fork-drink'
import MdiShareVariantOutline from '~icons/mdi/share-variant-outline'
import MdiTagOutline from '~icons/mdi/tag-outline'
import MdiNutrition from '~icons/mdi/nutrition'
import MdiChevronRight from '~icons/mdi/chevron-right'
import MdiCalendarMonthOutline from '~icons/mdi/calendar-month-outline'
import {getUserProfile, getUserStatistics, type UserStatistics, type UserProfileForm} from '../../api/user'
import { showToast } from '@nutui/nutui'
defineOptions({
  name: 'MyIndex',
})

const router = useRouter()

const userInfo = ref<UserProfileForm>({
  userName: '',
  email: '',
  gender: 1,
  stature: '',
  weight: '',
})
const userStatistics = ref<UserStatistics>({
  collectCount: 0,
  shareCount: 0,
  labelCount: 0,
  nutritionCount: 0,
  individualDishCount: 0,
})
const stats = [
  { label: '收藏', value: 0 },
  { label: '分享', value: 0 },
  { label: '标签', value: 0 },
  { label: '营养', value: 0 },
]

const individualDishCount = 100

const featureItems = [
  {
    label: '我的收藏',
    icon: Star,
    path: '/user/my-collect',
  },
  {
    label: '我的分享',
    icon: MdiShareVariantOutline,
    path: '/user/my-share',
  },
  {
    label: '标签管理',
    icon: MdiTagOutline,
    path: '/user/my-label',
  },
  {
    label: '营养管理',
    icon: MdiNutrition,
    path: '/user/my-nutrition',
  },
  {
    label: '饮食计划',
    icon: MdiCalendarMonthOutline,
    path: '/user/my-diet',
  },
]

const avatarText = computed(() => userInfo.value?.userName.slice(0, 1) ?? "");

function navigateTo(path: string) {
  router.push(path)
}

async function loadUserInfo() {

  try {
    const [getUserStatisticsRes, getUserProfileRes] = await Promise.all([
      getUserStatistics(),
      getUserProfile(),
    ])

    userStatistics.value = getUserStatisticsRes.data;
    userInfo.value = getUserProfileRes.data;
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '饮食记录加载失败')
  }
}

onMounted(() => {

  loadUserInfo();

})

</script>

<template>
  <section class="my-page">
    <header class="profile-card">
      <div class="profile-summary">
        <div class="avatar">{{ avatarText }}</div>
        <div class="identity">
          <h1 class="name">{{ userInfo?.userName }}</h1>
          <p class="meta">性别:{{ userInfo.gender ? (userInfo.gender == 1 ? '男' : '女') : '保密' }}</p>
        </div>
      </div>
      <button class="profile-button" type="button" @click="navigateTo('/user/my-profile')">
        个人信息
      </button>
    </header>

    <section class="stats-card">
      <div class="stat-item">
        <div class="stat-value">{{ userStatistics.collectCount }}</div>
        <div class="stat-label">收藏</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ userStatistics.shareCount }}</div>
        <div class="stat-label">分享</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ userStatistics.labelCount }}</div>
        <div class="stat-label">标签</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ userStatistics.nutritionCount }}</div>
        <div class="stat-label">营养</div>
      </div>

    </section>

    <button class="individual-card" type="button" @click="navigateTo('/user/my-individual-dish')">
      <div class="individual-main">
        <div class="individual-icon">
          <MdiFoodForkDrink />
        </div>
        <strong class="individual-count">{{ userStatistics.individualDishCount }}</strong>
      </div>
      <div class="individual-action">
        <span>管理个性化菜谱</span>
        <MdiChevronRight class="individual-arrow" />
      </div>
    </button>

    <section class="feature-card">
      <button
        v-for="item in featureItems"
        :key="item.label"
        class="feature-item"
        type="button"
        @click="navigateTo(item.path)"
      >
        <div class="feature-icon">
          <component :is="item.icon" class="feature-icon-svg" />
        </div>
        <span class="feature-label">{{ item.label }}</span>
      </button>
    </section>
  </section>
</template>

<style scoped>
.my-page {
  min-height: calc(100vh - 66px);
  padding: 52px 14px 24px;
  background:
    radial-gradient(circle at left 36%, rgba(203, 240, 244, 0.68) 0, rgba(203, 240, 244, 0) 29%),
    radial-gradient(circle at right top, rgba(255, 209, 209, 0.82) 0, rgba(255, 209, 209, 0) 34%),
    radial-gradient(circle at right bottom, rgba(238, 225, 251, 0.46) 0, rgba(238, 225, 251, 0) 28%),
    linear-gradient(180deg, #fff8f7 0, #f9fbfb 28%, #ffffff 100%);
  box-sizing: border-box;
}

.profile-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 22px 8px 12px;
}

.profile-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 84px;
  height: 84px;
  color: #ffffff;
  font-size: 50px;
  font-weight: 500;
  background: linear-gradient(135deg, #ff7263 0, #ff6d64 100%);
  border-radius: 50%;
  flex-shrink: 0;
}

.identity {
  min-width: 0;
}

.name {
  margin: 0 0 10px;
  color: #1e1e1e;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.meta {
  margin: 0;
  color: #252525;
  font-size: 16px;
  font-weight: 600;
}

.profile-button {
  flex-shrink: 0;
  padding: 14px 18px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #ff7c68 0, #ff6b61 100%);
  border: none;
  border-radius: 10px;
}

.stats-card {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding: 28px 0 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.stat-value {
  color: #0f1012;
  font-size: 26px;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  color: #9ea6b3;
  font-size: 18px;
  font-weight: 600;
}

.individual-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 18px 20px;
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 16px;
  box-shadow: 0 12px 28px rgba(156, 203, 208, 0.16);
}

.individual-main {
  display: flex;
  align-items: center;
  gap: 14px;
}

.individual-icon {
  color: #ff7263;
  font-size: 38px;
  line-height: 1;
}

.individual-count {
  color: #ff7263;
  font-size: 24px;
  font-weight: 700;
}

.individual-action {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8d95a2;
  font-size: 16px;
  font-weight: 700;
}

.individual-arrow {
  width: 20px;
  height: 20px;
}

.feature-card {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 22px 6px;
  padding: 20px 12px 30px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(210, 214, 220, 0.9);
  border-radius: 18px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #70737c;
  background: transparent;
  border: none;
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: #0f1012;
}

.feature-label {
  font-size: 15px;
  font-weight: 600;
}

.feature-icon-svg {
  width: 28px;
  height: 28px;
}
</style>
