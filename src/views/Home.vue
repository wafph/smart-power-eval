<template>
  <div class="wrapper">
    <Tabs />
    <div class="content">
      <router-view v-slot="{ Component }">
        <transition name="move" mode="out-in">
          <keep-alive :include="tabs.nameList">
            <component :is="Component"></component>
          </keep-alive>
        </transition>
      </router-view>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useSidebarStore } from '@/store/sidebar';
import { useTabsStore } from '@/store/tabs';
const sidebar = useSidebarStore();
const tabs = useTabsStore();
</script>

<style>
.wrapper {
  height: 100vh;
  overflow: hidden;
}

.content {
  width: auto;
  padding-bottom: 0;
  overflow-y: scroll;
  box-sizing: border-box;
  margin: 20px;
  background: #ffffff;
  border-radius: 8px;
  height: calc(100vh - 142px);
}

.content::-webkit-scrollbar {
  width: 0;
}

.content-collapse {
  left: 65px;
}
</style>
