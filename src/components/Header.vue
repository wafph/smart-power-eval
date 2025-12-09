<template>
  <div class="header">
    <!-- 折叠按钮 -->
    <div class="header-left">
        <p>电力人工智能模型应用评估系统</p>
      <div class="collapse-btn" @click="collapseChage">
        <el-icon v-if="sidebar.collapse">
          <Expand />
        </el-icon>
        <el-icon v-else>
          <Fold />
        </el-icon>
      </div>
    </div>
    <!-- <p>电力人工智能模型应用评估系统</p> -->
    <div class="header-right">
      <div class="header-user-con">
        <div class="btn-icon" @click="setFullScreen">
          <el-tooltip effect="dark" content="全屏" placement="bottom">
            <i class="el-icon-lx-full"></i>
          </el-tooltip>
        </div>
        <!-- 用户头像 -->
        <el-avatar class="user-avator" :size="30" :src="imgurl" />
        <el-dropdown class="user-name" trigger="click" @command="handleCommand">
          <span class="el-dropdown-link">
            {{ username }}
            <img
              :src="logout"
              alt=""
              style="width: 25px; height: 25px; margin-left: 15px"
            />
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item divided command="loginout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSidebarStore } from '../store/sidebar';
import { useRouter } from 'vue-router';
import imgurl from '../assets/img/img.png';
import logout from '../assets/img/logout.png';
import { ElMessageBox } from 'element-plus';
const username: string | null = localStorage.getItem('vuems_name');

// 初始化语言
onMounted(() => {});

// 处理语言切换

const sidebar = useSidebarStore();
// 侧边栏折叠
const collapseChage = () => {
  sidebar.handleCollapse();
};

onMounted(() => {
  if (document.body.clientWidth < 1500) {
    collapseChage();
  }
});

// 用户名下拉菜单选择事件
const router = useRouter();
const handleCommand = (command: string) => {
  if (command == 'loginout') {
    ElMessageBox.confirm('确定要退出该系统吗？', '提示', {
      type: 'warning',
    })
      .then(async () => {
        localStorage.removeItem('vuems_name');
        router.push('/login');
      })
      .catch(() => {});
  }
};

const setFullScreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.body.requestFullscreen.call(document.body);
  }
};
</script>
<style lang="less" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  height: 70px;
  color: var(--header-text-color);
  background: #139a96;
  border-bottom: 1px solid #ddd;


}

@media only screen and (max-width: 657px) {
  .header p {
    font-size: 20px;
  }
}
.header-left {
  display: flex;
  align-items: center;
  padding-left: 20px;
  height: 100%;

    > p {
    font-weight: 700;
    font-style: normal;
    font-size:22px;
    color: #fff;
  }
}

.logo {
  width: 123px;
  height: 72px;
}

.web-title {
  margin: 0 40px 0 10px;
  font-size: 22px;
}

.collapse-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 0 10px;
  cursor: pointer;
  opacity: 0.8;
  font-size: 22px;
}

.collapse-btn:hover {
  opacity: 1;
}

.header-right {
  float: right;
  padding-right: 30px;
}

.header-user-con {
  display: flex;
  height: 70px;
  align-items: center;
}

.btn-fullscreen {
  transform: rotate(45deg);
  margin-right: 5px;
  font-size: 24px;
}

.btn-icon {
  position: relative;
  width: 30px;
  height: 30px;
  text-align: center;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: var(--header-text-color);
  margin: 0 5px;
  font-size: 20px;
}

.btn-bell-badge {
  position: absolute;
  right: 4px;
  top: 0px;
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background: #f56c6c;
  color: var(--header-text-color);
}

.user-avator {
  margin: 0 10px 0 20px;
}

.el-dropdown-link {
  color: var(--header-text-color);
  cursor: pointer;
  display: flex;
  align-items: center;
}

.el-dropdown-menu__item {
  text-align: center;
}

:deep(.lang-switch .el-select__wrapper) {
  background-color: #779fc8;
}

:deep(.el-select__selected-item span) {
  color: #fff;
}
</style>
