<template>
  <div class="register-container">
    <!-- 背景图区域 -->
    <div class="background-section">
      <!-- 打招呼 -->
      <div class="greeting">Hello!</div>

      <!-- 欢迎标题 -->
      <div class="welcome-section">
        <h1 class="welcome-title">欢迎注册智能购物商店</h1>
      </div>
    </div>

    <!-- 白色内容区域 -->
    <div class="content-wrapper">
      <!-- 注册表单区域 -->
      <div class="form-area">
        <form class="register-form" @submit.prevent="handleRegister">
          <!-- 账号输入 -->
          <div class="form-group">
            <div class="input-wrapper">
              <input
                v-model="registerForm.username"
                type="text"
                placeholder="请输入账号（4-16位字母、数字或下划线）"
                class="form-input"
                :class="{ error: usernameError }"
                required
                @input="checkUsernameAvailability"
                @blur="validateUsername"
              />
              <div v-if="usernameError" class="error-message">
                {{ usernameError }}
              </div>
              <div v-if="usernameValidating" class="validating-message">
                正在验证账号...
              </div>
              <div
                v-if="usernameAvailable && !usernameError"
                class="success-message"
              >
                ✓ 账号可用
              </div>
            </div>
          </div>

          <!-- 手机号输入 -->
          <div class="form-group">
            <div class="input-wrapper">
              <input
                v-model="registerForm.phone"
                type="tel"
                placeholder="请输入手机号"
                class="form-input"
                :class="{ error: phoneError }"
                required
                @blur="validatePhone"
              />
              <div v-if="phoneError" class="error-message">
                {{ phoneError }}
              </div>
            </div>
          </div>

          <!-- 验证码输入 -->
          <div class="form-group">
            <div class="input-wrapper">
              <input
                v-model="registerForm.code"
                type="text"
                placeholder="请输入验证码"
                class="form-input"
                :class="{ error: codeError }"
                required
                maxlength="6"
                @blur="validateCode"
              />
              <button
                type="button"
                class="get-code-btn"
                :disabled="countdown > 0 || phoneError || !registerForm.phone"
                @click="sendVerificationCode"
              >
                {{ countdown > 0 ? `${countdown}秒后重试` : "获取验证码" }}
              </button>
              <div v-if="codeError" class="error-message">
                {{ codeError }}
              </div>
            </div>
          </div>

          <!-- 密码输入（第一遍） -->
          <div class="form-group">
            <div class="input-wrapper">
              <input
                v-model="registerForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请设置8-16位密码（字母+数字）"
                class="form-input"
                :class="{ error: passwordError }"
                required
                @focus="showPasswordToggle = true"
                @blur="handlePasswordBlur"
              />
              <button
                v-if="showPasswordToggle || showPassword"
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
              ></button>
              <div v-if="passwordError" class="error-message">
                {{ passwordError }}
              </div>
            </div>
          </div>

          <!-- 确认密码输入（第二遍） -->
          <div class="form-group">
            <div class="input-wrapper">
              <input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                class="form-input"
                :class="{ error: confirmPasswordError }"
                required
                @blur="validateConfirmPassword"
              />
              <div v-if="confirmPasswordError" class="error-message">
                {{ confirmPasswordError }}
              </div>
            </div>
          </div>

          <!-- 协议同意 -->
          <div class="agreement">
            <label class="agreement-checkbox">
              <input
                v-model="registerForm.agreed"
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
            <div v-if="agreementError" class="error-message">
              {{ agreementError }}
            </div>
          </div>

          <!-- 注册按钮 -->
          <button
            type="submit"
            class="register-button"
            :disabled="!canRegister"
          >
            注册
          </button>

          <!-- 跳转登录 -->
          <div class="login-link">
            已有账号？<a href="#" @click.prevent="goToLogin">立即登录</a>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// 响应式数据
const showPassword = ref(false);
const showPasswordToggle = ref(false);
const countdown = ref(0);

// 错误信息
const usernameError = ref("");
const phoneError = ref("");
const codeError = ref("");
const passwordError = ref("");
const confirmPasswordError = ref("");
const agreementError = ref("");
const usernameValidating = ref(false);
const usernameAvailable = ref(false);

// 模拟已存在的账号
const existingUsernames = ["admin", "test", "user123", "demo", "hello"];

