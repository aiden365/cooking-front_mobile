import Mock from 'mockjs'

const loginResponse = {
  code: 200,
  message: '登录成功',
  data: {
    token: 'mock-token-user-mobile',
    userId: 10001,
    nickname: '小厨同学',
  },
}

export function setupLoginMock() {
  Mock.mock(/\/api\/auth\/login$/, 'post', () => loginResponse)
  Mock.mock(/\/api\/auth\/register$/, 'post', () => ({
    code: 200,
    message: '注册成功',
    data: {
      userId: Mock.Random.integer(10002, 99999),
    },
  }))
}
