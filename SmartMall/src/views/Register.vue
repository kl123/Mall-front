<template>
  <div class="register-container">
    <!-- 页面内容 -->
    <div class="content">
      <!-- 欢迎标题 -->
      <h1 class="welcome-title">用户注册</h1>

      <!-- 注册表单 -->
      <form class="register-form" @submit.prevent="handleRegister">
        <!-- 用户名输入 -->
        <div class="form-group">
          <label for="username" class="input-label">用户名</label>
          <div class="input-wrapper">
            <input
              id="username"
              v-model="formData.username"
              type="text"
              placeholder="请输入用户名"
              class="form-input"
              required
            />
          </div>
        </div>

        <!-- 手机号码输入 -->
        <div class="form-group">
          <label for="phone" class="input-label">手机号码</label>
          <div class="input-wrapper">
            <input
              id="phone"
              v-model="formData.phone"
              type="tel"
              placeholder="请输入手机号码"
              class="form-input"
              required
            />
          </div>
        </div>

        <!-- 密码输入 -->
        <div class="form-group">
          <label for="password" class="input-label">密码</label>
          <div class="input-wrapper">
            <input
              id="password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入8-16位字母加数字密码"
              class="form-input"
              required
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? "隐藏" : "显示" }}
            </button>
          </div>
        </div>

        <!-- 确认密码输入 -->
        <div class="form-group">
          <label for="confirmPassword" class="input-label">确认密码</label>
          <div class="input-wrapper">
            <input
              id="confirmPassword"
              v-model="formData.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="请再次输入密码"
              class="form-input"
              required
            />
            <button
              type="button"
              class="password-toggle"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              {{ showConfirmPassword ? "隐藏" : "显示" }}
            </button>
          </div>
        </div>

        <!-- 验证码输入 -->
        <div class="form-group">
          <label for="code" class="input-label">验证码</label>
          <div class="input-wrapper">
            <input
              id="code"
              v-model="formData.code"
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
              {{ countdown > 0 ? `${countdown}秒后重试` : "获取验证码" }}
            </button>
          </div>
        </div>

        <!-- 协议同意 -->
        <div class="agreement">
          <label class="agreement-checkbox">
            <input
              v-model="formData.agreed"
              type="checkbox"
              class="checkbox-input"
            />
            <span class="checkmark"></span>
            点击阅读并同意
            <a href="#" @click.prevent="showAgreement('business')"
              >《业务开展协议》</a
            >
            和
            <a href="#" @click.prevent="showAgreement('privacy')"
              >《隐私协议》</a
            >
          </label>
        </div>

        <!-- 注册按钮 -->
        <button type="submit" class="register-button" :disabled="!isFormValid">
          注册
        </button>

        <!-- 跳转登录页面 -->
        <div class="login">
          <p>已有账号？<router-link to="/login">去登录</router-link></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// 响应式数据
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const countdown = ref(0);

// 表单数据
const formData = reactive({
  username: "",
  phone: "",
  password: "",
  confirmPassword: "",
  code: "",
  agreed: false,
});

// 表单验证
const isFormValid = computed(() => {
  return (
    formData.username &&
    formData.phone &&
    formData.password &&
    formData.confirmPassword &&
    formData.code &&
    formData.agreed
  );
});

// 发送验证码
const sendVerificationCode = () => {
  if (!formData.phone) {
    alert("请输入手机号码");
    return;
  }

  // 验证手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(formData.phone)) {
    alert("请输入正确的手机号码");
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

  // 模拟发送验证码
  console.log("发送验证码到:", formData.phone);
  setTimeout(() => {
    alert("验证码已发送到您的手机");
  }, 500);
};

// 处理注册
const handleRegister = () => {
  if (!formData.agreed) {
    alert("请先同意相关协议");
    return;
  }

  // 验证必填项
  if (
    !formData.username ||
    !formData.phone ||
    !formData.password ||
    !formData.confirmPassword ||
    !formData.code
  ) {
    alert("请填写所有必填项");
    return;
  }

  // 验证手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(formData.phone)) {
    alert("请输入正确的手机号码");
    return;
  }

  // 验证密码复杂度
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
  if (!passwordRegex.test(formData.password)) {
    alert("密码必须是8-16位的字母和数字组合");
    return;
  }

  // 验证密码一致性
  if (formData.password !== formData.confirmPassword) {
    alert("两次输入的密码不一致");
    return;
  }

  // 验证验证码格式
  if (formData.code.length !== 6) {
    alert("验证码必须是6位数字");
    return;
  }

  console.log("注册信息：", formData);

  // 模拟注册成功
  setTimeout(() => {
    alert("注册成功！请登录");
    router.push("/login");
  }, 500);
};

