import { defineStore } from 'pinia';

export const useSidebarStore = defineStore('sidebar', {
  state: () => {
    return {
      collapse: false,
      bgColor: localStorage.getItem('sidebar-bg-color') || '#f3fafa',
      textColor: localStorage.getItem('sidebar-text-color') || '#000000',
    };
  },
  getters: {},
  actions: {
    handleCollapse() {
      this.collapse = !this.collapse;
    },
    setBgColor(color: string) {
      this.bgColor = color;
      localStorage.setItem('sidebar-bg-color', color);
    },
    setTextColor(color: string) {
      this.textColor = color;
      localStorage.setItem('sidebar-text-color', color);
    },
  },
});
