<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>
<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import { ElConfigProvider } from 'element-plus';
import { onMounted } from 'vue';
onMounted(() => {
  let mainData = window.microApp.getGlobalData();
  const { token, userInfo } = mainData;
  const a = JSON.parse(userInfo);
  const { name } = a;
  localStorage.setItem('vuems_name', name || 'testuser');
});
</script>

<style></style>
