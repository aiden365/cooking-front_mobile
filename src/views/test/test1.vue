<script setup lang="ts">
defineOptions({
  // name 作为一种规范最好必须写上并且和路由的name保持一致
  name: "Test1"
});


import { ref } from 'vue'
const value = ref(new Date('2023-01-01'))
const onChange = (val: Date) => {
  console.log(val)
}

</script>

<template>
  <h1>测试页面1</h1> 
   <nut-calendar-card v-model="value" @change="onChange"></nut-calendar-card>
</template>
