<template>
  <div class="task-log-container">
    <!-- 头部信息 -->
    <div class="header-section">
      <div class="page-title">
        <h1>评估工具管理</h1>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

</script>

<style lang="less" scoped>
.task-log-container {
  padding: 20px;
  margin: 0 auto;
  background: #f5f7fa;
}

.header-section {
  margin-bottom: 20px;
}

.page-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h1 {
    margin: 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
  }
}
</style>
