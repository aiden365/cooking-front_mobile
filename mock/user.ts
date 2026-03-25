import Mock from 'mockjs'
import background1 from '../src/assets/img/background1.png'
import bowl from '../src/assets/img/bowl.png'
import dish1 from '../src/assets/img/dish1.png'
import dish2 from '../src/assets/img/dish2.png'

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

  Mock.mock(/\/api\/user\/collects$/, 'get', () => ({
    code: 200,
    message: '获取收藏列表成功',
    data: [
      {
        date: '2026.01.11',
        dishes: [
          {
            id: 101,
            name: '青椒炒鸡蛋',
            img: dish2,
            labels: '家常菜，零厨艺，快手菜',
            collectNum: '1.2w',
          },
          {
            id: 102,
            name: '西红柿炒蛋',
            img: dish1,
            labels: '家常菜，零厨艺，下饭菜',
            collectNum: '9855',
          },
        ],
      },
      {
        date: '2026.01.10',
        dishes: [
          {
            id: 103,
            name: '红烧排骨',
            img: dish1,
            labels: '家常菜，用料少',
            collectNum: '1.2w',
          },
        ],
      },
    ],
  }))

  Mock.mock(/\/api\/user\/shares$/, 'get', () => ({
    code: 200,
    message: '获取我的分享成功',
    data: [
      {
        id: 201,
        title: '哈哈哈很美味~',
        cover: background1,
        likes: 93,
        tags: ['荷塘小炒', '清爽'],
      },
      {
        id: 202,
        title: '非常成功的一道菜，家里人都说比外面做得还香还下饭',
        cover: dish2,
        likes: 126,
        tags: ['皮蛋豆腐', '凉拌'],
      },
      {
        id: 203,
        title: '哈哈哈很美味~',
        cover: dish1,
        likes: 93,
        tags: ['麻辣小龙虾', '夜宵'],
      },
      {
        id: 204,
        title: '来交作业啦',
        cover: bowl,
        likes: 93,
        tags: ['时蔬拼盘', '减脂'],
      },
    ],
  }))

  Mock.mock(/\/api\/user\/label\/\d+$/, 'get', () => ({
    code: 200,
    message: '获取用户标签成功',
    data: [1, 3, 7, 12],
  }))

  Mock.mock(/\/api\/user\/label$/, 'post', ({ body }) => {
    const payload = body ? JSON.parse(body) : {}

    return {
      code: 200,
      message: '保存用户标签成功',
      data: payload,
    }
  })
}
