<script setup lang="ts">
import { showToast } from '@nutui/nutui'
import { onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { forgotPassword, sendEmailCode } from '../../api/auth'
import backgroundImage from '../../assets/img/background1.png'

defineOptions({
  name: 'ForgotPassword',
})

const router = useRouter()
const email = ref('')
const verifyCode = ref('')
const password = ref('')
const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)
const message = ref('')
let countdownTimer: number | undefined

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function startCountdown() {
  countdown.value = 60

  countdownTimer = window.setInterval(() => {
    if (countdown.value <= 1) {
      countdown.value = 0

      if (countdownTimer) {
        window.clearInterval(countdownTimer)
        countdownTimer = undefined
      }

      return
    }

    countdown.value -= 1
  }, 1000)
}

async function handleSendEmailCode() {
  if (!email.value) {
    message.value = '请先输入邮箱'
    showToast.text('请先输入邮箱')
    return
  }

  if (!isValidEmail(email.value)) {
    message.value = '请输入正确的邮箱地址'
    showToast.text('请输入正确的邮箱地址')
    return
  }

  if (sendingCode.value || countdown.value > 0) {
    return
  }

  sendingCode.value = true
  message.value = ''

  try {
    await sendEmailCode({
      email: email.value.trim(),
    })

    message.value = '验证码已发送，请注意查收邮箱'
    showToast.success('验证码已发送')
    startCountdown()
  } catch (error) {
    message.value = error instanceof Error ? error.message : '验证码发送失败，请稍后再试'
  } finally {
    sendingCode.value = false
  }
}

async function handleReset() {
  if (!email.value || !verifyCode.value || !password.value) {
    message.value = '请完整填写邮箱、验证码和新密码'
    return
  }

  if (!isValidEmail(email.value)) {
    message.value = '请输入正确的邮箱地址'
    return
  }

  loading.value = true
  message.value = ''

  try {
    await forgotPassword({
      email: email.value.trim(),
      verifyCode: verifyCode.value.trim(),
      password: password.value,
    })

    message.value = '密码修改成功，请使用新密码登录'
    showToast.success('密码修改成功')
    router.push('/user/login')
  } catch (error) {
    message.value = error instanceof Error ? error.message : '密码修改失败，请稍后再试'
  } finally {
    loading.value = false
  }
}

onBeforeUnmount(() => {
  if (countdownTimer) {
    window.clearInterval(countdownTimer)
  }
})
</script>

<template>
  <section class="auth-page" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <div class="auth-overlay" />

    <div class="auth-shell">
      <!-- <section class="auth-hero">
        <div class="hero-icon">
          <icon-mdi-lock-reset />
        </div>
        <h3>找回你的账号密码</h3>
      </section> -->

      <section class="login-hero">
        <div class="hero-icon">
          <icon-mdi-lock-reset />
        </div>
        <h3>找回你的账号密码</h3>
      </section>

      <section class="auth-panel">

        <label class="field">
          <span class="field-icon"><icon-mdi-email-outline /></span>
          <input v-model="email" type="email" placeholder="请输入邮箱" />
        </label>
        

        <label class="field field-code">
          <span class="field-icon"><icon-mdi-shield-key-outline /></span>
          <input v-model="verifyCode" type="text" placeholder="请输入验证码" />
          <button
            class="code-button"
            type="button"
            :disabled="sendingCode || countdown > 0"
            @click="handleSendEmailCode"
          >
            {{ sendingCode ? '发送中...' : countdown > 0 ? `${countdown}s后重发` : '发送验证码' }}
          </button>
        </label>

        <label class="field">
          <span class="field-icon"><icon-mdi-lock-outline /></span>
          <input v-model="password" type="password" placeholder="请输入新密码" />
        </label>

        <button class="auth-button" type="button" :disabled="loading" @click="handleReset">
          {{ loading ? '提交中...' : '修改密码' }}
        </button>

        <p v-if="message" class="message-text">{{ message }}</p>

        <div class="action-row">
          <button type="button" class="text-button" @click="router.push('/user/login')">返回登录</button>
          <button type="button" class="text-button" @click="router.push('/user/register')">前往注册</button>
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

.field-code {
  gap: 10px;
}

.code-button {
  flex-shrink: 0;
  min-width: 92px;
  height: 34px;
  padding: 0 10px;
  color: rgb(255, 143, 132);
  font-size: 12px;
  font-weight: 700;
  background: rgba(255, 143, 132, 0.12);
  border: none;
  border-radius: 12px;
}

.code-button:disabled,
.auth-button:disabled {
  opacity: 0.72;
}

.code-button:disabled {
  color: #b79f99;
  background: rgba(183, 159, 153, 0.16);
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