// 注册表单数据
const registerForm = reactive({
  username: "",
  phone: "",
  code: "",
  password: "",
  confirmPassword: "",
  agreed: false,
});

// 监听用户名变化
let usernameTimeout;
watch(
  () => registerForm.username,
  (newUsername) => {
    if (usernameError.value) usernameError.value = "";
    usernameAvailable.value = false;

    // 清除之前的定时器
    if (usernameTimeout) clearTimeout(usernameTimeout);

    // 输入内容时才进行验证
    if (newUsername && newUsername.length >= 4) {
      usernameValidating.value = true;

      // 防抖处理，延迟验证
      usernameTimeout = setTimeout(() => {
        checkUsernameAvailability();
      }, 500);
    } else {
      usernameValidating.value = false;
    }
  },
);

// 检查账号可用性
const checkUsernameAvailability = () => {
  if (!registerForm.username) {
    usernameValidating.value = false;
    return;
  }

  // 格式验证
  const usernameRegex = /^[a-zA-Z0-9_]{4,16}$/;
  if (!usernameRegex.test(registerForm.username)) {
    usernameError.value = "账号必须是4-16位的字母、数字或下划线";
    usernameValidating.value = false;
    usernameAvailable.value = false;
    return;
  }

  // 模拟异步检查账号是否已存在
  setTimeout(() => {
    usernameValidating.value = false;

    if (existingUsernames.includes(registerForm.username)) {
      usernameError.value = "该账号已被注册";
      usernameAvailable.value = false;
    } else {
      usernameError.value = "";
      usernameAvailable.value = true;
    }
  }, 300);
};

// 验证账号
const validateUsername = () => {
  if (!registerForm.username) {
    usernameError.value = "请输入账号";
    usernameAvailable.value = false;
    return false;
  }

  // 账号格式验证
  const usernameRegex = /^[a-zA-Z0-9_]{4,16}$/;
  if (!usernameRegex.test(registerForm.username)) {
    usernameError.value = "账号必须是4-16位的字母、数字或下划线";
    usernameAvailable.value = false;
    return false;
  }

  // 检查是否已存在
  if (existingUsernames.includes(registerForm.username)) {
    usernameError.value = "该账号已被注册";
    usernameAvailable.value = false;
    return false;
  }

  usernameError.value = "";
  usernameAvailable.value = true;
  return true;
};

// 验证手机号
const validatePhone = () => {
  if (!registerForm.phone) {
    phoneError.value = "请输入手机号";
    return false;
  }

  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(registerForm.phone)) {
    phoneError.value = "请输入正确的手机号码";
    return false;
  }

  phoneError.value = "";
  return true;
};

// 验证验证码
const validateCode = () => {
  if (!registerForm.code) {
    codeError.value = "请输入验证码";
    return false;
  }

  if (registerForm.code.length !== 6) {
    codeError.value = "验证码必须是6位数字";
    return false;
  }

  codeError.value = "";
  return true;
};

