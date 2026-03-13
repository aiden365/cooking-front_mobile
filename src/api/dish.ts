import { request } from './request'

export interface DishItem {
  id: number
  name: string
  description: string
  calories: number
  tags: string[]
}

export interface DishIngredient {
  name: string
  amount: string
}

export interface DishStep {
  id: number
  description: string
  images: string[]
}

export interface DishCommentReply {
  id: number
  nickname: string
  content: string
  time: string
  likes: number
}

export interface DishComment extends DishCommentReply {
  replies: DishCommentReply[]
}

export interface DishDetail {
  id: number
  title: string
  cover: string
  galleryCount: number
  browseCount: string
  favoriteCount: string
  cookedCount: string
  isFavorite: boolean
  ingredients: DishIngredient[]
  seasonings: DishIngredient[]
  steps: DishStep[]
  comments: DishComment[]
  commentCount: number
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

export function getDishDetail(id: string | number) {
  return request<DishDetail>({
    url: `/dishes/${id}`,
    method: 'get',
  })
}
