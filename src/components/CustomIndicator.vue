<template>
  <div class="indicators-management-container">
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧树状目录 -->
      <div style="height: 80vh; overflow-y: auto">
        <div class="left-sidebar">
          <div class="directory-header">
            <span class="directory-title">内置指标体系</span>
          </div>
          <div class="tree-container">
            <el-tree
              ref="treeRef"
              :data="treeData"
              :props="defaultProps"
              node-key="id"
              default-expand-all
              :expand-on-click-node="false"
              :highlight-current="true"
              class="directory-tree"
              @node-click="handleNodeClick"
            >
              <template #default="{ node, data }">
                <span class="custom-tree-node">
                  <span class="node-label">{{ node.label }}</span>
                  <span v-if="data.count" class="node-count">({{ data.count }})</span>
                </span>
              </template>
            </el-tree>
          </div>
        </div>
      </div>

      <!-- 右侧自定义指标体系 -->
      <div class="right-content">
        <div class="custom-indicators-header">
          <div class="header-left">
            <span class="section-title">自定义指标体系</span>
          </div>
          <div class="header-right">
            <el-button type="primary" @click="handleNewIndicator">
              <el-icon class="el-icon--left"><Plus /></el-icon>
              新建指标体系
            </el-button>
          </div>
        </div>

        <!-- 表格区域 -->
        <div class="table-container">
          <el-table
            :data="tableData"
            style="width: 100%"
            :header-cell-style="{
              background: '#f5f7fa',
              color: '#333',
              fontWeight: 'bold',
            }"
            :row-style="{ background: '#fafafa' }"
            border
            stripe
          >
            <el-table-column prop="index" label="序号" width="80" align="center" />
            <el-table-column prop="name" label="指标体系名称" min-width="180" />
            <el-table-column prop="assessmentType" label="评估类型" width="120">
              <template #default="scope">
                <el-tag :type="getAssessmentTypeTagType(scope.row.assessmentType)">
                  {{ scope.row.assessmentType }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="subtaskType" label="子任务类型" min-width="140" />
            <el-table-column
              prop="createTime"
              label="创建时间"
              width="120"
              align="center"
            />
            <el-table-column label="操作" width="230" align="center" fixed="right">
              <template #default="scope">
                <div class="action-buttons">
                  <el-button
                    size="small"
                    type="warning"
                    :icon="View"
                    title="查看"
                    @click="handleView(scope.row)"
                    >查看</el-button
                  >
                  <el-button
                    size="small"
                    type="primary"
                    :icon="Edit"
                    title="编辑"
                    @click="handleEdit(scope.row)"
                    >编辑</el-button
                  >
                  <el-button
                    size="small"
                    type="danger"
                    :icon="Delete"
                    title="删除"
                    @click="handleDelete(scope.row)"
                  >
                    删除</el-button
                  >
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 新建/编辑指标体系对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      draggable=""
      :before-close="handleDialogClose"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <el-form-item label="指标体系名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入指标体系名称" />
        </el-form-item>
        <el-form-item label="评估类型" prop="assessmentType">
          <el-select v-model="formData.assessmentType" placeholder="请选择评估类型">
            <el-option label="文本" value="文本" />
            <el-option label="多模态" value="多模态" />
            <el-option label="视觉" value="视觉" />
            <el-option label="时序" value="时序" />
            <el-option label="安全" value="安全" />
          </el-select>
        </el-form-item>
        <el-form-item label="子任务类型" prop="subtaskType">
          <el-select v-model="formData.subtaskType" placeholder="请选择子任务类型">
            <el-option label="目标检测" value="目标检测" />
            <el-option label="图像分割" value="图像分割" />
            <el-option label="图像分类" value="图像分类" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" @click="handleSubmitForm"> 确定 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import {
  ElTree,
  ElTable,
  ElTableColumn,
  ElButton,
  ElTag,
  ElPagination,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElMessage,
  ElMessageBox,
} from 'element-plus';
import { View, Edit, Delete, Plus } from '@element-plus/icons-vue';

