<template>
  <nut-tabbar bottom safe-area-inset-bottom v-model="activeTab" @tab-switch="tabSwitch">
    <nut-tabbar-item v-for="(item, index) in list" :key="item.key" :tab-title="item.title" :class="item.class">
      <template #icon>
        <component :is="activeTab === index ? item.icon.active : item.icon.inactive" />
      </template>
    </nut-tabbar-item>
  </nut-tabbar>
</template>

<script setup>
import { ref, h, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Home, Find, Share, My } from '@nutui/icons-vue';
import IcBaselineCamera from '~icons/ic/baseline-camera';
import MdiRice from '~icons/mdi/rice';

const router = useRouter();
const route = useRoute();
const activeTab = ref(0);

const list = [
  { key: 'index',  title: '首页', icon: { active: h(Home, { width: '20px', height: '20px' }), inactive: h(Home, { width: '20px', height: '20px' }) }, path: '/' },
  { key: 'dish', title: '菜谱', icon: { active: h(Find, { width: '20px', height: '20px' }), inactive: h(Find, { width: '20px', height: '20px' }) }, path: '/dish/list' },
  { key: 'advice', class:"middle_bar", title: '推荐', icon: { active: h(MdiRice, { width: '35px', height: '35px' }), inactive: h(MdiRice, { width: '35px', height: '35px', }) }, path: '/dish/recommend' },
  { key: 'shares', title: '美食圈子', icon: { active: h(IcBaselineCamera, { width: '20px', height: '20px' }), inactive: h(IcBaselineCamera, { width: '20px', height: '20px' }) }, path: '/share-list' },
  { key: 'user', title: '我的', icon: { active: h(My, { width: '20px', height: '20px' }), inactive: h(My, { width: '20px', height: '20px' }) }, path: '/user/home' },
];

const tabSwitch = (item, index) => {
  router.push(list[index].path);
  activeTab.value = index;
};

watch(() => route.path, (newPath) => {
  const index = list.findIndex(item => item.path === newPath);
  if (index !== -1) {
    activeTab.value = index;
  }
});
</script>

<style lang="css" scoped>
.middle_bar{
  padding-bottom: 16px;
}

</style>