// 验证密码
const validatePassword = () => {
  if (!registerForm.password) {
    passwordError.value = "请输入密码";
    return false;
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
  if (!passwordRegex.test(registerForm.password)) {
    passwordError.value = "密码必须是8-16位的字母和数字组合";
    return false;
  }

  passwordError.value = "";
  return true;
};

// 验证确认密码
const validateConfirmPassword = () => {
  if (!registerForm.confirmPassword) {
    confirmPasswordError.value = "请再次输入密码";
    return false;
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    confirmPasswordError.value = "两次输入的密码不一致";
    return false;
  }

  confirmPasswordError.value = "";
  return true;
};

// 验证协议
const validateAgreement = () => {
  if (!registerForm.agreed) {
    agreementError.value = "请同意相关协议";
    return false;
  }

  agreementError.value = "";
  return true;
};

// 计算属性：检查是否可以注册
const canRegister = computed(() => {
  return (
    registerForm.username &&
    registerForm.phone &&
    registerForm.code &&
    registerForm.password &&
    registerForm.confirmPassword &&
    registerForm.agreed &&
    registerForm.password === registerForm.confirmPassword &&
    usernameAvailable.value &&
    !usernameError.value &&
    !phoneError.value &&
    !codeError.value &&
    !passwordError.value &&
    !confirmPasswordError.value
  );
});

// 发送验证码
const sendVerificationCode = () => {
  // 先验证手机号格式
  if (!validatePhone()) {
    return;
  }

  // 模拟检查手机号是否已注册
  const registeredPhones = ["13800138000", "13900139000"];
  if (registeredPhones.includes(registerForm.phone)) {
    phoneError.value = "该手机号已注册";
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

  // 模拟返回的验证码（实际开发中应通过后端发送）
  const mockCode = "123456";
  setTimeout(() => {
    alert(`验证码已发送到您的手机，测试验证码为: ${mockCode}`);
  }, 500);
};

// 处理密码输入框失去焦点
const handlePasswordBlur = () => {
  if (!registerForm.password) {
    showPasswordToggle.value = false;
    showPassword.value = false;
  }
  validatePassword();
};

// 处理注册
const handleRegister = () => {
  // 验证所有字段
  const isUsernameValid = validateUsername();
  const isPhoneValid = validatePhone();
  const isCodeValid = validateCode();
  const isPasswordValid = validatePassword();
  const isConfirmPasswordValid = validateConfirmPassword();
  const isAgreementValid = validateAgreement();

  if (
    !isUsernameValid ||
    !isPhoneValid ||
    !isCodeValid ||
    !isPasswordValid ||
    !isConfirmPasswordValid ||
    !isAgreementValid
  ) {
    return;
  }

  // 模拟检查验证码是否正确
  const correctCode = "123456";
  if (registerForm.code !== correctCode) {
    codeError.value = "验证码错误";
    return;
  }

  // 模拟注册成功
  setTimeout(() => {
    alert("注册成功！");
    router.push("/login");
  }, 500);
};

// 显示协议内容
const showAgreement = (type) => {
  const agreements = {
    user: "用户协议：\n\n1. 用户需遵守国家法律法规\n2. 不得发布违法信息\n3. 保护个人隐私安全\n4. 接受平台管理规则\n5. 对账号行为负责",
    privacy:
      "隐私协议：\n\n1. 收集必要个人信息\n2. 保护用户隐私数据\n3. 不泄露用户信息给第三方\n4. 用户有权查询、修改个人信息\n5. 符合相关法律法规要求",
  };
  alert(agreements[type]);
};

// 跳转到登录页面
const goToLogin = () => {
  router.push("/login");
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

/* 表单区域 */
.form-area {
  background-color: #ffffff;
  padding: 24px 0 40px;
  margin-top: 20px;
}

/* 注册表单 */
.register-form {
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* 表单组 */
.form-group {
  margin-bottom: 20px;
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
  margin-top: 24px;
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

/* 注册按钮 */
.register-button {
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

.register-button:hover:not(:disabled) {
  opacity: 0.9;
}

.register-button:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
  opacity: 0.7;
}

/* 跳转登录链接 */
.login-link {
  text-align: center;
  font-size: 14px;
  color: #666666;
  margin-top: 20px;
}

.login-link a {
  color: #764ba2;
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
}

.login-link a:hover {
  text-decoration: underline;
}

/* 错误提示样式 - 增强 */
.error-message {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
  min-height: 16px;
}

/* 成功提示样式 */
.success-message {
  color: #52c41a;
  font-size: 12px;
  margin-top: 4px;
  min-height: 16px;
}

/* 验证中提示样式 */
.validating-message {
  color: #1890ff;
  font-size: 12px;
  margin-top: 4px;
  min-height: 16px;
}

/* 输入框错误状态 */
.form-input.error {
  border-color: #ff4d4f;
}

/* 输入框成功状态 */
.form-input.success {
  border-color: #52c41a;
}

/* 获取验证码按钮禁用样式 */
.get-code-btn:disabled {
  color: #999999;
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

/* 注册按钮状态 */
.register-button:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
  opacity: 0.7;
}

.register-button:not(:disabled):hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(118, 75, 162, 0.3);
}

/* 协议错误提示 */
.agreement .error-message {
  margin-top: 8px;
  text-align: center;
}

/* 响应式设计 */
@media screen and (max-width: 430px) {
  .error-message,
  .success-message,
  .validating-message {
    font-size: 11px;
  }
}

@media screen and (max-width: 375px) {
  .error-message,
  .success-message,
  .validating-message {
    font-size: 10px;
  }
}
</style>
