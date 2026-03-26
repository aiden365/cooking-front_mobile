<script setup lang="ts">
import { Left, PlayCircleFill } from '@nutui/icons-vue'
import { showToast } from '@nutui/nutui'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getUserDietPlan, type UserDietMeal } from '../../api/user'
import MdiChevronLeft from '~icons/mdi/chevron-left'
import MdiChevronRight from '~icons/mdi/chevron-right'

defineOptions({
  name: 'MyDiet',
})

type WeekDay = {
  label: string
  value: Date
  dateKey: string
}

const router = useRouter()
const loading = ref(true)
const selectedDate = ref(startOfDay(new Date()))
const meals = ref<UserDietMeal[]>([])

const weekLabels = ['日', '一', '二', '三', '四', '五', '六']

const weekDates = computed<WeekDay[]>(() => {
  const start = getWeekStart(selectedDate.value)

  return Array.from({ length: 7 }, (_, index) => {
    const value = new Date(start)
    value.setDate(start.getDate() + index)

    return {
      label: weekLabels[value.getDay()],
      value,
      dateKey: formatDateKey(value),
    }
  })
})

const calendarTitle = computed(
  () => `${String(selectedDate.value.getMonth() + 1).padStart(2, '0')}月 ${selectedDate.value.getFullYear()}年`,
)

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function getWeekStart(date: Date) {
  const current = startOfDay(date)
  const diff = current.getDay()
  current.setDate(current.getDate() - diff)
  return current
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`
}

function isToday(date: Date) {
  return formatDateKey(date) === formatDateKey(new Date())
}

function isSelected(date: Date) {
  return formatDateKey(date) === formatDateKey(selectedDate.value)
}

function goBack() {
  router.push('/user/home')
}

function goPrevWeek() {
  const next = new Date(selectedDate.value)
  next.setDate(next.getDate() - 7)
  selectedDate.value = next
  void loadDietPlan()
}

function goNextWeek() {
  const next = new Date(selectedDate.value)
  next.setDate(next.getDate() + 7)
  selectedDate.value = next
  void loadDietPlan()
}

function selectDate(date: Date) {
  selectedDate.value = startOfDay(date)
  void loadDietPlan()
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
</script>

<template>
  <section class="diet-page">
    <header class="page-header">
      <button class="back-button" type="button" @click="goBack">
        <Left size="18" />
      </button>
      <h1 class="page-title">饮食记录</h1>
      <div class="header-space" />
    </header>

    <section class="diet-content">
      <section class="calendar-card">
        <div class="calendar-nav">
          <button class="calendar-arrow" type="button" @click="goPrevWeek">
            <MdiChevronLeft />
          </button>
          <span class="calendar-title">{{ calendarTitle }}</span>
          <button class="calendar-arrow" type="button" @click="goNextWeek">
            <MdiChevronRight />
          </button>
        </div>

        <div class="calendar-grid">
          <button
            v-for="item in weekDates"
            :key="item.dateKey"
            class="calendar-day"
            :class="{
              'calendar-day-selected': isSelected(item.value),
              'calendar-day-weekend': item.value.getDay() === 0 || item.value.getDay() === 6,
            }"
            type="button"
            @click="selectDate(item.value)"
          >
            <span class="calendar-week">{{ item.label }}</span>
            <span class="calendar-date">{{ item.value.getDate() }}</span>
            <span v-if="isToday(item.value)" class="calendar-today">今</span>
          </button>
        </div>
      </section>

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
  padding: 18px 16px 14px;
  border: 1px dashed #ff8c80;
  border-radius: 12px;
}

.calendar-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin-bottom: 20px;
}

.calendar-title {
  color: #6f6f6f;
  font-size: 18px;
  font-weight: 500;
}

.calendar-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #a5a5a5;
  background: transparent;
  border: none;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
}

.calendar-day {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 8px 0 12px;
  color: #111111;
  background: transparent;
  border: none;
  border-radius: 10px;
}

.calendar-day-weekend .calendar-week {
  color: #ff7667;
}

.calendar-week {
  font-size: 17px;
  font-weight: 600;
}

.calendar-date {
  font-size: 19px;
  font-weight: 700;
}

.calendar-day-selected {
  color: #ffffff;
  background: #ff6f63;
}

.calendar-day-selected .calendar-week,
.calendar-day-selected .calendar-date,
.calendar-day-selected .calendar-today {
  color: #ffffff;
}

.calendar-today {
  position: absolute;
  top: 34px;
  right: 8px;
  color: #ff7667;
  font-size: 11px;
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
