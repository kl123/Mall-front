<template>
  <div class="login-container">
    <!-- 背景图区域 -->
    <div class="background-section">
      <!-- 打招呼 -->
      <div class="greeting">Hello!</div>

      <!-- 欢迎标题 -->
      <div class="welcome-section">
        <h1 class="welcome-title">欢迎登录智能购物商店</h1>
      </div>
    </div>

    <!-- 白色内容区域 -->
    <div class="content-wrapper">
      <!-- 登录方式切换 -->
      <div class="login-method-tabs">
        <button
          :class="['tab-btn', { active: loginMethod === 'code' }]"
          @click="loginMethod = 'code'"
        >
          快捷登录
        </button>
        <button
          :class="['tab-btn', { active: loginMethod === 'password' }]"
          @click="loginMethod = 'password'"
        >
          账号登录
        </button>
      </div>

      <!-- 登录表单区域（无卡片效果，与底部整体连接） -->
      <div class="form-area">
        <!-- 快捷登录表单 -->
        <form
          v-if="loginMethod === 'code'"
          class="login-form"
          @submit.prevent="handleCodeLogin"
        >
          <!-- 账号输入 -->
          <div class="form-group">
            <div class="input-wrapper">
              <input
                v-model="codeFormData.phone"
                type="tel"
                placeholder="请输入手机号"
                class="form-input"
                required
              />
            </div>
          </div>

          <!-- 验证码输入 -->
          <div class="form-group">
            <div class="input-wrapper">
              <input
                v-model="codeFormData.code"
                type="text"
                placeholder="请输入验证码"
                class="form-input"
                required
                maxlength="6"
              />
              <button
                type="button"
                class="get-code-btn"
                :disabled="countdown > 0"
                @click="sendVerificationCode"
              >
                {{ countdown > 0 ? `${countdown}秒后重试` : "发送验证码" }}
              </button>
            </div>
          </div>

          <!-- 登录按钮 -->
          <button
            type="submit"
            class="login-button"
            :disabled="
              !codeFormData.agreed || !codeFormData.phone || !codeFormData.code
            "
          >
            登录
          </button>

          <!-- 协议同意 -->
          <div class="agreement">
            <label class="agreement-checkbox">
              <input
                v-model="codeFormData.agreed"
                type="checkbox"
                class="checkbox-input"
              />
              <span class="checkmark"></span>
              我已阅读并同意
              <a href="#" @click.prevent="showAgreement('user')"
                >《用户协议》</a
              >
              和
              <a href="#" @click.prevent="showAgreement('privacy')"
                >《隐私协议》</a
              >
            </label>
          </div>

          <!-- 注册跳转 -->
          <div class="register-link">
            还没有账号？<a href="#" @click.prevent="goToRegister">立即注册</a>
          </div>
        </form>

        <!-- 账号登录表单 -->
        <form v-else class="login-form" @submit.prevent="handleLogin">
          <!-- 账号输入 -->
          <div class="form-group">
            <div class="input-wrapper">
              <input
                v-model="formData.phone"
                type="tel"
                placeholder="请输入账号"
                class="form-input"
                required
              />
            </div>
          </div>

          <!-- 密码输入 -->
          <div class="form-group">
            <div class="input-wrapper">
              <input
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                class="form-input"
                required
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
              ></button>
            </div>
          </div>

          <!-- 登录按钮 -->
          <button
            type="submit"
            class="login-button"
            :disabled="
              !formData.agreed || !formData.phone || !formData.password
            "
          >
            登录
          </button>

          <!-- 协议同意 -->
          <div class="agreement">
            <label class="agreement-checkbox">
              <input
                v-model="formData.agreed"
                type="checkbox"
                class="checkbox-input"
              />
              <span class="checkmark"></span>
              我已阅读并同意
              <a href="#" @click.prevent="showAgreement('user')"
                >《用户协议》</a
              >
              和
              <a href="#" @click.prevent="showAgreement('privacy')"
                >《隐私协议》</a
              >
            </label>
          </div>

          <!-- 注册跳转 -->
          <div class="register-link">
            还没有账号？<a href="#" @click.prevent="goToRegister">立即注册</a>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { Login } from "../api/user";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const userStore = useUserStore();

