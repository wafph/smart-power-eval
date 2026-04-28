// src/stores/useUserStore.ts
import { defineStore } from 'pinia'
import type { GlobalData, UserInfo } from '@/types/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userInfo: null as UserInfo | null,
  }),

  getters: {
    isLogin(): boolean {
      return !!this.token
    },
    roles(): string[] {
      return this.userInfo?.roleCodeList || []
    },
  },

  actions: {
    setUserFromMain(data: GlobalData) {
      this.token = data.token
      this.userInfo = data.userInfo
      // 本地兜底（刷新不丢）
      localStorage.setItem('token', data.token)
      localStorage.setItem('userInfo', JSON.stringify(data.userInfo))
    },

    // // ✅ 非微前端环境 mock
    // initLocalMock() {
    //   const token = localStorage.getItem('token')
    //   const userInfo = localStorage.getItem('userInfo')

    //   if (token && userInfo) {
    //     this.token = token
    //     this.userInfo = JSON.parse(userInfo)
    //   }
    // },
  },
})