<script setup lang="ts">
import { Left, PlayCircleFill } from '@nutui/icons-vue'
import { showToast } from '@nutui/nutui'
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getUserDietPlan, type UserDietMeal } from '../../api/user'

defineOptions({
  name: 'MyDiet',
})

const selectedDate = ref(new Date('2026-03-27'))
const onChange = (val: Date) => {
  console.log(val)
}
const router = useRouter()
const loading = ref(true)

const meals = ref<UserDietMeal[]>([])

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`
}

function goBack() {
  router.push('/user/home')
}

function navigateToDishList() {
  router.push('/dish/list')
}

function removeDish(mealKey: UserDietMeal['key'], dishId: number) {
  meals.value = meals.value.map((meal) =>
    meal.key === mealKey
      ? { ...meal, dishes: meal.dishes.filter((dish) => dish.id !== dishId) }
      : meal,
  )
}

async function loadDietPlan() {
  loading.value = true

  try {
    const response = await getUserDietPlan(formatDateKey(selectedDate.value))
    meals.value = response.data
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '饮食记录加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadDietPlan()
})

watch(selectedDate, (value, oldValue) => {
  if (!value || (oldValue && formatDateKey(value) === formatDateKey(oldValue))) {
    return
  }

  void loadDietPlan()
})
</script>

<template>
  <section class="diet-page">
    <header class="page-header">
      <button class="back-button" type="button" @click="goBack">
        <Left size="18" />
      </button>
      <h1 class="page-title">饮食记录</h1>
      <div class="header-space"></div>
    </header>
    <nut-calendar-card v-model="selectedDate" @change="onChange"></nut-calendar-card>
    <section class="diet-content">
      <section class="meal-list">
        <div v-if="loading" class="state-text">正在加载饮食记录...</div>
        <section v-for="meal in meals" v-else :key="meal.key" class="meal-section">
          <div class="meal-header">
            <h2 class="meal-title">{{ meal.label }}</h2>
            <button class="add-dish-button" type="button" @click="navigateToDishList">
              添加菜谱
            </button>
          </div>

          <div v-if="!meal.dishes.length" class="empty-meal">暂无安排</div>

          <article v-for="dish in meal.dishes" :key="dish.id" class="dish-card">
            <div class="dish-cover-wrap">
              <img :src="dish.cover" :alt="dish.name" class="dish-cover" />
              <div v-if="dish.hasVideo" class="dish-video">
                <PlayCircleFill size="18" color="#ffffff" />
              </div>
            </div>

            <div class="dish-main">
              <h3 class="dish-name">{{ dish.name }}</h3>
              <div class="dish-tags">
                <span v-for="tag in dish.tags" :key="tag" class="dish-tag">{{ tag }}</span>
              </div>
              <p class="dish-meta">{{ dish.meta }}</p>
            </div>

            <button class="dish-remove" type="button" @click="removeDish(meal.key, dish.id)">
              移除
            </button>
          </article>
        </section>
      </section>
    </section>
  </section>
</template>

<style scoped>
.diet-page {
  min-height: 100vh;
  background: #ffffff;
}

.page-header {
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  align-items: center;
  padding: 46px 8px 18px;
  background: #f7f7f7;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: #8f96a3;
  background: transparent;
  border: none;
}

.page-title {
  margin: 0;
  color: #1a1a1a;
  font-size: 21px;
  font-weight: 500;
  text-align: center;
}

.header-space {
  width: 32px;
  height: 32px;
}

.diet-content {
  padding: 22px 16px 34px;
}

.calendar-card {
  padding: 8px 10px 10px;
  border: 1px dashed #ff8c80;
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
}
:deep(.nut-calendarcard){
  margin: 0 9px;
}
:deep(.nut-calendarcard-content){
  border-style: dotted;
  border-color: #ff6f63cf;
  margin: 0 6px;
  border-radius: 13px;
}

:deep(.nut-calendarcard-day){
  height: 39px;
  margin-bottom: 0px;
  width: 14%;
}

:deep(.nut-calendarcard-day.active){
  background-color: #ff6f63;
}

.meal-list {
  margin-top: 52px;
}

.meal-section {
  padding: 0 8px 22px;
  border-bottom: 1px solid #ededed;
}

.meal-section + .meal-section {
  margin-top: 28px;
}

.meal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.meal-title {
  margin: 0;
  color: #121212;
  font-size: 20px;
  font-weight: 700;
}

.add-dish-button {
  min-width: 108px;
  height: 42px;
  color: #ff6f63;
  font-size: 15px;
  background: #ffffff;
  border: 1px solid #ff7b6c;
  border-radius: 8px;
}

.empty-meal {
  padding: 22px 0 10px;
  color: #a7a7a7;
  font-size: 18px;
  text-align: center;
}

.dish-card {
  display: grid;
  grid-template-columns: 124px minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
}

.dish-card + .dish-card {
  margin-top: 24px;
}

.dish-cover-wrap {
  position: relative;
}

.dish-cover {
  width: 124px;
  height: 124px;
  object-fit: cover;
  border-radius: 10px;
}

.dish-video {
  position: absolute;
  right: 14px;
  bottom: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: rgba(255, 111, 99, 0.9);
  border-radius: 50%;
}

.dish-main {
  min-width: 0;
}

.dish-name {
  margin: 0 0 16px;
  color: #1d1d1d;
  font-size: 19px;
  font-weight: 700;
}

.dish-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.dish-tag {
  padding: 6px 12px;
  color: #2d2d2d;
  font-size: 14px;
  background: #f5f5f5;
  border-radius: 3px;
}

.dish-meta {
  margin: 0;
  color: #999999;
  font-size: 15px;
}

.dish-remove {
  align-self: end;
  color: #b3b3b3;
  font-size: 16px;
  background: transparent;
  border: none;
}

.state-text {
  padding: 48px 0;
  color: #9aa1ad;
  font-size: 15px;
  text-align: center;
}
</style>
emplate>
