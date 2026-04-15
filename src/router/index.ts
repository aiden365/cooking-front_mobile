import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Index',
    component: () => import('../views/index/index.vue'),
  },
  {
    path: '/test1',
    name: 'Test1',
    component: () => import('../views/test/test1.vue'),
  },
  {
    path: '/dish/detail/:id',
    name: 'DishDetail',
    component: () => import('../views/dish/dish-detail.vue'),
  },
  {
    path: '/dish/list',
    name: 'DishList',
    component: () => import('../views/dish/dish-list.vue'),
  },
  {
    path: '/dish/search',
    name: 'DishSearch',
    component: () => import('../views/dish/dish-search.vue'),
  },
  {
    path: '/dish/generate',
    name: 'DishGenerate',
    component: () => import('../views/dish/dish-generate.vue'),
  },
  {
    path: '/dish/individual',
    name: 'DishIndividual',
    component: () => import('../views/dish/dish-individual.vue'),
  },
  {
    path: '/dish/recommend',
    name: 'DishRecommend',
    component: () => import('../views/dish/dish-recommend.vue'),
  },
  {
    path: '/share-list',
    name: 'SharesList',
    component: () => import('../views/shares/share-list.vue'),
  },
  {
    path: '/share',
    name: 'ShareCreate',
    component: () => import('../views/shares/share.vue'),
  },
  {
    path: '/share-detail/:id',
    name: 'ShareDetail',
    component: () => import('../views/shares/share-detail.vue'),
  },
  {
    path: '/user/home',
    name: 'UserHome',
    component: () => import('../views/user/my-index.vue'),
  },
  {
    path: '/user/my-index',
    name: 'MyIndex',
    component: () => import('../views/user/my-index.vue'),
  },
  {
    path: '/user/login',
    name: 'Login',
    component: () => import('../views/user/login.vue'),
  },
  {
    path: '/user/register',
    name: 'Register',
    component: () => import('../views/user/register.vue'),
  },
  {
    path: '/user/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/user/forgot-password.vue'),
  },
  {
    path: '/user/my-collect',
    name: 'MyCollect',
    component: () => import('../views/user/my-collect.vue'),
  },
  {
    path: '/user/my-diet',
    name: 'MyDiet',
    component: () => import('../views/user/my-diet.vue'),
  },
  {
    path: '/user/my-share',
    name: 'MyShare',
    component: () => import('../views/user/my-share.vue'),
  },
  {
    path: '/user/my-profile',
    name: 'MyProfile',
    component: () => import('../views/user/my-profile.vue'),
  },
  {
    path: '/user/my-individual-dish',
    name: 'MyIndividualDish',
    component: () => import('../views/user/my-individual-dish.vue'),
  },
  {
    path: '/user/my-label',
    name: 'MyLabel',
    component: () => import('../views/user/my-label.vue'),
  },
  {
    path: '/user/my-nutrition',
    name: 'MyNutrition',
    component: () => import('../views/user/my-nutrition.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
