<template>
  <router-view />
  <TabBar v-if="showTabBar" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TabBar from './components/TabBar.vue'

const route = useRoute()

const showTabBar = computed(() =>
  ![
    'DishDetail',
    'DishIndividual',
    'Login',
    'Register',
    'ForgotPassword',
    'MyProfile',
    'MyCollect',
    'MyShare',
  ].includes(
    String(route.name),
  ),
)
</script>
