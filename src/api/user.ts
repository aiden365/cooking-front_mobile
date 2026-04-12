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
  dishId: number
  dishName: string
  description: string
  imgPath: string
  startCount: number
  createTime: string
}

export interface UserSharePage {
  success: boolean;
  code: number;
  data: {
    records: UserShareItem[];
    total: number;
    current: number;
    size: number;
  };
  message: string;
}

export interface SharePageReq{
  pageNum: number
  pageSize: number
  dishName?: string
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
  dishId: number
  name: string
  dishImg: string
  tags: string[]
  collectCount: number
  shareCount:number
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

export function getUserShareList(data:SharePageReq  ) {
  return request<UserSharePage>({
    url: 'share/page',
    method: 'post',
    data
  })
}

export function getSystemNutritionList() {
  return request<SystemNutritionItem[]>({
    url: 'nutrition/list',
    method: 'post',
  })
}

export function getUserNutritionList() {
  return request<UserNutritionItem[]>({
    url: 'userNutrition/list',
    method: 'post',
  })
}

export function saveUserNutritionItem(data: UserNutritionPayload) {
  return request<UserNutritionItem>({
    url: 'userNutrition/save',
    method: 'post',
    data,
  })
}

export function deleteUserNutritionItem(id: number) {
  return request<null>({
    url: `/userNutrition/delete`,
    method: 'post',
    data: { id },
  })
}

export function getUserDietPlan(date: string) {
  return request<UserDietMeal[]>({
    url: 'diet/detail',
    method: 'post',
    data: { date },
  })
}

export function deleteUserDietPlan(dietId: number) {
  return request<null>({
    url: 'diet/delete',
    method: 'post',
    data: { dietId },
  })
}

