import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Index',
    component: () => import('../views/index/index.vue'),
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
    path: '/dish/individual',
    name: 'DishIndividual',
    component: () => import('../views/dish/dish-individual.vue'),
  },
  {
    path: '/share-list',
    name: 'SharesList',
    component: () => import('../views/shares/share-list.vue'),
  },
  {
    path: '/user/home',
    name: 'UserHome',
    component: () => import('../views/user/home.vue'),
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
    path: '/user/profile',
    name: 'Profile',
    component: () => import('../views/user/profile.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
