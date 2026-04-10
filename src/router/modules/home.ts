const { VITE_HIDE_HOME } = import.meta.env;
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/",
  name: "Home",
  component: Layout,
  redirect: "/welcome",
  meta: {
    icon: "ep/home-filled",
    title: "首页",
    rank: 0
  },
  children: [
    {
      path: "/welcome",
      name: "Welcome",
      component: () => import("@/views/welcome/index.vue"),
      meta: {
        title: "首页",
        showLink: VITE_HIDE_HOME === "true" ? false : true
      }
    },
    {
      path: "/models",
      name: "Models",
      component: () => import("@/views/models/index.vue"),
      meta: {
        title: "模型列表",
        showLink: true
      }
    },
    {
      path: "/user",
      name: "User",
      component: () => import("@/views/user/index.vue"),
      meta: {
        title: "用户管理",
        showLink: true
      }
    },
    {
      path: "/usage",
      name: "Usage",
      component: () => import("@/views/usage/index.vue"),
      meta: {
        title: "用量统计",
        showLink: true
      }
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      component: () => import("@/views/dashboard/index.vue"),
      meta: {
        title: "仪表盘",
        showLink: true
      }
    }
  ]
} satisfies RouteConfigsTable;
