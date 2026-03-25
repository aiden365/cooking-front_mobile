<script setup lang="ts">
import { Left } from '@nutui/icons-vue'
import { showToast } from '@nutui/nutui'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getUserProfile, updateUserProfile, type UserProfileForm } from '../../api/user'

defineOptions({
  name: 'MyProfile',
})

const router = useRouter()
const saving = ref(false)
const loading = ref(true)

const form = reactive<UserProfileForm>({
  name: '',
  email: '',
  gender: '保密',
  height: '',
  weight: '',
})

const fieldRows = [
  { key: 'name', label: '名称', placeholder: '请输入名称' },
  { key: 'email', label: '邮箱', placeholder: '请输入邮箱' },
  { key: 'height', label: '身高', placeholder: '请输入身高，单位：cm' },
  { key: 'weight', label: '体重', placeholder: '请输入体重，单位：kg' },
] as const

const genderOptions: UserProfileForm['gender'][] = ['男', '女', '保密']

async function loadProfile() {
  loading.value = true

  try {
    const response = await getUserProfile()

    Object.assign(form, response.data)
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '用户信息加载失败')
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/user/home')
}

async function handleSave() {
  if (!form.name.trim()) {
    showToast.text('请输入名称')
    return
  }

  if (!form.email.trim()) {
    showToast.text('请输入邮箱')
    return
  }

  saving.value = true

  try {
    await updateUserProfile({
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      height: form.height.trim(),
      weight: form.weight.trim(),
    })
    showToast.success('保存成功')
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '保存失败，请稍后再试')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  void loadProfile()
})
</script>

<template>
  <section class="profile-page">
    <header class="page-header">
      <button class="back-button" type="button" @click="goBack">
        <Left size="18" />
      </button>
      <h1 class="page-title">个人信息</h1>
      <div class="header-space" />
    </header>

    <section class="form-card">
      <div v-if="loading" class="form-loading">正在加载个人信息...</div>
      <template v-else>
        <div v-for="row in fieldRows" :key="row.key" class="form-row">
          <label class="form-label" :for="row.key">{{ row.label }}</label>
          <input
            :id="row.key"
            v-model="form[row.key]"
            class="form-input"
            :class="{ 'form-input-placeholder': row.key === 'height' && !form.height }"
            :placeholder="row.placeholder"
            type="text"
          />
        </div>

        <div class="form-row form-row-gender">
          <span class="form-label">性别</span>
          <div class="gender-group">
            <button
              v-for="option in genderOptions"
              :key="option"
              class="gender-option"
              :class="{ 'gender-option-active': form.gender === option }"
              type="button"
              @click="form.gender = option"
            >
              {{ option }}
            </button>
          </div>
        </div>
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
.profile-page {
  min-height: 100vh;
  padding: 46px 0 124px;
  background: #f7f7f7;
  box-sizing: border-box;
}

.page-header {
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  align-items: center;
  padding: 0 8px;
  margin-bottom: 30px;
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

.form-card {
  margin: 0 12px;
  padding: 18px 20px 70px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(25, 28, 34, 0.04);
}

.form-loading {
  padding: 32px 0;
  color: #9aa1ad;
  font-size: 15px;
  text-align: center;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 20px;
  min-height: 64px;
}

.form-label {
  width: 88px;
  color: #8e95a3;
  font-size: 16px;
  font-weight: 600;
  flex-shrink: 0;
}

.form-input {
  flex: 1;
  min-width: 0;
  padding: 0;
  color: #222222;
  font-size: 16px;
  background: transparent;
  border: none;
  outline: none;
}

.form-input::placeholder {
  color: #c8c8c8;
}

.form-row-gender {
  align-items: flex-start;
  padding-top: 6px;
}

.gender-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 2px;
}

.gender-option {
  min-width: 52px;
  padding: 8px 12px;
  color: #666f7b;
  font-size: 15px;
  background: #f5f6f8;
  border: 1px solid transparent;
  border-radius: 999px;
}

.gender-option-active {
  color: #ff6d61;
  background: #fff0ee;
  border-color: #ffb8af;
}

.action-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 12px 22px calc(22px + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 -8px 24px rgba(30, 32, 38, 0.05);
}

.save-button {
  width: 100%;
  height: 58px;
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
