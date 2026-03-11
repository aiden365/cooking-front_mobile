<script setup lang="ts">
import { ref } from 'vue';
import IconAccountBox from '~icons/mdi/account-box'
const show = ref(false);
const click = () => {
  show.value = true;
};
</script>

<template>
  <IconAccountBox></IconAccountBox>
  
  <div>
    <nut-cell title="我是标题" desc="描述文字" @click="click"></nut-cell>
    <nut-popup v-model:visible="show" closeable position="bottom" style="height: 50%;">
      这里是 popup 的内容
    </nut-popup>
  </div>

  <IconFont name="dongdong"></IconFont>
  <IconFont name="JD"></IconFont>

  
</template>

