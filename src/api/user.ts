import { request } from './request'

export interface UserProfile {
  id: number
  nickname: string
  avatar: string
  healthGoal: string
  allergies: string[]
  favoriteCuisine: string[]
}

export function getUserProfile() {
  return request<UserProfile>({
    url: '/user/profile',
    method: 'get',
  })
}
