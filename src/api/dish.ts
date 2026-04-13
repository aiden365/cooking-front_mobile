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



export function getDishSearchList(data: DishSearchParams) {
  return request<{ list: DishItem[]; total: number; page: number; pageSize: number }>({
    url: '/dishe/search',
    method: 'post',
    data,
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

type IndividualDishErrorResponse = {
  code?: number
  message?: string
  msg?: string
  success?: boolean
}

export interface IndividualDishGeneratePayload {
  dishId: number
  labelIds: number[]
}

export interface IndividualDishBaseInfo {
  dishName: string
  takeTimes: string
}

export interface IndividualDishMaterial {
  name: string
  dosage: string
  deal: string
}

export interface IndividualDishFlavor {
  name: string
  dosage: string
}

export interface IndividualDishStep {
  stepNumber: number
  instruction: string
}

type IndividualDishStreamEventMap = {
  start: { type: 'start'; status: string }
  base: { type: 'base'; data: IndividualDishBaseInfo }
  material: { type: 'material'; data: IndividualDishMaterial }
  flavor: { type: 'flavor'; data: IndividualDishFlavor }
  step: { type: 'step'; data: IndividualDishStep }
  tips: { type: 'tips'; data: string }
  done: { type: 'done'; status: string }
  error: { type: 'error'; status: string; name?: string; message: string }
}

export type IndividualDishStreamEvent =
  IndividualDishStreamEventMap[keyof IndividualDishStreamEventMap]

export interface IndividualDishStreamHandlers {
  onEvent?: (event: IndividualDishStreamEvent) => void
  onError?: (error: Error) => void
  signal?: AbortSignal
}

function parseIndividualDishStreamEvent(line: string): IndividualDishStreamEvent {
  const parsed = JSON.parse(line) as IndividualDishStreamEvent | IndividualDishErrorResponse

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('个性化菜谱数据格式错误')
  }

  if ('type' in parsed && typeof parsed.type === 'string') {
    return parsed as IndividualDishStreamEvent
  }

  if ('code' in parsed || 'message' in parsed || 'msg' in parsed) {
    const message =
      (typeof parsed.message === 'string' && parsed.message) ||
      (typeof parsed.msg === 'string' && parsed.msg) ||
      '个性化菜谱生成失败'

    throw new Error(message)
  }

  throw new Error('个性化菜谱数据格式错误')
}

export async function streamIndividualDish(
  payload: IndividualDishGeneratePayload,
  handlers: IndividualDishStreamHandlers = {},
) {
  const token = localStorage.getItem('token')
  const response = await fetch('/api/individualDish/aigc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(payload),
    signal: handlers.signal,
  })

  if (!response.ok) {
    throw new Error(`个性化菜谱生成失败(${response.status})`)
  }

  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    const errorBody = (await response.json()) as IndividualDishErrorResponse
    const message =
      (typeof errorBody.message === 'string' && errorBody.message) ||
      (typeof errorBody.msg === 'string' && errorBody.msg) ||
      '个性化菜谱生成失败'

    throw new Error(message)
  }

  if (!response.body) {
    throw new Error('当前浏览器不支持流式响应')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  try {
    while (true) {
      const { value, done } = await reader.read()

      if (done) {
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split(/\r?\n/)
      buffer = lines.pop() ?? ''

      for (const rawLine of lines) {
        const line = rawLine.trim()

        if (!line) {
          continue
        }

        const event = parseIndividualDishStreamEvent(line)
        handlers.onEvent?.(event)
      }
    }

    const finalChunk = `${buffer}${decoder.decode()}`.trim()

    if (finalChunk) {
      handlers.onEvent?.(parseIndividualDishStreamEvent(finalChunk))
    }
  } catch (error) {
    const nextError = error instanceof Error ? error : new Error('个性化菜谱生成失败')
    handlers.onError?.(nextError)
    throw nextError
  } finally {
    reader.releaseLock()
  }
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
