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

export interface DishDetailData {
  id: number
  name: string
  imgPath: string
  takeTimes: string
  viewCount: number
  collectCount: number
  userCollected: boolean
  shareCount: number
  checkStatus: 1 | 2
}

export interface DishMaterialItem {
  id: number
  dishId: number
  materialName: string
  dosage: string
  deal: string
}

export interface DishFlavorItem {
  id: number
  dishId: number
  flavorName: string
  dosage: string
}

export interface DishStepItem {
  id: number
  dishId: number
  stepDescribe: string
  stepImage: string
  sort: number
}

export interface DishCommentItem {
  id: number
  parentId: number
  dishId: number
  userId: number
  userName: string
  content: string
  startCount: number
  childCount: number
  createTime: string
}

export interface DishCommentPayload {
  dishId: number
  parentId: number
  content: string
}

export interface DishAppraiseTotalData {
  dishId: number
  manipulationAvg: number
  equalAvg: number
  satisfactionAvg: number
  totalScore: number
}

export interface DishAppraiseRecordItem {
  manipulationScore: number
  equalScore: number
  satisfactionScore: number
}

export interface DishAppraiseScorePayload {
  dishId: number
  manipulationScore: number
  equalScore: number
  satisfactionScore: number
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

export function getDishDetail(dishId: string | number) {
  return request<DishDetailData>({
    url: '/dish/detail',
    method: 'post',
    data: {
      dishId,
    },
  })
}

export function getDishMaterialList(dishId: string | number) {
  return request<DishMaterialItem[]>({
    url: '/dishMaterial/list',
    method: 'post',
    data: {
      dishId,
    },
  })
}

export function getDishFlavorList(dishId: string | number) {
  return request<DishFlavorItem[]>({
    url: '/dishFlavor/list',
    method: 'post',
    data: {
      dishId,
    },
  })
}

export function getDishStepList(dishId: string | number) {
  return request<DishStepItem[]>({
    url: '/dishStep/list',
    method: 'post',
    data: {
      dishId,
    },
  })
}

export function getDishCommentList(dishId: string | number, parentId = 0) {
  return request<DishCommentItem[]>({
    url: '/dishComment/list',
    method: 'post',
    data: {
      dishId,
      parentId,
    },
  })
}

export function addDishComment(data: DishCommentPayload) {
  return request<null>({
    url: '/dishComment/add',
    method: 'post',
    data,
  })
}

export function deleteDishComment(commentId: number) {
  return request<null>({
    url: '/dishComment/delete',
    method: 'post',
    data: {
      commentId,
    },
  })
}

export function starDishComment(commentId: number) {
  return request<null>({
    url: '/dishComment/star',
    method: 'post',
    data: {
      commentId,
    },
  })
}

export function addDishCollect(dishId: number) {
  return request<null>({
    url: '/collect/add',
    method: 'post',
    data: {
      dishId,
    },
  })
}

export function deleteDishCollect(dishId: number) {
  return request<null>({
    url: '/collect/delete',
    method: 'post',
    data: {
      dishId,
    },
  })
}

export function getDishAppraiseTotal(dishId: string | number) {
  return request<DishAppraiseTotalData>({
    url: '/appraises/dish-total',
    method: 'post',
    data: {
      dishId,
    },
  })
}

export function getDishUserAppraiseRecord(dishId: string | number) {
  return request<DishAppraiseRecordItem>({
    url: '/appraises/user-record',
    method: 'post',
    data: {
      dishId,
    },
  })
}

export function submitDishAppraise(data: DishAppraiseScorePayload) {
  return request<null>({
    url: '/appraises/scoring',
    method: 'post',
    data,
  })
}





export interface DishPage {
  records: DishItem[]
  total: number
  current: number
  size: number
  pages: number
}


export function getDishPage(pageNo: number, pageSize: number, search?: string, labelId?: number) {
  return request<DishPage>({
    url: '/dish/page',
    method: 'post',
    data: {
      pageNo,
      pageSize,
      search,
      labelId
    },
  })
}
