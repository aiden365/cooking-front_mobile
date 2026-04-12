import { request } from './request'

export interface DishItem {
  id: number
  name: string
  imgPath: string
  labelNames?: string[]
  videoPath?: string
  collectCount: number
  shareCount:number
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

export interface DishSearchParams {
  keyword?: string
  sortBy?: 'comprehensive' | 'favorite' | 'activity' | 'time'
  withVideo?: boolean
  page?: number
  pageSize?: number
}

export function getRecommendDishes() {
  return request<DishItem[]>({
    url: '/dishes/recommend',
    method: 'get',
  })
}



export function getDishSearchList(params: DishSearchParams) {
  return request<{ list: DishItem[]; total: number; page: number; pageSize: number }>({
    url: '/dishes/search',
    method: 'get',
    params,
  })
}

export function getDishDetail(id: string | number) {
  return request<DishDetail>({
    url: `/dishes/${id}`,
    method: 'get',
  })
}





export interface DishPage {
  records: DishItem[]
  total: number
  current: number
  size: number
  pages: number
}


export function getDishPage(pageNo: number, pageSize: number, search?: string) {
  return request<DishPage>({
    url: '/dish/page',
    method: 'post',
    data: {
      pageNo,
      pageSize,
    },
  })
}
