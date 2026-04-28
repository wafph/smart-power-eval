import { createApp } from 'vue';
import { createPinia } from 'pinia';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import App from './App.vue';
import router from './router';
import { usePermissStore } from './store/permiss';
import 'element-plus/dist/index.css';
import './assets/css/icon.css';
import './assets/css/element-ui.css'; //
import './style.css';
import { useUserStore } from '@/store/useUserStore';

let app = createApp(App);
app.use(createPinia());
app.use(router);
const userStore = useUserStore();
// 注册elementplus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
// 自定义权限指令
const permiss = usePermissStore();
app.directive('permiss', {
  mounted(el, binding) {
    if (binding.value && !permiss.key.includes(String(binding.value))) {
      el['hidden'] = true;
    }
  },
});

if (window.__MICRO_APP_ENVIRONMENT__) {
  window.mount = () => {
    app = createApp(App);
    app.use(router);
    app.mount('#app');
  };
  const mainData = window.microApp.getGlobalData();
  if (mainData?.token) {
    userStore.setUserFromMain(mainData);
  }

  // ✅ 监听后续变化
  window.microApp.addGlobalDataListener((data) => {
    userStore.setUserFromMain(data);
  });

  // ✅ 监听主应用发送的路由变化
  window.microApp?.addDataListener((data) => {
    if (data.type === 'route-change') {
      console.log('收到路由变化:', data.path);
      router.push(data.path);
    }
  });

  window.unmount = () => {
    app?.unmount();
  };
}

// // 子应用 main.ts
// if (window.__MICRO_APP_ENVIRONMENT__) {
//    console.log('我在微前端环境中')
//   window.microApp.addGlobalDataListener((data: any) => {
//     console.log('收到主应用全局数据：', data);
//     // localStorage.setItem('token', data.token)
//   });
// }
