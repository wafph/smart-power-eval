import { defineStore } from 'pinia';

interface ObjectList {
  [key: string]: string[];
}

export const usePermissStore = defineStore('permiss', {
  state: () => {
    const defaultList: ObjectList = {
      admin: ['1', '2', '3', '4', '5' ],
      user: ['1', '2', '3', '4', '5'],
    };
    const username = localStorage.getItem('vuems_name');
    return {
      key: (username == 'admin' ? defaultList.admin : defaultList.user) as string[],
      defaultList,
    };
  },
  actions: {
    handleSet(val: string[]) {
      this.key = val;
    },
  },
});
