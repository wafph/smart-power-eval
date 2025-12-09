<template>
  <div class="directory-viewer">
    <!-- 弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="项目目录结构"
      width="600px"
      destroy-on-close
      :close-on-click-modal="false"
      @close="closeDialog"
      draggable
    >
      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
          v-model="filterText"
          placeholder="输入关键字过滤"
          clearable
          prefix-icon="Search"
        />
      </div>

      <!-- 目录树 -->
      <div class="directory-tree">
        <el-tree
          ref="treeRef"
          :data="directoryData"
          :props="defaultProps"
          :filter-node-method="filterNode"
          :expand-on-click-node="false"
          node-key="id"
          default-expand-all
          :indent="20"
        >
          <template #default="{ node, data }">
            <span class="custom-tree-node">
              <el-icon class="node-icon">
                <component :is="getFileIcon(data)" />
              </el-icon>
              <span class="node-label">{{ node.label }}</span>
            </span>
          </template>
        </el-tree>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog">关闭</el-button>
          <el-button type="primary" @click="closeDialog"> 确定 </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 触发按钮 -->
    <!-- <el-button type="primary" @click="dialogVisible = true">
      <el-icon><FolderOpened /></el-icon>
      查看目录结构
    </el-button> -->
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, toRefs } from 'vue';
import { ElTree, ElMessage } from 'element-plus';
import type { FileNode } from './types';
import { fileIcons } from './types';

// 定义props
interface Props {
  directoryData?: FileNode[];
  dialogVisible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  directoryData: () => [],
  dialogVisible: false,
});

const { dialogVisible } = toRefs(props);

const emit = defineEmits(['closeDialogVisible']);
const closeDialog = () => {
  emit('closeDialogVisible', false);
};

const filterText = ref('');
const treeRef = ref<InstanceType<typeof ElTree>>();

// 默认树形结构配置
const defaultProps = {
  children: 'children',
  label: 'label',
};

// 示例目录数据
// const sampleData: FileNode[] = [
//   {
//     id: '1',
//     label: 'src',
//     type: 'folder',
//     children: [
//       {
//         id: '2',
//         label: 'components',
//         type: 'folder',
//         children: [
//           {
//             id: '3',
//             label: 'HelloWorld.vue',
//             type: 'file',
//             ext: 'vue',
//           },
//           {
//             id: '4',
//             label: 'UserProfile.vue',
//             type: 'file',
//             ext: 'vue',
//           },
//         ],
//       },
//       {
//         id: '5',
//         label: 'views',
//         type: 'folder',
//         children: [
//           {
//             id: '6',
//             label: 'Home.vue',
//             type: 'file',
//             ext: 'vue',
//           },
//           {
//             id: '7',
//             label: 'About.vue',
//             type: 'file',
//             ext: 'vue',
//           },
//         ],
//       },
//       {
//         id: '8',
//         label: 'utils',
//         type: 'folder',
//         children: [
//           {
//             id: '9',
//             label: 'request.ts',
//             type: 'file',
//             ext: 'ts',
//           },
//           {
//             id: '10',
//             label: 'tools.js',
//             type: 'file',
//             ext: 'js',
//           },
//         ],
//       },
//       {
//         id: '11',
//         label: 'assets',
//         type: 'folder',
//         children: [
//           {
//             id: '12',
//             label: 'logo.png',
//             type: 'file',
//             ext: 'png',
//           },
//           {
//             id: '13',
//             label: 'styles.css',
//             type: 'file',
//             ext: 'css',
//           },
//         ],
//       },
//       {
//         id: '14',
//         label: 'main.ts',
//         type: 'file',
//         ext: 'ts',
//       },
//       {
//         id: '15',
//         label: 'App.vue',
//         type: 'file',
//         ext: 'vue',
//       },
//     ],
//   },
//   {
//     id: '16',
//     label: 'public',
//     type: 'folder',
//     children: [
//       {
//         id: '17',
//         label: 'index.html',
//         type: 'file',
//         ext: 'html',
//       },
//       {
//         id: '18',
//         label: 'favicon.ico',
//         type: 'file',
//         ext: 'ico',
//       },
//     ],
//   },
//   {
//     id: '19',
//     label: 'package.json',
//     type: 'file',
//     ext: 'json',
//   },
//   {
//     id: '20',
//     label: 'tsconfig.json',
//     type: 'file',
//     ext: 'json',
//   },
//   {
//     id: '21',
//     label: 'README.md',
//     type: 'file',
//     ext: 'md',
//   },
// ];

const sampleData: FileNode[] = [
  // {
  //   id: '1',
  //   label: 'src',
  //   type: 'folder',
  //   children: [
  //     {
  //       id: '2',
  //       label: 'components',
  //       type: 'folder',
  //       children: [
  //         {
  //           id: '4',
  //           label: 'UserProfile.vue',
  //           type: 'file',
  //           ext: 'vue',
  //         },
  //       ],
  //     },
  //     {
  //       id: '14',
  //       label: 'main.ts',
  //       type: 'file',
  //       ext: 'ts',
  //     },
  //     {
  //       id: '15',
  //       label: 'App.vue',
  //       type: 'file',
  //       ext: 'vue',
  //     },
  //   ],
  // },
  // {
  //   id: '20',
  //   label: 'tsconfig.json',
  //   type: 'file',
  //   ext: 'json',
  // },
  {
    id: '21',
    label: 'mcq_samples_computer_science_mcq.jsonl',
    type: 'file',
    ext: 'md',
  },
];

// 使用props数据或示例数据
const directoryData = ref<FileNode[]>(
  props.directoryData.length ? props.directoryData : sampleData,
);

// 获取文件图标
const getFileIcon = (data: FileNode) => {
  if (data.type === 'folder') {
    return 'Folder';
  }

  const ext = data.ext || data.label.split('.').pop() || 'default';
  const iconType = fileIcons[ext] || fileIcons.default;

  // 根据图标类型返回对应的Element Plus图标组件名
  const iconMap: Record<string, string> = {
    folder: 'Folder',
    document: 'Document',
    picture: 'Picture',
  };

  return iconMap[iconType] || 'Document';
};

// 过滤节点
const filterNode = (value: string, data: FileNode) => {
  if (!value) return true;
  return data.label.includes(value);
};

// 监听过滤文本变化
watch(filterText, (val) => {
  treeRef.value?.filter(val);
});

// // 暴露方法给父组件
// defineExpose({
//   open: () => {
//     dialogVisible.value = true;
//   },
//   close: () => {
//     dialogVisible.value = false;
//   },
// });
</script>

<style scoped lang="less">
.directory-viewer {
  .search-box {
    margin-bottom: 15px;
  }

  .directory-tree {
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 10px;

    :deep(.el-tree) {
      background: transparent;

      .el-tree-node {
        .el-tree-node__content {
          height: 32px;
          margin: 2px 0;

          &:hover {
            background-color: #f5f7fa;
          }

          .custom-tree-node {
            display: flex;
            align-items: center;
            width: 100%;

            .node-icon {
              margin-right: 6px;
              color: #909399;
              font-size: 16px;
            }

            .node-label {
              font-size: 14px;
              color: #606266;
            }
          }
        }

        &.is-current {
          .el-tree-node__content {
            background-color: #ecf5ff;

            .node-label {
              color: #409eff;
              font-weight: 500;
            }
          }
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}
</style>
