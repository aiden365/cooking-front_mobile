
<script setup lang="ts">
import { ref } from 'vue'
const cycle = ref(0)
const tabsValue = ref(0)
const sum = ref(24)
const infinityValue = ref(false)
const hasMore = ref(true)
const loadMore = () => {
  setTimeout(() => {
    sum.value = sum.value + 24
    cycle.value++
    if (cycle.value > 2) hasMore.value = false
    infinityValue.value = false
  }, 1000)
}
const refresh = ref(false)
const refreshFun = () => {
  setTimeout(() => {
    refresh.value = false
    sum.value = 24
  }, 3000)
}
</script>


<template>
  <section class="test-page">
    <nut-infinite-loading :loading="infinityValue" :has-more="hasMore" @load-more="loadMore">
      <nut-pull-refresh :model-value="refresh" @refresh="refreshFun">
        <div class="test-list">
          <div class="test" v-for="(item, index) in sum" :key="index">{{ index }}</div>
        </div>
      </nut-pull-refresh>
    </nut-infinite-loading>
  </section>
</template>

<style>
.test-page {
  min-height: 100vh;
  padding-bottom: calc(84px + env(safe-area-inset-bottom));
  background: #ffffff;
}

.test-list {
  min-height: calc(100vh - 84px);
}

.test {
  padding: 12px 0 12px 20px;
  border-top: 1px solid #eee;
}
</style>
