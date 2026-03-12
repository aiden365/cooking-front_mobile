import { request } from './request'

export interface PlanItem {
  id: string
  label: string
  value: string
}

export interface HomeTag {
  id: number
  name: string
  color: string
  background: string
}

export interface HomeRecipe {
  id: number
  title: string
  cover: string
  badge: string
  video: boolean
  author: string
  authorAvatar: string
  favoriteCount: string
}

export interface HomeConfig {
  banners: string[]
  plans: PlanItem[]
  tags: HomeTag[]
}

export interface HomeRecipePage {
  list: HomeRecipe[]
  page: number
  pageSize: number
  hasMore: boolean
}

export function getHomeConfig() {
  return request<HomeConfig>({
    url: '/home/config',
    method: 'get',
  })
}

export function getHomeRecipes(page: number, pageSize: number) {
  return request<HomeRecipePage>({
    url: '/home/recipes',
    method: 'get',
    params: {
      page,
      pageSize,
    },
  })
}
