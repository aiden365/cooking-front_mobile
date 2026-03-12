import Mock from 'mockjs'
import { setupDishMock } from './dish'
import { setupHomeMock } from './home'
import { setupLoginMock } from './login'
import { setupUserMock } from './user'

let isMockReady = false

export function setupMock() {
  if (isMockReady || !import.meta.env.DEV) {
    return
  }

  Mock.setup({
    timeout: '200-600',
  })

  setupLoginMock()
  setupUserMock()
  setupDishMock()
  setupHomeMock()

  isMockReady = true
}