// 树形结构数据
const treeData = ref([
  {
    id: '1',
    label: '文本',
    children: [
      {
        id: '1-1',
        label: '语义理解（问答）',
        children: [
          { id: '1-1-1', label: 'BLEU' },
          { id: '1-1-2', label: 'ROUGE' },
        ],
      },
      {
        id: '1-2',
        label: '语义理解（选择）',
        children: [
          { id: '1-2-1', label: 'Accuracy准确率' },
          { id: '1-2-2', label: 'F1-Score' },
        ],
      },
    ],
  },
  {
    id: '2',
    label: '多模态',
    children: [
      {
        id: '2-1',
        label: '物体识别',
        children: [
          { id: '2-1-1', label: 'Accuracy准确率' },
          { id: '2-1-2', label: 'Precision精确率' },
          { id: '2-1-3', label: 'Recall召回率' },
          { id: '2-1-4', label: 'F1-Score' },
        ],
      },
      {
        id: '2-2',
        label: '场景理解',
        children: [
          { id: '2-2-1', label: 'Accuracy准确率' },
          { id: '2-2-2', label: 'CLIPScore' },
        ],
      },
      {
        id: '2-3',
        label: '行为推断',
        children: [
          { id: '2-3-1', label: 'Accuracy准确率' },
          { id: '2-3-2', label: 'CLIPScore' },
        ],
      },
      {
        id: '2-4',
        label: '计数',
        children: [{ id: '2-4-1', label: 'Accuracy准确率' }],
      },
    ],
  },
  {
    id: '3',
    label: '视觉',
    children: [
      {
        id: '3-1',
        label: '图像分类',
        children: [
          { id: '3-1-1', label: 'Accuracy准确率' },
          { id: '3-1-2', label: 'Precision精确率' },
          { id: '3-1-3', label: 'Recall召回率' },
          { id: '3-1-4', label: 'F1-Score' },
        ],
      },
      {
        id: '3-2',
        label: '目标检测',
        children: [
          { id: '3-2-1', label: 'Accuracy准确率' },
          { id: '3-2-2', label: 'Precision精确率' },
          { id: '3-2-3', label: 'Recall召回率' },
          { id: '3-2-4', label: 'Discovery_Rate发现率' },
          { id: '3-2-4', label: 'error_rate误检比' },
        ],
      },
      {
        id: '3-3',
        label: '图像分割',
        children: [
          { id: '3-3-1', label: 'Precision精确率' },
          { id: '3-3-2', label: 'Recall召回率' },
          { id: '3-3-3', label: 'F1-Score' },
        ],
      },
    ],
  },
  {
    id: '4',
    label: '时序',
    children: [],
  },
  {
    id: '5',
    label: '安全',
    children: [
      {
        id: '5-1',
        label: '基础安全',
        children: [
          { id: '5-1-1', label: '5大类31小类安全风险综合得分' },
        ],
      },
      {
        id: '5-2',
        label: '对抗安全',
        children: [
          { id: '5-2-1', label: '对抗攻击综合得分对抗攻击综合得分' },
        ],
      },
    ],
  },
]);

// 表格数据
const tableData = ref([
  {
    index: 1,
    name: '光伏预测',
    assessmentType: '时序',
    subtaskType: '文本内容',
    createTime: '2026-01-02',
  },
  {
    index: 2,
    name: '设备缺陷识别',
    assessmentType: '多模态',
    subtaskType: '物体识别',
    createTime: '2026-01-07',
  },
  {
    index: 3,
    name: '电力安全监控',
    assessmentType: '视觉',
    subtaskType: '目标检测',
    createTime: '2026-02-13',
  },
  {
    index: 4,
    name: '营销知识理解',
    assessmentType: '文本',
    subtaskType: '语义理解（问答）',
    createTime: '2026-02-06',
  },
]);

// 树形结构配置
const defaultProps = {
  children: 'children',
  label: 'label',
};

// 分页相关数据
const currentPage = ref(1);
const pageSize = ref(10);
const total = computed(() => tableData.value.length);

// 对话框相关数据
const dialogVisible = ref(false);
const dialogTitle = ref('新建指标体系');
const formRef = ref(null);
const formData = reactive({
  id: null,
  name: '',
  assessmentType: '',
  subtaskType: '',
});

// 表单验证规则
const formRules = reactive({
  name: [
    { required: true, message: '请输入指标体系名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  assessmentType: [{ required: true, message: '请选择评估类型', trigger: 'change' }],
  subtaskType: [{ required: true, message: '请输入子任务类型', trigger: 'blur' }],
});

// 树节点点击事件
const handleNodeClick = (data) => {
  console.log('点击树节点:', data);
  // 这里可以添加筛选表格数据的逻辑
};

// 评估类型标签样式
const getAssessmentTypeTagType = (type) => {
  const typeMap = {
    文本: 'primary',
    多模态: 'success',
    视觉: 'warning',
    时序: 'info',
    安全: 'danger',
  };
  return typeMap[type] || '';
};

// 新建指标体系
const handleNewIndicator = () => {
  dialogTitle.value = '新建指标体系';
  // 清空表单数据
  Object.keys(formData).forEach((key) => {
    if (key !== 'id') formData[key] = '';
  });
  formData.id = null;
  dialogVisible.value = true;
};

// 查看
const handleView = (row) => {
  ElMessage.info(`查看指标体系: ${row.name}`);
  // 实际项目中这里可能跳转到详情页
};

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑指标体系';
  // 填充表单数据
  formData.id = row.id;
  formData.name = row.name;
  formData.assessmentType = row.assessmentType;
  formData.subtaskType = row.subtaskType;
  dialogVisible.value = true;
};

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除指标体系 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      const index = tableData.value.findIndex((item) => item.id === row.id);
      if (index !== -1) {
        tableData.value.splice(index, 1);
        ElMessage.success('删除成功');
      }
    })
    .catch(() => {
      // 用户取消删除
    });
};

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val;
  console.log(`每页 ${val} 条`);
};

