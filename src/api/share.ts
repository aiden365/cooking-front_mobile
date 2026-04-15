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

export interface ShareDetailData {
  id: number
  dishId: number
  description: string
  dishName: string
  imgPath: string
  createTime: string
}

export interface ShareCommentItem {
  id: number
  parentId: number
  userName: string
  content: string
  createTime: string
  userId?: number
  startCount?: number
  childCount?: number
  childCommentList?: ShareCommentItem[]
}

export interface ShareCommentPayload {
  shareId: number
  parentId: number
  content: string
}

export interface ShareCommentDeletePayload {
  shareId: number
  commentId?: number
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

export function getShareDetail(shareId: number) {
  return request<ShareDetailData>({
    url: '/share/detail',
    method: 'post',
    data: {
      shareId,
    },
  })
}

export function getShareCommentList(shareId: number, parentId = 0) {
  return request<ShareCommentItem[]>({
    url: '/userShareComment/list',
    method: 'post',
    data: {
      shareId,
      parentId,
    },
  })
}

export function addShareComment(data: ShareCommentPayload) {
  return request<boolean>({
    url: '/userShareComment/add',
    method: 'post',
    data,
  })
}

export function deleteShareComment(data: ShareCommentDeletePayload) {
  return request<boolean>({
    url: '/userShareComment/delete',
    method: 'post',
    data,
  })
}
