<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../../api/auth'
import backgroundImage from '../../assets/img/background1.png'

defineOptions({
  name: 'Login',
})

const router = useRouter()
const userCode = ref('')
const password = ref('')
const loading = ref(false)
const message = ref('')

async function handleLogin() {
  if (!userCode.value || !password.value) {
    message.value = '请完整填写用户名和密码'
    return
  }

  loading.value = true
  message.value = ''

  try {
    const response = await login({
      userCode: userCode.value,
      password: password.value,
    })

    localStorage.setItem('token', response.data.accessToken)
    localStorage.setItem(
      'userInfo',
      JSON.stringify({
        id: response.data.id,
        userName: response.data.userName,
        expires: response.data.expires,
      }),
    )
    message.value = `欢迎回来，${response.data.userName}`
    router.push('/user/home')
  } catch (error) {
    message.value = error instanceof Error ? error.message : '登录失败，请稍后再试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="login-page" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <div class="login-overlay" />

    <div class="login-shell">
      <section class="login-hero">
        <div class="hero-icon">
          <icon-mdi-chef-hat />
        </div>
        <!-- <h1>智能菜谱</h1>
        <p>记录健康饮食，生成更懂你的每一餐</p> -->
        <h3>智能菜谱更懂你的每一餐</h3>
      </section>

      <section class="login-panel">
        <label class="field">
          <span class="field-icon"><icon-mdi-account-outline /></span>
          <input v-model="userCode" type="text" placeholder="请输入用户名" />
        </label>

        <label class="field">
          <span class="field-icon"><icon-mdi-lock-outline /></span>
          <input v-model="password" type="password" placeholder="请输入密码" />
        </label>

        <!-- <label class="field">
          <span class="field-icon"><icon-mdi-email-outline /></span>
          <input v-model="email" type="email" placeholder="请输入邮箱" />
        </label> -->

        <button class="login-button" type="button" :disabled="loading" @click="handleLogin">
          {{ loading ? '登录中...' : '登录' }}
        </button>

        <p v-if="message" class="message-text">{{ message }}</p>

        <div class="action-row">
          <button type="button" class="text-button" @click="router.push('/user/register')">注册</button>
          <button type="button" class="text-button" @click="router.push('/user/forgot-password')">
            修改密码
          </button>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 22px;
  background-position: center;
  background-size: cover;
}

.login-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0.88)),
    radial-gradient(circle at top, rgba(255, 143, 132, 0.24), transparent 58%);
  backdrop-filter: blur(3px);
}

.login-shell {
  position: relative;
  z-index: 1;
  width: min(100%, 420px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
}

.login-hero {
  text-align: center;
}

.hero-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  margin: 0 auto 18px;
  color: #ffffff;
  font-size: 42px;
  background: linear-gradient(135deg, rgb(255, 170, 143), rgb(255, 143, 132));
  border-radius: 28px;
  box-shadow: 0 18px 36px rgba(255, 143, 132, 0.28);
}

.login-hero h1 {
  margin: 0;
  color: #3b241f;
  font-size: 34px;
  font-weight: 800;
  letter-spacing: 1px;
}

.login-hero p {
  margin: 10px 0 0;
  color: #775750;
  font-size: 15px;
}

.login-panel {
  width: 100%;
  padding: 24px 18px 20px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.65);
  border-radius: 28px;
  box-shadow: 0 24px 44px rgba(99, 60, 43, 0.12);
  backdrop-filter: blur(14px);
}

.field {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 54px;
  padding: 0 16px;
  margin-bottom: 14px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 143, 132, 0.18);
  border-radius: 18px;
}

.field-icon {
  color: rgb(255, 143, 132);
  font-size: 20px;
  line-height: 1;
}

.field input {
  flex: 1;
  min-width: 0;
  color: #4b3d39;
  font-size: 15px;
  background: transparent;
  border: none;
  outline: none;
}

.login-button {
  width: 100%;
  height: 52px;
  margin-top: 6px;
  color: #ffffff;
  font-size: 17px;
  font-weight: 700;
  background: linear-gradient(90deg, rgb(255, 143, 132), rgb(255, 171, 133));
  border: none;
  border-radius: 18px;
  box-shadow: 0 16px 28px rgba(255, 143, 132, 0.24);
}

.login-button:disabled {
  opacity: 0.72;
}

.message-text {
  margin: 14px 4px 0;
  color: #8a625b;
  font-size: 13px;
  text-align: center;
}

.action-row {
  display: flex;
  justify-content: space-between;
  margin-top: 18px;
}

.text-button {
  color: #8f6059;
  font-size: 14px;
  background: transparent;
  border: none;
}
</style>
