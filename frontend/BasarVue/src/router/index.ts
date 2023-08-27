import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import BasarOverview from "../views/BasarOverview.vue";
import Basar from "../views/Basar.vue";
import Eintippen from "../views/Eintippen.vue";
import Login from "../views/Login.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "login",
      component: Login,
    },
    {
      path: "/basare",
      name: "basarOverview",
      component: BasarOverview,
    },
    {
      path: "/basar/:id/",
      name: "basar",
      component: Basar,
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      //component: () => import("../views/AboutView.vue"),
    },
    {
      path: "/basar/:id/eintragen",
      name: "eintragen",
      component: Eintippen,
    },
  ],
});

export default router;
