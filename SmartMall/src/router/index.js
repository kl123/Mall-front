// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";

// 导入需要路由跳转的组件（先创建两个测试组件，后面会说）
import MainLayout from "../MainLayout.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Home from "../views/Home.vue";
import Scan from "../views/Scan.vue";
import Community from "../views/Community.vue";
import Setting from "../views/Setting.vue";
import User from "../views/User.vue";
// import Target from "../views/Target.vue";
import ResultDetail from "../views/ResultDetail.vue";

// 定义路由规则
const routes = [
  {
    path: "/", // 根路径
    // name: "Login",
    name: "Root",
    component: Login,
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/Login.vue"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../views/Register.vue"),
  },
  {
    path: "/home",
    name: "Home",
    component: () => import("../views/Home.vue"),
  },
  {
    path: "/scan",
    name: "Scan",
    component: () => import("../views/Scan.vue"),
  },
  {
    path: "/community",
    name: "Community",
    component: () => import("../views/Community.vue"),
  },
  {
    path: "/user",
    name: "User",
    component: () => import("../views/User.vue"),
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("../views/Profile.vue"),
  },
  {
    path: "/resultdetail",
    name: "ResultDetail",
    component: () => import("../views/ResultDetail.vue"),
  },

  {
    path: "/main", // 首页路径
    name: "MainLayout",
    component: MainLayout,
    children: [
      {
        path: "home", // 首页路径
        name: "Home",
        component: Home,
      },
      {
        path: "scan", // 扫描路径
        name: "Scan",
        component: Scan,
      },
      // {
      //   path: "target", // 目标路径
      //   name: "Target",
      //   component: Target,
      // },
      {
        path: "community", // 目标路径
        name: "Community",
        component: Community,
      },
      {
        path: "user", // 设置路径
        name: "User",
        component: User,
      },
    ],
  },
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // 路由模式（HTML5 History）
  routes,
});

export default router;
