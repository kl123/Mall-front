# 智慧购物（SmartMall）项目 AI 上下文说明

> **写给 AI 助手**：请仔细阅读本文档，理解项目结构、技术栈、数据流向和当前已知问题。在给出代码修改建议时，请保持风格一致，并优先使用项目现有的组件库和工具函数。

---

## 1. 项目概述

- **项目名称**：智慧购物 / SmartMall
- **项目类型**：移动端 H5 购物辅助应用
- **核心功能**：扫码识别商品、过敏源检测与提醒、个性化匹配度评分、价格趋势查看、消费数据仪表板、社区评论
- **当前开发阶段**：MVP 原型，用于参加全国大学生计算机设计大赛
- **开发团队**：两名大一学生，前端代码由 AI 辅助生成，后端使用 mock 服务

---

## 2. 技术栈

| 类别 | 技术 | 版本/说明 |
|:---|:---|:---|
| 前端框架 | Vue 3 | Composition API + `<script setup>` |
| 构建工具 | Vite | 最新版 |
| UI 组件库 | Element Plus | 全局引入 |
| 移动端适配 | 无专门库 | 手写 CSS 响应式 |
| 状态管理 | Pinia | 已引入但未完全统一使用 |
| 路由 | Vue Router 4 | 已配置路由守卫 |
| HTTP 请求 | Fetch API | 封装在 `src/utils/request.js` 和 `src/api/` 下 |
| 图表库 | ECharts 5 | 用于仪表板和价格趋势 |
| 扫码 | html5-qrcode | 摄像头扫码 + 手动输入 |
| 后端模拟 | json-server | 自定义中间件 `middleware.cjs` |
| 数据存储 | db.json | json-server 的数据库文件 |

---

## 3. 目录结构（当前实际结构）
SmartMall/
├── .vscode/ # VSCode 工作区配置
├── node_modules/ # 依赖包
├── public/ # 静态资源
├── .gitignore # Git 忽略文件
├── jsconfig.json # VSCode 路径别名配置（@ 指向 src）
├── README.md # 普通项目说明
├── README_AI.md # 本文件（给 AI 看的）
├── index.html # 入口 HTML
├── package.json # 项目依赖和脚本
├── vite.config.js # Vite 配置（含别名 @）
├── db.json # json-server 数据库
├── middleware.cjs # json-server 自定义中间件（/login, /scan）
├── json-server.json # json-server 配置文件
├── routes.json # 自定义路由映射
│
├── src/
│ ├── main.js # 应用入口，注册 Pinia、Router、ElementPlus
│ ├── App.vue # 根组件，包含 <router-view>
│ ├── MainLayout.vue # 主布局组件（底部导航栏 + 页面容器）
│ │
│ ├── api/ # 与后端通信的接口封装
│ │ ├── user.js # 登录、注册、获取用户信息
│ │ └── scan.js # 扫码接口（调用 /scan）
│ │
│ ├── stores/ # Pinia 状态管理
│ │ └── user.js # 用户信息、过敏源、饮食偏好
│ │
│ ├── router/
│ │ └── index.js # 路由配置（含路由守卫）
│ │
│ ├── utils/
│ │ └── request.js # 基于 fetch 的请求封装（统一处理错误和 BASE_URL）
│ │
│ ├── views/ # 页面组件（按功能划分）
│ │ ├── Login.vue # 登录页（手机号+密码/验证码）
│ │ ├── Register.vue # 注册页
│ │ ├── Dashboard.vue # 首页仪表板（扫描统计、图表、建议）
│ │ ├── Scan.vue # 扫描页（核心页面：摄像头/手动输入、过敏提醒、匹配度评分）
│ │ ├── ResultDetail.vue # 商品详情页（成分分析、价格趋势、评论）
│ │ ├── UserProfile.vue # 个人档案设置（过敏源、饮食偏好）
│ │ ├── ScanHistory.vue # 扫描历史记录页
│ │ ├── UserCenter.vue # 个人中心（入口菜单）
│ │ └── Community.vue # 社区评论页
│ │
│ ├── components/ # 公共组件（目前较少，可扩展）
│ └── assets/ # 静态资源（图片、样式等）

---

## 4. 核心数据流（重要！请仔细阅读）

### 4.1 用户登录与身份持久化

1. 用户在 `Login.vue` 输入手机号、密码，点击登录。
2. 调用 `api/user.js` 中的 `Login(phone, password)`，请求 `POST http://localhost:3000/login`。
3. `middleware.cjs` 拦截 `/login`，从 `db.json` 的 `users` 表中校验账号密码。
4. 登录成功返回 `{ success: true, userId, username }`。
5. 前端将 `userId` 和 `username` 存入 `localStorage`，并调用 Pinia `userStore.setUser()` 更新状态。
6. 后续需要用户身份时，优先从 Pinia 读取，降级从 `localStorage` 读取。

### 4.2 过敏源管理（核心业务）

- **设置入口**：`UserProfile.vue`（个人档案页）。
- **存储位置**：
  - 主要：Pinia `userStore.allergies`（响应式数组）
  - 备份：`localStorage.setItem('user_allergens', JSON.stringify(allergies))`
- **使用场景**：
  - `Scan.vue`：扫描时从 Pinia 读取过敏源，传给后端 `/scan` 接口进行匹配；同时在页面顶部展示当前过敏源标签。
  - `ResultDetail.vue`：详情页成分表中高亮过敏成分。
  - `Dashboard.vue`：根据过敏源生成个性化建议。

### 4.3 扫描商品流程（最复杂，请仔细看）

