import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Personal from "../views/personal.vue";
import Quiz from "../views/quiz.vue";
import Done from "../views/done.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: Login },
  { path: "/personal", component: Personal },
  { path: "/quiz", component: Quiz },
  { path: "/done", component: Done },
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});
