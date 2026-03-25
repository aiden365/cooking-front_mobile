<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../../api/auth'
import backgroundImage from '../../assets/img/background1.png'

defineOptions({
  name: 'Register',
})

const router = useRouter()
const username = ref('')
const password = ref('')
const email = ref('')
const emailCode = ref('')
const loading = ref(false)
const message = ref('')

async function handleRegister() {
  if (!username.value || !password.value || !email.value || !emailCode.value) {
    message.value = '请完整填写用户名、密码、邮箱和邮箱验证码'
    return
  }

  loading.value = true
  message.value = ''

  try {
    await register({
      username: username.value,
      password: password.value,
    })

    message.value = '注册成功，请返回登录'
  } catch (error) {
    message.value = error instanceof Error ? error.message : '注册失败，请稍后再试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="auth-page" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <div class="auth-overlay" />

    <div class="auth-shell">
      <!-- <section class="auth-hero">
        <div class="hero-icon">
          <icon-mdi-account-plus-outline />
        </div>
        <h3>创建你的智能菜谱账号</h3>
      </section> -->

      <section class="login-hero">
        <div class="hero-icon">
          <icon-mdi-account-plus-outline />
        </div>
        <!-- <h1>智能菜谱</h1>
        <p>记录健康饮食，生成更懂你的每一餐</p> -->
        <h3>创建你的智能菜谱账号</h3>
      </section>

      <section class="auth-panel">
        <label class="field">
          <span class="field-icon"><icon-mdi-account-outline /></span>
          <input v-model="username" type="text" placeholder="设置用户名" />
        </label>

        <label class="field">
          <span class="field-icon"><icon-mdi-lock-outline /></span>
          <input v-model="password" type="password" placeholder="设置密码" />
        </label>

        <label class="field">
          <span class="field-icon"><icon-mdi-email-outline /></span>
          <input v-model="email" type="email" placeholder="输入邮箱" />
        </label>

        <label class="field">
          <span class="field-icon"><icon-mdi-shield-key-outline /></span>
          <input v-model="emailCode" type="text" placeholder="输入邮箱验证码" />
        </label>

        <button class="auth-button" type="button" :disabled="loading" @click="handleRegister">
          {{ loading ? '注册中...' : '注册' }}
        </button>

        <p v-if="message" class="message-text">{{ message }}</p>

        <div class="action-row">
          <button type="button" class="text-button" @click="router.push('/user/login')">返回登录</button>
          <button type="button" class="text-button" @click="router.push('/user/forgot-password')">
            修改密码
          </button>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.auth-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 22px;
  background-position: center;
  background-size: cover;
}

.auth-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0.88)),
    radial-gradient(circle at top, rgba(255, 143, 132, 0.24), transparent 58%);
  backdrop-filter: blur(3px);
}

.auth-shell {
  position: relative;
  z-index: 1;
  width: min(100%, 420px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
}

.auth-hero {
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

.auth-hero h3 {
  margin: 0;
  color: #5c3d36;
  font-size: 24px;
  font-weight: 800;
}

.auth-panel {
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

.auth-button {
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

.auth-button:disabled {
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
