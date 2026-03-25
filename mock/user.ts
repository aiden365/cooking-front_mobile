import Mock from 'mockjs'

export function setupUserMock() {
  Mock.mock(/\/api\/user\/profile$/, 'get', () => ({
    code: 200,
    message: '获取用户信息成功',
    data: {
      name: '芒果爱酸奶',
      email: 'maoguoasn365@qq.com',
      gender: '女',
      height: '',
      weight: '60',
    },
  }))

  Mock.mock(/\/api\/user\/profile$/, 'post', ({ body }) => {
    const payload = body ? JSON.parse(body) : {}

    return {
      code: 200,
      message: '保存个人信息成功',
      data: payload,
    }
  })

  Mock.mock(/\/api\/user\/label\/\d+$/, 'get', () => ({
    code: 200,
    message: '获取用户标签成功',
    data: [1, 3, 7, 12],
  }))
}