// 显示协议内容
const showAgreement = (type) => {
  const agreements = {
    business: "业务开展协议内容...",
    privacy: "隐私协议内容...",
  };
  alert(agreements[type]);
};
</script>

<style scoped>
/* 整体容器 */
.register-container {
  width: 100%;
  min-height: 100vh;
  background-color: #ffffff;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC",
    "Microsoft YaHei", sans-serif;
  display: flex;
  flex-direction: column;
}

/* 内容区域 */
.content {
  flex: 1;
  padding: 40px 24px 30px;
  display: flex;
  flex-direction: column;
}

/* 欢迎标题 */
.welcome-title {
  font-size: 28px;
  font-weight: 600;
  color: #000000;
  text-align: left;
  margin-bottom: 40px;
  line-height: 1.3;
}

/* 注册表单 */
.register-form {
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* 表单组 */
.form-group {
  margin-bottom: 24px;
}

.input-label {
  display: block;
  font-size: 16px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 8px;
  line-height: 1.4;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.form-input {
  width: 100%;
  height: 50px;
  padding: 12px 0; /* 左右为0 */
  border: none; /* 移除所有边框 */
  border-bottom: 1px solid #e0e0e0; /* 只保留底部边框 */
  border-radius: 0; /* 移除圆角 */
  font-size: 16px;
  color: #333333;
  background-color: #ffffff;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: none; /* 移除阴影效果 */
}

.form-input::placeholder {
  color: #999999;
  font-size: 16px;
}

/* 密码显示/隐藏按钮 */
.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #1890ff;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 0;
}

.password-toggle:hover {
  opacity: 0.8;
}

/* 获取验证码按钮 */
.get-code-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #1890ff;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 0;
  white-space: nowrap;
}

.get-code-btn:hover:not(:disabled) {
  opacity: 0.8;
}

.get-code-btn:disabled {
  color: #999999;
  cursor: not-allowed;
}

/* 协议同意 */
.agreement {
  margin: 20px 0 30px;
}

.agreement-checkbox {
  display: flex;
  align-items: flex-start;
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
  width: 18px;
  height: 18px;
  border: 1.5px solid #d9d9d9;
  border-radius: 3px;
  margin-right: 10px;
  position: relative;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all 0.2s;
}

.checkbox-input:checked + .checkmark {
  background-color: #1890ff;
  border-color: #1890ff;
}

.checkbox-input:checked + .checkmark::after {
  content: "";
  position: absolute;
  left: 5px;
  top: 2px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.agreement a {
  color: #1890ff;
  text-decoration: none;
  margin: 0 2px;
}

.agreement a:hover {
  text-decoration: underline;
}

/* 注册按钮 */
.register-button {
  width: 100%;
  height: 50px;
  background-color: #52c41a; /* 绿色，区别于登录按钮 */
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 24px;
}

.register-button:hover:not(:disabled) {
  background-color: #73d13d;
}

.register-button:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
  opacity: 0.7;
}

/* 跳转登录页面 */
.login {
  text-align: center;
  color: #666666;
  font-size: 14px;
}

.login p {
  margin: 0;
  padding: 12px 0;
}

.login a {
  color: #1890ff;
  text-decoration: none;
  margin-left: 5px;
}

.login a:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media screen and (max-width: 430px) {
  .content {
    padding: 40px 20px 30px;
  }

  .welcome-title {
    font-size: 26px;
    margin-bottom: 36px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-input {
    height: 48px;
    font-size: 15px;
  }

  .register-button {
    height: 48px;
  }
}

@media screen and (max-width: 375px) {
  .content {
    padding: 36px 16px 26px;
  }

  .welcome-title {
    font-size: 24px;
    margin-bottom: 32px;
  }

  .form-input {
    height: 46px;
  }

  .register-button {
    height: 46px;
  }
}

/* 横屏适配 */
@media screen and (orientation: landscape) and (max-height: 500px) {
  .content {
    padding-top: 20px;
    padding-bottom: 20px;
  }

  .welcome-title {
    margin-bottom: 24px;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .register-form {
    overflow-y: auto;
    max-height: 70vh;
  }
}
</style>
