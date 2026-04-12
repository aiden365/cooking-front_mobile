import Mock from 'mockjs'
import background1 from '../src/assets/img/background1.png'
import bowl from '../src/assets/img/bowl.png'
import dish1 from '../src/assets/img/dish1.png'
import dish2 from '../src/assets/img/dish2.png'

export function setupUserMock() {
  const userNutritionList = [
    {
      id: 1001,
      nutritionId: 1001,
      nutritionName: '蛋白质',
      aimValue: '20g',
    },
    {
      id: 1002,
      nutritionId: 1002,
      nutritionName: '脂肪',
      aimValue: '20g',
    },
    {
      id: 1003,
      nutritionId: 1003,
      nutritionName: '碳水化合物',
      aimValue: '20g',
    },
  ]

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

/*  Mock.mock(/\/api\/collect\/day-group$/, 'post', () => ({
    code: 0,
    message: 'success',
    data: [
      {
        day: '2026-01-11',
        dishes: [
          {
            id: 101,
            name: '青椒炒鸡蛋',
            img: dish2,
            labels: '家常菜，零厨艺，快手菜',
            collectTotalNum: 12000,
          },
          {
            id: 102,
            name: '西红柿炒蛋',
            img: dish1,
            labels: '家常菜，零厨艺，下饭菜',
            collectTotalNum: 9855,
          },
        ],
      },
      {
        day: '2026-01-10',
        dishes: [
          {
            id: 103,
            name: '红烧排骨',
            img: dish1,
            labels: '家常菜，用料少',
            collectTotalNum: 12000,
          },
        ],
      },
    ],
  }))*/

  /*Mock.mock(/\/api\/user\/shares$/, 'get', () => ({
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
  }))*/

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

  Mock.mock(/\/api\/user\/nutrition$/, 'get', () => ({
    code: 200,
    message: '获取用户营养目标成功',
    data: userNutritionList,
  }))

  Mock.mock(/\/api\/user\/nutrition$/, 'post', ({ body }) => {
    const payload = body ? JSON.parse(body) : {}
    const nextId = payload.id || Date.now()
    const responseData = {
      id: nextId,
      nutritionId: payload.nutritionId,
      nutritionName: payload.nutritionName,
      aimValue: payload.aimValue,
    }

    return {
      code: 200,
      message: '保存营养目标成功',
      data: responseData,
    }
  })

  Mock.mock(/\/api\/user\/nutrition\/\d+$/, 'delete', () => ({
    code: 200,
    message: '删除营养目标成功',
    data: null,
  }))

  Mock.mock(/\/api\/user\/diet-plan(\?.*)?$/, 'get', ({ url }) => {
    const currentUrl = new URL(url, 'https://mock.local')
    const date = currentUrl.searchParams.get('date') || ''

    const today = new Date()
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate(),
    ).padStart(2, '0')}`

    const mealData =
      date === todayKey
        ? [
            {
              key: 'breakfast',
              label: '早餐',
              dishes: [],
            },
            {
              key: 'lunch',
              label: '午餐',
              dishes: [
                {
                  id: 301,
                  name: '红烧排骨',
                  cover: dish1,
                  tags: ['家常菜', '零厨艺'],
                  meta: '2人做过 | 5 收藏',
                },
                {
                  id: 302,
                  name: '麻婆豆腐',
                  cover: dish2,
                  tags: ['家常菜', '用料少'],
                  meta: '2做过 | 2收藏',
                },
              ],
            },
            {
              key: 'dinner',
              label: '晚餐',
              dishes: [
                {
                  id: 303,
                  name: '干锅花菜',
                  cover: background1,
                  tags: ['家常菜', '零厨艺'],
                  meta: '10人做过 | 0收藏',
                  hasVideo: true,
                },
              ],
            },
          ]
        : [
            {
              key: 'breakfast',
              label: '早餐',
              dishes: [],
            },
            {
              key: 'lunch',
              label: '午餐',
              dishes: [],
            },
            {
              key: 'dinner',
              label: '晚餐',
              dishes: [],
            },
          ]

    return {
      code: 200,
      message: '获取饮食计划成功',
      data: mealData,
    }
  })
}
