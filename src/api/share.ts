import { request } from './request'

export interface SharePageReq {
  pageNum: number
  pageSize: number
  dishName?: string
}

export interface ShareAddPayload {
  dishId: number
  description: string
  imgPath: string
}

export interface ShareListItem {
  createTime: string
  dishId: number
  dishName: string
  id: number
  imgPath: string
  startCount: number
  userId: number
  userName: string
}

export interface SharePageData {
  current: number
  pages: number
  records: ShareListItem[]
  size: number
  total: number
}

export function getSharePage(data: SharePageReq) {
  return request<SharePageData>({
    url: '/share/page',
    method: 'post',
    data,
  })
}

export function addShare(data: ShareAddPayload) {
  return request<null>({
    url: '/share/add',
    method: 'post',
    data,
  })
}
