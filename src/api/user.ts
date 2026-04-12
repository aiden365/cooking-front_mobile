import { request } from './request'

export interface UserProfileForm {
  name: string
  email: string
  gender: '男' | '女' | '保密'
  height: string
  weight: string
}

export interface UserCollectedDish {
  id: number
  name: string
  img: string
  labels: string
  collectTotalNum: number | string
}

export interface UserCollectGroup {
  day: string
  dishes: UserCollectedDish[]
}

export interface UserShareItem {
  id: number
  title: string
  cover: string
  likes: number
  tags: string[]
}

export interface SystemNutritionItem {
  id: number
  nutritionName: string
  defaultValue: string
}

export interface UserNutritionItem {
  id: number
  nutritionId: number | null
  nutritionName: string
  aimValue: string
}

export interface UserNutritionPayload {
  id?: number
  nutritionId: number
  nutritionName: string
  aimValue: string
}

export interface UserDietDish {
  id: number
  name: string
  cover: string
  tags: string[]
  meta: string
  hasVideo?: boolean
}

export interface UserDietMeal {
  key: 'breakfast' | 'lunch' | 'dinner'
  label: '早餐' | '午餐' | '晚餐'
  dishes: UserDietDish[]
}

export function getUserProfile() {
  return request<UserProfileForm>({
    url: '/user/profile',
    method: 'get',
  })
}

export function updateUserProfile(data: UserProfileForm) {
  return request<null>({
    url: '/user/profile',
    method: 'post',
    data,
  })
}

export function getUserCollectList() {
  return request<UserCollectGroup[]>({
    url: '/collect/day-group',
    method: 'post'

  })
}

export function getUserShareList() {
  return request<UserShareItem[]>({
    url: '/user/shares',
    method: 'get',
  })
}

export function getSystemNutritionList() {
  return request<SystemNutritionItem[]>({
    url: '/system/nutrition',
    method: 'get',
  })
}

export function getUserNutritionList() {
  return request<UserNutritionItem[]>({
    url: '/user/nutrition',
    method: 'get',
  })
}

export function saveUserNutritionItem(data: UserNutritionPayload) {
  return request<UserNutritionItem>({
    url: '/user/nutrition',
    method: 'post',
    data,
  })
}

export function deleteUserNutritionItem(id: number) {
  return request<null>({
    url: `/user/nutrition/${id}`,
    method: 'delete',
  })
}

export function getUserDietPlan(date: string) {
  return request<UserDietMeal[]>({
    url: '/user/diet-plan',
    method: 'get',
    params: { date },
  })
}
