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
  collectNum: string
}

export interface UserCollectGroup {
  date: string
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
    url: '/user/collects',
    method: 'get',
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
