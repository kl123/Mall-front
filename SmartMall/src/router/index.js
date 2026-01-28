// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";

// 导入需要路由跳转的组件（先创建两个测试组件，后面会说）
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Scan from "../views/Scan.vue";
import Target from "../views/Target.vue";
import Setting from "../views/Setting.vue";
import MainLayout from "../MainLayout.vue";
// 定义路由规则
const routes = [
  {
    path: "/", // 根路径
    name: "Login",
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
      {
        path: "target", // 目标路径
        name: "Target",
        component: Target,
      },
      {
        path: "setting", // 设置路径
        name: "Setting",
        component: Setting,
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
