<script setup lang="ts">
import { Check, Left, Search2 } from '@nutui/icons-vue'
import { showToast } from '@nutui/nutui'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getSystemLabels, getUserLabels, updateUserLabels, type SystemLabel } from '../../api/label'

defineOptions({
  name: 'MyLabel',
})

const router = useRouter()
const userId = 10001

const keyword = ref('')
const appliedKeyword = ref('')
const currentPage = ref(1)
const loading = ref(true)
const saving = ref(false)
const systemLabels = ref<SystemLabel[]>([])
const selectedIds = ref<number[]>([])


function goBack() {
  router.push('/user/home')
}

function submitSearch() {
  appliedKeyword.value = keyword.value.trim()
  currentPage.value = 1
  loadLabelData();
}

function toggleLabel(id: number) {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((item) => item !== id)
    return
  }

  selectedIds.value = [...selectedIds.value, id]
}

function isSelected(id: number) {
  return selectedIds.value.includes(id)
}


async function loadLabelData() {
  loading.value = true

  try {
    const [systemResponse, userResponse] = await Promise.all([
      getSystemLabels({
        pageNum: currentPage.value,
        pageSize: -1,
        search: appliedKeyword.value,
        type:1
      }),
      getUserLabels(),
    ])
    systemLabels.value = systemResponse.data.records;
    selectedIds.value = userResponse.data
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '标签数据加载失败')
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  saving.value = true

  try {

    await updateUserLabels(selectedIds.value);
    showToast.success('保存成功')
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '保存失败，请稍后再试')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  void loadLabelData()
})
</script>

<template>
  <section class="label-page">
    <header class="page-header">
      <button class="back-button" type="button" @click="goBack">
        <Left size="18" />
      </button>
      <h1 class="page-title">标签管理</h1>
      <div class="header-space" />
    </header>

    <section class="search-section">
      <div class="search-shell">
        <Search2 size="18" color="#8f96a3" />
        <input
          v-model="keyword"
          class="search-input"
          type="text"
          maxlength="20"
          placeholder="搜索标签"
          @keyup.enter="submitSearch"
        />
        <button class="search-button" type="button" @click="submitSearch">搜索</button>
      </div>
    </section>

    <section class="label-list-wrap">
      <div v-if="loading" class="state-text">正在加载标签...</div>
      <template v-else>
        <button
          v-for="item in systemLabels"
          :key="item.id"
          class="label-row"
          type="button"
          @click="toggleLabel(item.id)"
        >
          <span class="label-name">{{ item.labelName }}</span>
          <span class="label-check" :class="{ 'label-check-active': isSelected(item.id) }">
            <Check v-if="isSelected(item.id)" size="12" color="#ffffff" />
          </span>
        </button>

        <div v-if="!systemLabels.length" class="state-text">没有找到相关标签</div>
      </template>
    </section>

    <footer class="action-bar">
      <button class="save-button" type="button" :disabled="saving || loading" @click="handleSave">
        {{ saving ? '保存中...' : '保存' }}
      </button>
    </footer>
  </section>
</template>

<style scoped>
.label-page {
  height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-header {
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  align-items: center;
  padding: 46px 8px 18px;
  background: #f7f7f7;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: #8f96a3;
  background: transparent;
  border: none;
}

.page-title {
  margin: 0;
  color: #1a1a1a;
  font-size: 21px;
  font-weight: 500;
  text-align: center;
}

.header-space {
  width: 32px;
  height: 32px;
}

.search-section {
  padding: 14px 18px 10px;
  background: #f7f7f7;
}

.search-shell {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 46px;
  padding: 0 4px 0 12px;
  border: 1px solid #ffb9ae;
  border-radius: 17px;
  background: #ffffff;
}

.search-input {
  flex: 1;
  min-width: 0;
  color: #414141;
  font-size: 15px;
  background: transparent;
  border: none;
  outline: none;
}

.search-input::placeholder {
  color: #9da3ae;
}

.search-button {
  min-width: 68px;
  height: 38px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #ff8b7b 0, #ff715f 100%);
  border: none;
  border-radius: 14px;
}

.label-list-wrap {
  flex: 1;
  padding: 12px 14px 24px;
  overflow-y: auto;
  box-sizing: border-box;
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 76px;
  color: #1f1f1f;
  background: transparent;
  border: none;
  border-bottom: 1px solid #ececec;
}

.label-name {
  font-size: 18px;
  font-weight: 500;
}

.label-check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 2px solid #1f1f1f;
  border-radius: 50%;
  box-sizing: border-box;
}

.label-check-active {
  background: #ff705f;
  border-color: #ff705f;
}

.load-more {
  width: 100%;
  margin-top: 18px;
  color: #8f96a3;
  font-size: 14px;
  background: transparent;
  border: none;
}

.state-text {
  padding: 36px 0;
  color: #9aa1ad;
  font-size: 15px;
  text-align: center;
}

.action-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 12px 24px calc(20px + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 -8px 24px rgba(30, 32, 38, 0.05);
}

.save-button {
  width: 100%;
  height: 56px;
  color: #ffffff;
  font-size: 17px;
  font-weight: 700;
  background: linear-gradient(135deg, #ff7f68 0, #ff675f 100%);
  border: none;
  border-radius: 10px;
}

.save-button:disabled {
  opacity: 0.72;
}
</style>
