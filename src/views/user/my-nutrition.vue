<script setup lang="ts">
import { Left } from '@nutui/icons-vue'
import { showToast } from '@nutui/nutui'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  deleteUserNutritionItem,
  getSystemNutritionList,
  getUserNutritionList,
  saveUserNutritionItem,
  type SystemNutritionItem,
  type UserNutritionItem,
} from '../../api/user'
import MdiChevronDown from '~icons/mdi/chevron-down'
import MdiPlus from '~icons/mdi/plus'

defineOptions({
  name: 'MyNutrition',
})

type NutritionRow = UserNutritionItem & {
  localKey: string
  saving?: boolean
  deleting?: boolean
}

const router = useRouter()
const loading = ref(true)
const nutritionOptions = ref<SystemNutritionItem[]>([])
const nutritionRows = ref<NutritionRow[]>([])

const optionMap = computed(() =>
  nutritionOptions.value.reduce<Record<number, SystemNutritionItem>>((acc, item) => {
    acc[item.id] = item
    return acc
  }, {}),
)

function buildLocalRow(item?: Partial<UserNutritionItem>): NutritionRow {
  return {
    id: item?.id || 0,
    nutritionId: item?.nutritionId ?? null,
    nutritionName: item?.nutritionName || '',
    aimValue: item?.aimValue || '',
    localKey: `${item?.id || 'new'}-${Math.random().toString(36).slice(2, 8)}`,
    saving: false,
    deleting: false,
  }
}

function goBack() {
  router.push('/user/home')
}

function addNutritionRow() {
  nutritionRows.value.push(buildLocalRow())
}

function handleNutritionChange(row: NutritionRow, value: string) {
  const nutritionId = Number(value)

  if (!nutritionId) {
    row.nutritionId = null
    row.nutritionName = ''
    row.aimValue = ''
    return
  }

  const option = optionMap.value[nutritionId]
  row.nutritionId = nutritionId
  row.nutritionName = option?.nutritionName || ''
  row.aimValue = option?.defaultValue || ''
}

async function handleSave(row: NutritionRow) {
  if (!row.nutritionId) {
    showToast.text('请选择营养元素')
    return
  }

  if (!row.aimValue.trim()) {
    showToast.text('请输入目标值')
    return
  }

  row.saving = true

  try {
    const response = await saveUserNutritionItem({
      id: row.id || undefined,
      nutritionId: row.nutritionId,
      nutritionName: row.nutritionName,
      aimValue: row.aimValue.trim(),
    })

    row.id = response.data.id
    row.nutritionId = response.data.nutritionId
    row.nutritionName = response.data.nutritionName
    row.aimValue = response.data.aimValue
    showToast.success('保存成功')
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '保存失败，请稍后再试')
  } finally {
    row.saving = false
  }
}

async function handleDelete(row: NutritionRow) {
  if (!row.id) {
    nutritionRows.value = nutritionRows.value.filter((item) => item.localKey !== row.localKey)
    return
  }

  row.deleting = true

  try {
    await deleteUserNutritionItem(row.id)
    nutritionRows.value = nutritionRows.value.filter((item) => item.localKey !== row.localKey)
    showToast.success('删除成功')
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '删除失败，请稍后再试')
  } finally {
    row.deleting = false
  }
}

async function loadNutritionData() {
  loading.value = true

  try {
    const [systemResponse, userResponse] = await Promise.all([
      getSystemNutritionList(),
      getUserNutritionList(),
    ])

    nutritionOptions.value = systemResponse.data
    nutritionRows.value = userResponse.data.map((item) => buildLocalRow(item))
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '营养目标加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadNutritionData()
})
</script>

<template>
  <section class="nutrition-page">
    <header class="page-header">
      <button class="back-button" type="button" @click="goBack">
        <Left size="18" />
      </button>
      <h1 class="page-title">营养目标</h1>
      <div class="header-space" />
    </header>

    <section class="nutrition-content">
      <div v-if="loading" class="state-text">正在加载营养目标...</div>
      <template v-else>
        <article v-for="row in nutritionRows" :key="row.localKey" class="nutrition-row">
          <div class="nutrition-line">
            <div class="nutrition-fields">
              <div class="select-shell">
                <select
                  class="nutrition-select"
                  :value="row.nutritionId ?? ''"
                  @change="handleNutritionChange(row, ($event.target as HTMLSelectElement).value)"
                >
                  <option value="">请选择营养元素</option>
                  <option
                    v-for="option in nutritionOptions"
                    :key="option.id"
                    :value="option.id"
                  >
                    {{ option.nutritionName }}
                  </option>
                </select>
                <MdiChevronDown class="select-arrow" />
              </div>

              <input
                v-model="row.aimValue"
                class="aim-input"
                type="text"
                placeholder="请输入"
              />
            </div>

            <div class="action-group">
              <button
                class="row-action"
                type="button"
                :disabled="row.saving || row.deleting"
                @click="handleSave(row)"
              >
                {{ row.saving ? '保存中' : '保存' }}
              </button>
              <button
                class="row-action"
                type="button"
                :disabled="row.saving || row.deleting"
                @click="handleDelete(row)"
              >
                {{ row.deleting ? '删除中' : '删除' }}
              </button>
            </div>
          </div>
        </article>

        <button class="add-button" type="button" @click="addNutritionRow">
          <span class="add-icon">
            <MdiPlus />
          </span>
          <span>添加营养</span>
        </button>
      </template>
    </section>
  </section>
</template>

<style scoped>
.nutrition-page {
  min-height: 100vh;
  background: #ffffff;
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

.nutrition-content {
  padding: 22px 18px 36px;
}

.nutrition-row {
  padding: 18px 0 20px;
  border-bottom: 1px solid #ececec;
}

.nutrition-line {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nutrition-fields {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.76fr);
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.select-shell,
.aim-input {
  position: relative;
  height: 64px;
  background: #ffffff;
  border: 1px solid #dcdcdc;
  border-radius: 12px;
  box-sizing: border-box;
}

.nutrition-select {
  width: 100%;
  height: 100%;
  padding: 0 42px 0 14px;
  color: #1f1f1f;
  font-size: 18px;
  background: transparent;
  border: none;
  outline: none;
  appearance: none;
}

.select-arrow {
  position: absolute;
  top: 50%;
  right: 12px;
  width: 24px;
  height: 24px;
  color: #8f8f8f;
  pointer-events: none;
  transform: translateY(-50%);
}

.aim-input {
  padding: 0 14px;
  color: #1f1f1f;
  font-size: 18px;
  outline: none;
}

.aim-input::placeholder {
  color: #b5b5b5;
}

.action-group {
  display: flex;
  gap: 10px;
  flex-wrap: nowrap;
  flex-shrink: 0;
}

.row-action {
  min-width: 68px;
  height: 50px;
  padding: 0 14px;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  background: linear-gradient(135deg, #ff7f68 0, #ff675f 100%);
  border: none;
  border-radius: 10px;
}

.row-action:disabled {
  opacity: 0.72;
}

.add-button {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  height: 60px;
  padding: 0 18px;
  margin: 40px auto 0;
  color: #979797;
  font-size: 17px;
  font-weight: 600;
  background: #ffffff;
  border: 1px solid #ff7b6b;
  border-radius: 12px;
}

.add-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #ffffff;
  font-size: 22px;
  background: #ff9d91;
  border-radius: 50%;
}

.state-text {
  padding: 40px 0;
  color: #9aa1ad;
  font-size: 15px;
  text-align: center;
}
</style>
