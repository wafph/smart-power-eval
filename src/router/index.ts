import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import { usePermissStore } from '../store/permiss';
import Home from '../views/Home.vue';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

const routes: RouteRecordRaw[] = [
  {
    path: '',
    redirect: 'login',
  },
  {
    path: '/',
    redirect: '/scenarios-datasets',
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    children: [
      {
        path: '/scenarios-datasets',
        meta: {
          title: '业务场景与数据集',
          noAuth: true,
        },
        component: () =>
          import(/* webpackChunkName: "login" */ '../views/ScenariosDatasets.vue'),
      },
      {
        path: '/model-management',
        meta: {
          title: '模型管理',
          noAuth: true,
        },
        component: () =>
          import(/* webpackChunkName: "login" */ '../views/ModelManagement.vue'),
      },
      {
        path: '/evaluation-metrics',
        meta: {
          title: '评测指标管理',
          noAuth: true,
        },
        component: () =>
          import(/* webpackChunkName: "login" */ '../views/EvaluationMetrics.vue'),
      },
      {
        path: '/evaluation-task',
        meta: {
          title: '评测任务管理',
          noAuth: true,
        },
        component: () =>
          import(/* webpackChunkName: "login" */ '../views/EvaluationTask.vue'),
      },
      {
        path: '/create-evaluation-task',
        meta: {
          title: '新建评测任务',
          noAuth: true,
        },
        component: () =>
          import(/* webpackChunkName: "login" */ '../views/CreateEvaluationTask.vue'),
      },
      {
        path: '/evaluation-report',
        meta: {
          title: '评估报告管理',
          noAuth: true,
        },
        component: () =>
          import(/* webpackChunkName: "login" */ '../views/EvaluationReport.vue'),
      },
       {
        path: '/evaluation-logs',
        meta: {
          title: '评估报告管理',
          noAuth: true,
        },
        component: () =>
          import(/* webpackChunkName: "login" */ '../views/EvaluationLogs.vue'),
      },
    ],
  },
  {
    path: '/login',
    meta: {
      title: '登录',
      noAuth: true,
    },
    component: () => import(/* webpackChunkName: "login" */ '../views/pages/Login.vue'),
  },
  {
    path: '/403',
    meta: {
      title: '没有权限',
      noAuth: true,
    },
    component: () => import(/* webpackChunkName: "403" */ '../views/pages/403.vue'),
  },
  {
    path: '/404',
    meta: {
      title: '找不到页面',
      noAuth: true,
    },
    component: () => import(/* webpackChunkName: "404" */ '../views/pages/404.vue'),
  },
  { path: '/:path(.*)', redirect: '/404' },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  NProgress.start();
  const role = localStorage.getItem('vuems_name');
  const permiss = usePermissStore();

  if (!role && to.meta.noAuth !== true) {
    next('/login');
  } else if (
    typeof to.meta.permiss == 'string' &&
    !permiss.key.includes(to.meta.permiss)
  ) {
    // 如果没有权限，则进入403
    next('/403');
  } else {
    next();
  }
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