1. 用户在 `Scan.vue` 通过摄像头扫描条码，或手动输入条码。
2. 调用 `handleBarcode(barcode)` 函数：
   - 从 Pinia 或 `localStorage` 获取 `userId`。
   - 调用 `api/scan.js` 的 `scanBarcode(barcode, userId)` → `GET /scan?barcode=xxx&userId=xxx`。
3. `middleware.cjs` 拦截 `/scan`：
   - 从 `db.json` 的 `products` 表查找商品。
   - 从 `users` 表获取该用户的 `allergies`。
   - 计算过敏匹配成分 `matchedAllergens`。
   - 计算匹配度评分 `matchScore`（基础 80 分，含过敏 -40，健康关键词 +5）。
   - 返回增强后的商品对象，包含 `matchedAllergens`、`hasAllergen`、`matchScore`。
4. 前端接收数据后：
   - 赋值给 `product.value`。
   - 调用 `addToHistory` 存入扫描历史（`localStorage` 的 `smart_scan_history`）。
   - 停止摄像头扫描。
5. 页面展示：
   - 过敏提醒卡片（红色警告或绿色安全）。
   - 匹配度评分（进度条）。
   - 成分表（过敏成分标红）。
   - 价格趋势文字（未来将改为 ECharts 折线图）。

### 4.4 商品详情页数据获取

- 从路由参数获取 `barcode`。
- 目前 `ResultDetail.vue` 使用前端硬编码的 `MOCK_PRODUCTS` 对象，未接入后端 API。
- **待办**：改为从 `GET /products/{barcode}` 获取商品数据，从 `GET /comments?productId=xxx` 获取评论。

### 4.5 仪表板数据

- 目前 `Dashboard.vue` 使用写死的静态数据（`totalScans=42` 等）。
- **待办**：从后端 `scanHistory` 表计算真实统计数据。

---

## 5. 已知问题与待办事项（给 AI 的修改指引）

### 5.1 高优先级（影响核心功能演示）

- [ ] **扫描页价格趋势图未实现**：目前只显示文字（`📈 上涨 ¥39.9`），需改为 ECharts 小折线图（参照 `Dashboard.vue` 的写法）。数据从 `product.value.prices` 获取。
- [ ] **详情页未接入后端**：`ResultDetail.vue` 仍使用 Mock 数据，需改为请求 `http://localhost:3000/products/{barcode}`。
- [ ] **扫描历史未关联用户**：目前所有用户的扫描历史混在同一个 `smart_scan_history` 键下，应改为 `smart_scan_history_${userId}`。

### 5.2 中优先级（体验优化）

- [ ] **过敏源同步问题**：`Scan.vue` 和 `UserProfile.vue` 对过敏源的修改应完全通过 Pinia 同步，目前部分地方直接操作 `localStorage` 导致响应式失效。
- [ ] **登录页验证码功能为模拟**：`sendVerificationCode` 只是前端倒计时，未调用真实短信接口。
- [ ] **社区评论与商品详情页评论数据未打通**：目前 `Community.vue` 使用独立模拟数据，`ResultDetail.vue` 的评论也是独立模拟。

### 5.3 低优先级（比赛后可完善）

- [ ] 注册页的账号唯一性校验目前用前端数组模拟，应接入后端 `GET /users?username=xxx`。
- [ ] 全局引入移动端适配方案（如 postcss-px-to-viewport）或使用 Vant 组件库。
- [ ] 添加 PWA 支持（manifest.json + Service Worker）。

---

## 6. 后端服务启动方式

```bash
# 终端1：启动 mock 后端（端口 3000）
npm run server

# 终端2：启动前端开发服务器（端口 5173）
npm run dev

## 7. 给 AI 的提问模板（复制即用）
# 模板 A：新增功能
# text
# 请阅读项目根目录的 README_AI.md 了解项目结构。
# 现在我要在 Scan.vue 中新增一个功能：[描述功能]。
# 请给出需要修改的文件和具体代码，并说明新增代码的位置。
# 模板 B：修复 Bug
# text
# 请阅读项目根目录的 README_AI.md 了解项目结构。
# 当前运行 npm run dev 后出现以下错误：
# [粘贴完整报错日志]
# 请帮我定位问题并给出修复代码。
# 模板 C：代码优化/重构
# text
# 请阅读项目根目录的 README_AI.md 了解项目结构。
# 当前 [文件名] 中的 [功能模块] 实现较为混乱，请帮我重构为更清晰的写法，并保持原有功能不变。


## 8. 代码风格约定（请遵守）
# 使用 Vue 3 <script setup> 语法，避免选项式 API。

# 导入 Element Plus 图标时使用按需导入方式：import { Camera, Warning } from '@element-plus/icons-vue'。

# API 请求统一放在 src/api/ 目录下，使用 fetch 或 src/utils/request.js 中封装的 request 函数。

# 新增 Pinia store 时，采用组合式写法（defineStore 配合 ref/computed）。

# 注释使用中文，便于团队成员理解

## 9. 当前数据库（db.json）示例片段
# {
#   "users": [
#     {
#       "id": 1,
#       "phone": "13800138000",
#       "password": "123456",
#       "username": "测试用户",
#       "allergies": ["花生", "虾"],
#       "dietPreferences": ["低糖"]
#     }
#   ],
#   "products": [
#     {
#       "id": "6901234567892",
#       "name": "每日坚果",
#       "image": "🌰",
#       "category": "零食",
#       "ingredients": ["杏仁", "核桃", "花生", "蔓越莓"],
#       "prices": [
#         { "date": "2025-04-01", "price": 39.9 },
#         { "date": "2025-04-08", "price": 42.9 },
#         { "date": "2025-04-15", "price": 39.9 }
#       ]
#     }
#   ],
#   "scanHistory": [],
#   "comments": []
# }