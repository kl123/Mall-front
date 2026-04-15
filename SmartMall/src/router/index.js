import { createRouter, createWebHistory } from "vue-router";
import MainLayout from "../MainLayout.vue";
import { useUserStore } from "@/stores/user";

const routes = [
  {
    path: "/",
    redirect: "/login",
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
    redirect: "/main/home",
  },
  {
    path: "/scan",
    redirect: "/main/scan",
  },
  {
    path: "/community",
    redirect: "/main/community",
  },
  {
    path: "/user",
    redirect: "/main/user",
  },
  {
    path: "/main",
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "home",
        name: "Dashboard",
        component: () => import("../views/Dashboard.vue"),
      },
      {
        path: "scan",
        name: "Scan",
        component: () => import("../views/Scan.vue"),
      },
      {
        path: "community",
        name: "Community",
        component: () => import("../views/Community.vue"),
      },
      {
        path: "user",
        name: "UserCenter",
        component: () => import("../views/UserCenter.vue"),
      },
    ],
  },
  {
    path: "/profile",
    name: "UserProfile",
    component: () => import("../views/UserProfile.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/scan-history",
    alias: "/scanhistory",
    name: "ScanHistory",
    component: () => import("../views/ScanHistory.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/result/:barcode",
    alias: "/resultdetail/:barcode",
    name: "ResultDetail",
    component: () => import("../views/ResultDetail.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  const userStore = useUserStore();
  userStore.hydrateFromStorage();
  const isLoggedIn = Boolean(userStore.userId);

  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: "Login" };
  }
  if (isLoggedIn && (to.name === "Login" || to.name === "Register")) {
    return { name: "Dashboard" };
  }
  return true;
});

export default router;
