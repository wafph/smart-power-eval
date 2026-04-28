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
  console.log(mainData);
  const { token, userInfo } = mainData;
  console.log(JSON.parse(userInfo));
  const a = JSON.parse(userInfo);
  const { account, avatar, name, roleCodeList } = a;
  console.log(account);
  console.log(avatar);
  console.log(name);
  console.log(roleCodeList);
  localStorage.setItem('vuems_name', name || 'testuser');
});
</script>

<style></style>
