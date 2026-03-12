import { request } from './request'

export interface DishItem {
  id: number
  name: string
  description: string
  calories: number
  tags: string[]
}

export function getRecommendDishes() {
  return request<DishItem[]>({
    url: '/dishes/recommend',
    method: 'get',
  })
}

export function getDishList() {
  return request<{ list: DishItem[]; total: number }>({
    url: '/dishes',
    method: 'get',
  })
}