// 响应式数据
const loginMethod = ref("code"); // 默认显示快捷登录
const showPassword = ref(false);
const countdown = ref(0);

// 快捷登录表单数据
const codeFormData = reactive({
  phone: "",
  code: "",
  agreed: false,
});

// 账号登录表单数据
const formData = reactive({
  phone: "",
  password: "",
  agreed: false,
});

// 发送验证码
const sendVerificationCode = () => {
  if (!codeFormData.phone) {
    alert("请输入账号");
    return;
  }

  // 开始倒计时
  countdown.value = 60;
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);

  setTimeout(() => {
    alert("验证码已发送");
  }, 500);
};

// 处理快捷登录
const handleCodeLogin = () => {
  if (!codeFormData.agreed) {
    alert("请先同意相关协议");
    return;
  }

  if (!codeFormData.phone || !codeFormData.code) {
    alert("请填写账号和验证码");
    return;
  }

  // 快捷登录走本地模拟登录态，确保通过路由鉴权
  setTimeout(() => {
    const quickUserId = Number(codeFormData.phone.slice(-4)) || Date.now();
    userStore.setUser({
      id: quickUserId,
      name: "快捷用户",
      phoneNumber: codeFormData.phone,
    });
    alert("登录成功！");
    router.push("/main/home");
  }, 500);
};

// 处理账号登录
const handleLogin = async () => {
  if (!formData.agreed) {
    alert("请先同意相关协议");
    return;
  }
  if (!formData.phone || !formData.password) {
    alert("请填写账号和密码");
    return;
  }

  try {
    // 调用 API，注意传入的是 formData.phone 和 formData.password
    const response = await Login(formData.phone, formData.password);

    userStore.setUser({
      id: response.userId,
      name: response.username,
      phoneNumber: formData.phone,
    });

    alert("登录成功！");
    router.push("/main/home");
  } catch (error) {
    alert(error.message || "登录失败，请检查账号密码");
  }
};

// 显示协议内容
const showAgreement = (type) => {
  const agreements = {
    user: "用户协议内容...",
    privacy: "隐私协议内容...",
  };
  alert(agreements[type]);
};

// 跳转到注册页面
const goToRegister = () => {
  router.push("/register");
};
</script>

<style scoped>
/* 整体容器 */
.login-container {
  width: 100%;
  min-height: 100vh;
  background-color: #ffffff;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC",
    "Microsoft YaHei", sans-serif;
  display: flex;
  flex-direction: column;
}

/* 状态栏样式 */
.status-bar {
  height: 44px;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.time {
  font-size: 17px;
  font-weight: 600;
  color: #ffffff;
}

/* 背景图区域 */
.background-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 200px;
  padding: 60px 32px 40px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
}

/* 打招呼 */
.greeting {
  font-size: 38px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: -18px;
}

/* 欢迎标题 */
.welcome-section {
  margin-bottom: 20px;
}

.welcome-title {
  font-size: 28px;
  font-weight: 400;
  color: #ffffff;
  margin: 12;
  line-height: 1.4;
}

/* 白色内容区域 */
.content-wrapper {
  flex: 1;
  padding: 0 32px 30px;
  position: relative;
  z-index: 5;
  background-color: #ffffff;
  border-radius: 20px;
  margin-top: -30px;
}