// 页码改变
const handleCurrentChange = (val) => {
  currentPage.value = val;
  console.log(`当前页: ${val}`);
};

// 关闭对话框
const handleDialogClose = () => {
  dialogVisible.value = false;
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

// 提交表单
const handleSubmitForm = () => {
  if (!formRef.value) return;

  formRef.value.validate((valid) => {
    if (valid) {
      if (formData.id) {
        // 编辑模式
        const index = tableData.value.findIndex((item) => item.id === formData.id);
        if (index !== -1) {
          tableData.value[index] = {
            ...formData,
            createTime: tableData.value[index].createTime, // 保留原创建时间
          };
        }
        ElMessage.success('编辑成功');
      } else {
        // 新建模式
        const newItem = {
          id: tableData.value.length + 1,
          name: formData.name,
          assessmentType: formData.assessmentType,
          subtaskType: formData.subtaskType,
          createTime: new Date().toISOString().split('T')[0], // 当前日期
        };
        tableData.value.unshift(newItem);
        ElMessage.success('新建成功');
      }
      dialogVisible.value = false;
    } else {
      ElMessage.warning('请正确填写表单');
    }
  });
};

// 组件挂载时
onMounted(() => {
  console.log('指标体系管理页面已加载');
});
</script>

<style lang="less" scoped>
.indicators-management-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;

  .page-header {
    padding: 16px 20px;
    background-color: #fff;
    border-bottom: 1px solid #e4e7ed;

    .page-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
  }

  .main-content {
    flex: 1;
    display: flex;
    overflow: hidden;
    margin-top: 16px;
    border-radius: 4px;
    background-color: #fafafa;
    gap: 10px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .left-sidebar {
      width: 280px;
      border-right: 1px solid #e4e7ed;
      display: flex;
      flex-direction: column;
      background-color: #fff;
      margin-bottom: 30px;

      .directory-header {
        width: 280px;
        padding: 16px;
        position: fixed;
        border-bottom: 1px solid #e4e7ed;
        background-color: #f5f7fa;
        z-index: 88;

        .directory-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
      }

      .tree-container {
        margin-top: 50px;
        flex: 1;
        overflow-y: auto;
        padding: 8px 0;

        .directory-tree {
          background-color: transparent;

          :deep(.el-tree-node) {
            .el-tree-node__content {
              height: 36px;
              padding-left: 20px;

              &:hover {
                background-color: #f0f9ff;
              }
            }

            &.is-current {
              & > .el-tree-node__content {
                background-color: #ecf5ff;
                color: #409eff;

                .custom-tree-node {
                  .node-label {
                    font-weight: 600;
                  }
                }
              }
            }
          }

          .custom-tree-node {
            display: flex;
            align-items: center;
            width: 100%;

            .node-label {
              flex: 1;
              font-size: 14px;
            }

            .node-count {
              font-size: 12px;
              color: #909399;
              margin-left: 8px;
            }
          }
        }
      }
    }

    .right-content {
      flex: 1;
      background-color: #fff;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .custom-indicators-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid #e4e7ed;
        background-color: #fff;

        .header-left {
          .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #333;
          }
        }

        .header-right {
          .new-indicator-btn {
            background-color: #67c23a;
            border-color: #67c23a;

            &:hover {
              background-color: #5daf34;
              border-color: #5daf34;
            }
          }
        }
      }

      .table-container {
        flex: 1;
        padding: 20px;
        overflow-y: auto;

        :deep(.el-table) {
          .el-table__header {
            th {
              background-color: #f5f7fa;
              color: #333;
              font-weight: bold;
            }
          }

          .el-table__body {
            tr {
              &:nth-child(even) {
                td {
                  background-color: #fafafa;
                }
              }

              &:hover {
                td {
                  background-color: #f5f7fa;
                }
              }
            }
          }
        }

        .action-buttons {
          display: flex;
          justify-content: center;
          gap: 8px;

          .el-button {
            padding: 6px;
          }
        }
      }

      .pagination-container {
        padding: 16px 20px;
        border-top: 1px solid #e4e7ed;
        display: flex;
        justify-content: flex-end;
        background-color: #fff;
      }
    }
  }
}
</style>
