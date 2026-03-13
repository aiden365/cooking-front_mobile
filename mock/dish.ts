import Mock from 'mockjs'
import dish1 from '../src/assets/img/dish1.jpg'

const dishList = [
  {
    id: 1,
    name: '红烧排骨',
    description: '浓油赤酱，软烂入味，是最经典的家常硬菜之一。',
    calories: 486,
    tags: ['家常菜', '宴客菜'],
  },
  {
    id: 2,
    name: '山药玉米排骨汤',
    description: '口味清淡，适合全家共享。',
    calories: 318,
    tags: ['营养均衡', '汤品'],
  },
  {
    id: 3,
    name: '西兰花虾仁',
    description: '10 分钟快手菜，富含优质蛋白。',
    calories: 198,
    tags: ['快手菜', '高蛋白'],
  },
]

const dishDetailMap = {
  1: {
    id: 1,
    title: '红烧排骨',
    cover: dish1,
    galleryCount: 5,
    browseCount: '8.2w',
    favoriteCount: '1.2w',
    cookedCount: '125人做过',
    isFavorite: true,
    ingredients: [
      { name: '排骨', amount: '1节' },
      { name: '葱', amount: '适量' },
      { name: '姜', amount: '适量' },
      { name: '蒜', amount: '半颗' },
    ],
    seasonings: [
      { name: '盐', amount: '适量' },
      { name: '食用油', amount: '少许' },
      { name: '鸡精', amount: '少许' },
    ],
    steps: [
      {
        id: 1,
        description: '排骨斩小块，冲洗干净。',
        images: [
          'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1200&q=80',
        ],
      },
      {
        id: 2,
        description: '骨入锅中加冷水、料酒、生姜片和葱段煮沸，煮出血沫捞出洗净。',
        images: [
          'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
        ],
      },
      {
        id: 3,
        description: '锅中少油炒糖色，下排骨翻炒至上色，加入葱姜蒜炒香。',
        images: [
          'https://images.unsplash.com/photo-1514517220017-8ce97a34a7b6?auto=format&fit=crop&w=1200&q=80',
        ],
      },
      {
        id: 4,
        description: '加入生抽、老抽、蚝油和热水，没过排骨后小火焖煮 35 分钟。',
        images: [
          'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80',
        ],
      },
      {
        id: 5,
        description: '大火收汁，根据口味补少许盐，最后撒上葱花即可出锅。',
        images: [
          'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80',
        ],
      },
    ],
    comments: [
      {
        id: 1,
        nickname: '一颗柠檬',
        content: '这个菜真是巨巨巨下饭~',
        time: '1天前',
        likes: 3,
        replies: [
          {
            id: 11,
            nickname: '阿星',
            content: '我也试了，配米饭真的停不下来。',
            time: '18小时前',
            likes: 1,
          },
        ],
      },
      {
        id: 2,
        nickname: 'D继续',
        content: '排骨焯水多久哇？',
        time: '10.28 11:08',
        likes: 90,
        replies: [
          {
            id: 21,
            nickname: '大悦',
            content: '不用很久，差不多 10 分钟就行。',
            time: '3分钟前',
            likes: 0,
          },
          {
            id: 22,
            nickname: '小颜',
            content: '水开了，没有浮沫就行。',
            time: '2分钟前',
            likes: 0,
          },
        ],
      },
    ],
  },
} as const

export function setupDishMock() {
  Mock.mock(/\/api\/dishes\/recommend$/, 'get', () => ({
    code: 200,
    message: '获取推荐菜谱成功',
    data: dishList,
  }))

  Mock.mock(/\/api\/dishes$/, 'get', () => ({
    code: 200,
    message: '获取菜谱列表成功',
    data: {
      list: dishList,
      total: dishList.length,
    },
  }))

  Mock.mock(/\/api\/dishes\/\d+$/, 'get', ({ url }) => {
    const match = url.match(/\/api\/dishes\/(\d+)$/)
    const id = Number(match?.[1] || 1)
    const detail = dishDetailMap[id as keyof typeof dishDetailMap] || dishDetailMap[1]

    return {
      code: 200,
      message: '获取菜谱详情成功',
      data: {
        ...detail,
        commentCount: detail.comments.length,
      },
    }
  })
}