/* 表单容器 - 整合切换和输入框 */
.form-container {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 0;
  margin-top: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* 登录方式切换标签 - 作为表单的一部分 */
.login-method-tabs {
  display: flex;
  background-color: #ffffff;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
  border-bottom: 1px solid #f0f0f0;
}

.tab-btn {
  flex: 1;
  padding: 20px 0;
  border: none;
  background: none;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  color: rgba(102, 102, 102, 0.7);
}

/* 鼠标悬停效果 */
.tab-btn:hover {
  color: rgba(102, 102, 102, 0.9);
}

/* 选中状态的样式 */
.tab-btn.active {
  color: #764ba2;
  font-weight: 600;
}

.tab-btn.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 20%;
  right: 20%;
  height: 3px;
  background: linear-gradient(to right, #667eea, #764ba2);
  border-radius: 2px;
}

/* 登录表单 */
.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding-top: 28px;
}

/* 表单组 */
.form-group {
  margin-bottom: 24px;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.form-input {
  width: 100%;
  height: 56px;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  color: #333333;
  background-color: #f9f9f9;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #764ba2;
  background-color: #ffffff;
}

.form-input::placeholder {
  color: #999999;
  font-size: 14px;
}

/* 密码显示/隐藏按钮 */
.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #764ba2;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
}

.password-toggle:hover {
  opacity: 0.8;
}

/* 获取验证码按钮 */
.get-code-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #764ba2;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  white-space: nowrap;
  border-radius: 4px;
}

.get-code-btn:hover:not(:disabled) {
  background-color: rgba(118, 75, 162, 0.1);
}

.get-code-btn:disabled {
  color: #999999;
  cursor: not-allowed;
}

/* 协议同意 */
.agreement {
  margin-top: 20px;
  margin-bottom: 30px;
  text-align: center;
}

.agreement-checkbox {
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  color: #666666;
  line-height: 1.4;
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  display: none;
}

.checkmark {
  width: 16px;
  height: 16px;
  border: 2px solid #d9d9d9;
  border-radius: 3px;
  margin-right: 8px;
  position: relative;
  flex-shrink: 0;
  transition: all 0.2s;
}

.checkbox-input:checked + .checkmark {
  background-color: #764ba2;
  border-color: #764ba2;
}

.checkbox-input:checked + .checkmark::after {
  content: "";
  position: absolute;
  left: 4px;
  top: 1px;
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.agreement a {
  color: #764ba2;
  text-decoration: none;
  margin: 0 2px;
}

.agreement a:hover {
  text-decoration: underline;
}

/* 登录按钮 */
.login-button {
  width: 100%;
  height: 56px;
  background: linear-gradient(to right, #667eea, #764ba2);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.3s;
}

.login-button:hover:not(:disabled) {
  opacity: 0.9;
}

.login-button:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
  opacity: 0.7;
}

/* 注册跳转链接 */
.register-link {
  text-align: center;
  font-size: 14px;
  color: #666666;
  margin-top: 20px;
}

.register-link a {
  color: #764ba2;
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
}

.register-link a:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media screen and (max-width: 430px) {
  .background-section {
    height: 180px;
    padding: 50px 24px 30px;
  }

  .greeting {
    font-size: 32px;
    margin-bottom: -15px;
  }

  .welcome-title {
    font-size: 22px;
  }

  .content-wrapper {
    padding: 0 24px 20px;
  }

  .form-container {
    margin-top: 16px;
  }

  .login-form {
    padding: 20px;
  }

  .tab-btn {
    padding: 18px 0;
  }
}

@media screen and (max-width: 375px) {
  .background-section {
    height: 160px;
    padding: 40px 20px 20px;
  }

  .greeting {
    font-size: 28px;
    margin-bottom: -12px;
  }

  .welcome-title {
    font-size: 20px;
  }

  .content-wrapper {
    padding: 0 20px 16px;
  }

  .form-container {
    margin-top: 12px;
  }

  .login-form {
    padding: 16px;
  }

  .tab-btn {
    padding: 16px 0;
    font-size: 15px;
  }

  .form-input {
    height: 52px;
  }

  .login-button {
    height: 52px;
  }
}
</style>
