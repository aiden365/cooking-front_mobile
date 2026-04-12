import { request } from './request'
import {UserShareItem} from "./user";

export interface PlanItem {
  id: number
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
  name: string
  imgPath: string
  badge: string
  video: boolean
  collectCount: string
}

export interface HomeConfig {
  banners: string[]
  plans: PlanItem[]
  tags: HomeTag[]
}

export interface HomeRecipePage {
  records: HomeRecipe[]
  total: number
  current: number
  size: number
  pages: number
}

export function getHomeConfig() {
  return request<HomeConfig>({
    url: '/home/config',
    method: 'get',
  })
}

export function getHomeRecipes(pageNo: number, pageSize: number) {
  return request<HomeRecipePage>({
    url: '/dish/page',
    method: 'post',
    data: {
      pageNo,
      pageSize,
    },
  })
}
