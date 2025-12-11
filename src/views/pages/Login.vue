<template>
  <div class="login-bg">
    <div class="login-container">
      <div class="login-header">
        <div class="login-title">电力人工智能模型应用评估系统</div>
      </div>
      <el-form :model="param" :rules="rules" ref="login" size="large">
        <el-form-item prop="username">
          <el-input v-model="param.username" placeholder="用户名">
            <template #prepend>
              <el-icon>
                <User />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            type="password"
            placeholder="密码"
            v-model="param.password"
            @keyup.enter="submitForm(login)"
          >
            <template #prepend>
              <el-icon>
                <Lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-button
          class="login-btn"
          type="primary"
          size="large"
          @click="submitForm(login)"
          >马上登录</el-button
        >
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useTabsStore } from '@/store/tabs';
import { usePermissStore } from '@/store/permiss';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';

interface LoginInfo {
  username: string;
  password: string;
}

const lgStr = localStorage.getItem('login-param');
const defParam = lgStr ? JSON.parse(lgStr) : null;
const checked = ref(lgStr ? true : false);

const router = useRouter();
const param = reactive<LoginInfo>({
  username: defParam ? defParam.username : '',
  password: defParam ? defParam.password : '',
});

const rules: FormRules = {
  username: [
    {
      required: true,
      message: '请输入用户名',
      trigger: 'blur',
    },
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};
const permiss = usePermissStore();
const login = ref<FormInstance>();
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate((valid) => {
    if (valid) {
      ElMessage.success('登录成功');
      localStorage.setItem('vuems_name', param.username);
      const keys = permiss.defaultList[param.username == 'admin' ? 'admin' : 'user'];
      permiss.handleSet(keys);
      router.push('/scenarios-datasets');
      if (checked.value) {
        localStorage.setItem('login-param', JSON.stringify(param));
      } else {
        localStorage.removeItem('login-param');
      }
    } else {
      ElMessage.error('登录失败');
      return;
    }
  });
};

const tabs = useTabsStore();
tabs.clearTabs();
</script>

<style lang="less" scoped>
.login-bg {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  height: 100vh;
  background: url(../../assets/img/login.png) center/cover no-repeat;
}

.login-header {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}

.login-title {
  font-size: 24px;
  color: #333;
  font-weight: bold;
}

.login-container {
  width: 500px;
  height: 500px;
  border-radius: 5px;
  background: #fff;
  box-sizing: border-box;
  margin-right: 200px;
  display: flex;
  flex-direction: column;
  padding: 40px 50px 50px;

  .pwd-tips {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    margin: -10px 0 10px;
    color: #787878;
  }

  .pwd-checkbox {
    height: auto;
  }

  .login-btn {
    display: block;
    width: 100%;
  }

  .login-tips {
    font-size: 12px;
    color: #999;
  }

  .login-text {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    font-size: 14px;
    color: #787878;
  }

}

</style>
