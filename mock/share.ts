import Mock from 'mockjs'
import background1 from '../src/assets/img/background1.png'
import bowl from '../src/assets/img/bowl.png'
import dish1 from '../src/assets/img/dish1.png'
import dish2 from '../src/assets/img/dish2.png'

const shareRecords = [
  {
    createTime: '2026-04-09 02:50:39',
    dishId: 7,
    dishName: '西红柿炒鸡蛋',
    id: 1,
    imgPath: bowl,
    startCount: 0,
    userId: 1,
    userName: '超级管理员',
  },
  {
    createTime: '2026-04-09 08:12:11',
    dishId: 8,
    dishName: '青椒炒鸡蛋',
    id: 2,
    imgPath: background1,
    startCount: 12,
    userId: 2,
    userName: '家常菜小馆',
  },
  {
    createTime: '2026-04-10 09:16:20',
    dishId: 9,
    dishName: '红烧排骨',
    id: 3,
    imgPath: dish1,
    startCount: 93,
    userId: 3,
    userName: '美食课代表',
  },
  {
    createTime: '2026-04-10 12:16:20',
    dishId: 10,
    dishName: '鸡蛋火腿炒青椒',
    id: 4,
    imgPath: dish2,
    startCount: 126,
    userId: 4,
    userName: '烟火食堂',
  },
  {
    createTime: '2026-04-10 18:20:15',
    dishId: 11,
    dishName: '番茄滑蛋',
    id: 5,
    imgPath: bowl,
    startCount: 61,
    userId: 5,
    userName: '每日一菜',
  },
  {
    createTime: '2026-04-11 10:22:56',
    dishId: 12,
    dishName: '蒜香排骨',
    id: 6,
    imgPath: dish1,
    startCount: 88,
    userId: 6,
    userName: '下厨达人',
  },
  {
    createTime: '2026-04-11 17:08:42',
    dishId: 13,
    dishName: '青椒火腿炒蛋',
    id: 7,
    imgPath: dish2,
    startCount: 45,
    userId: 7,
    userName: '家宴日记',
  },
  {
    createTime: '2026-04-12 09:08:42',
    dishId: 14,
    dishName: '小炒鸡蛋',
    id: 8,
    imgPath: background1,
    startCount: 32,
    userId: 8,
    userName: '厨房练习生',
  },
]

export function setupShareMock() {
  /*Mock.mock(/\/api\/share\/page$/, 'post', ({ body }) => {
    const payload = body ? JSON.parse(body) : {}
    const pageNum = Number(payload.pageNum || 1)
    const pageSize = Number(payload.pageSize || 7)
    const dishName = String(payload.dishName || '').trim()

    const filtered = shareRecords.filter((item) =>
      dishName ? item.dishName.includes(dishName) : true,
    )
    const start = (pageNum - 1) * pageSize
    const records = filtered.slice(start, start + pageSize)

    return {
      code: 0,
      message: 'success',
      data: {
        current: pageNum,
        pages: Math.max(1, Math.ceil(filtered.length / pageSize)),
        records,
        size: pageSize,
        total: filtered.length,
      },
    }
  })*/
}
