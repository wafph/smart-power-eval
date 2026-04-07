<template>
  <el-form ref="formRef" :model="form" :rules="rules" :label-width="options.labelWidth">
    <el-row :gutter="50">
      <el-col :span="options.span" v-for="item in options.list" :key="item.prop">
        <el-form-item :label="item.label" :prop="item.prop">
          <!-- 文本框、数字框、下拉框、日期框、开关、上传 -->
          <el-input
            v-if="item.type === 'input'"
            v-model="form[item.prop]"
            :disabled="item.disabled"
            :placeholder="item.placeholder || '请输入' + item.label"
            clearable
          ></el-input>
          <el-input-number
            v-else-if="item.type === 'number'"
            v-model="form[item.prop]"
            :disabled="item.disabled"
            controls-position="right"
          ></el-input-number>
          <el-input-tag
            v-else-if="item.type === 'tag'"
            v-model="form[item.prop]"
            :disabled="item.disabled"
            :placeholder="item.placeholder || '请输入' + item.label"
          ></el-input-tag>
          <el-select
            v-else-if="item.type === 'select1'"
            v-model="form[item.prop]"
            :disabled="item.disabled"
            :placeholder="'请选择' + item.label"
            @change="handleDatasetChange(form[item.prop])"
          >
            <el-option
              v-for="opt in item.opts"
              :label="opt.label"
              :value="opt.value"
            ></el-option>
          </el-select>
          <el-select
            v-else-if="item.type === 'select2'"
            filterable
            v-model="form[item.prop]"
            :disabled="item.disabled"
            :multiple="item.isMultiple"
            :placeholder="'请选择' + item.label"
            @change="handleDatasetChanges(form[item.prop])"
          >
            <el-option
              v-for="opt in item.opts"
              :label="opt.label"
              :value="opt.value"
            ></el-option>
          </el-select>
          <el-date-picker
            v-else-if="item.type === 'date'"
            type="date"
            v-model="form[item.prop]"
            :value-format="item.format"
            :placeholder="item.placeholder || item.label"
          ></el-date-picker>
          <el-switch
            v-else-if="item.type === 'switch'"
            v-model="form[item.prop]"
            :active-value="item.activeValue"
            :inactive-value="item.inactiveValue"
            :active-text="item.activeText"
            :inactive-text="item.inactiveText"
          ></el-switch>
          <!-- 文件上传 -->
          <div v-else-if="item.type === 'upload'" class="upload-container">
            <input
              type="file"
              :id="`file-input-${item.prop}`"
              :style="{ display: 'none' }"
              :accept="item.accept"
              :multiple="item.multiple === true"
              @change="(e) => handleFileInputChange(e, item.prop)"
            />
            <el-button type="primary" @click="triggerFileInput(item.prop)">{{
              getUploadButtonText(form[item.prop])
            }}</el-button>
            <div v-if="form[item.prop]" class="file-info">
              <div class="file-name">
                {{ getFileName(form[item.prop]) }}
              </div>
              <el-icon class="delete-icon" @click="handleFileRemove(item.prop)">
                <Close />
              </el-icon>
            </div>
            <template v-if="item.tip">
              <div class="el-upload__tip">
                {{ item.tip }}
              </div>
            </template>
          </div>

          <slot :name="item.prop" v-else> </slot>
        </el-form-item>
      </el-col>
    </el-row>
    <el-form-item v-if="isShowSearch">
      <div style="position: absolute; right: 530px; top: -50px">
        <el-button type="primary" @click="saveEdit(formRef)">搜索</el-button>
      </div>
    </el-form-item>
    <el-form-item v-if="isShowButton">
      <div style="margin-top: 80px">
        <el-button type="primary" @click="saveEdit(formRef)">{{
          isSystem === true ? '保存' : '立即执行'
        }}</el-button>
        <el-button
          style="margin-left: 315px"
          type="primary"
          plain
          @click="resetForm(formRef)"
          >重置</el-button
        >
      </div>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { FormOption } from '@/types/form-option';
import {
  FormInstance,
  FormRules,
  UploadProps,
  UploadFile,
  UploadInstance,
} from 'element-plus';
import { PropType, ref } from 'vue';
import { Close } from '@element-plus/icons-vue';

const emit = defineEmits([
  'saveEdit',
  'changeEmit',
  'changeEmits',
  'emitForm',
  'fileUpload',
]);

const { options, formData, edit, update, isSystem } = defineProps({
  options: {
    type: Object as PropType<FormOption>,
    required: true,
  },
  formData: {
    type: Object,
    required: true,
  },
  edit: {
    type: Boolean,
    required: false,
  },
  update: {
    type: Function,
    required: false,
  },
  isSystem: {
    type: Boolean,
    required: true,
    default: true,
  },
  isShowButton: {
    type: Boolean,
    required: false,
    default: true,
  },
  isShowSearch: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const form = ref({ ...(edit ? formData : {}) });

const rules: FormRules = options.list
  .map((item: any) => {
    if (item.required) {
      return {
        [item.prop]: [
          { required: true, message: `${item.label}不能为空`, trigger: 'blur' },
        ],
      };
    }
    return {};
  })
  .reduce((acc, cur) => ({ ...acc, ...cur }), {});

const formRef = ref<FormInstance>();

// 获取文件名
const getFileName = (file: File | string) => {
  if (!file) return '';
  if (typeof file === 'string') {
    // 如果是字符串，可能是文件路径
    return file.split('/').pop() || file;
  }
  // 如果是File对象
  return file.name;
};

// 获取上传按钮文字
const getUploadButtonText = (file: File | string | null) => {
  return file ? '重新上传' : '点击上传';
};

// 触发文件输入
const triggerFileInput = (prop: string) => {
  const fileInput = document.getElementById(`file-input-${prop}`) as HTMLInputElement;
  if (fileInput) {
    // 清空文件输入，以便可以重新选择相同的文件
    fileInput.value = '';
    fileInput.click();
  }
};

// 处理文件输入变化
const handleFileInputChange = (event: Event, prop: string) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    // 将文件对象存储到form中
    form.value[prop] = file;

    // 将文件传递给父组件
    emit('fileUpload', {
      file: file,
      prop: prop,
      formData: form.value,
    });
  }
};

// 删除文件
const handleFileRemove = (prop: string) => {
  form.value[prop] = null;
  // 清空文件输入
  const fileInput = document.getElementById(`file-input-${prop}`) as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
  // 通知父组件文件已删除
  emit('fileUpload', {
    file: null,
    prop: prop,
    formData: form.value,
  });
};

const saveEdit = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate((valid) => {
    if (!valid) {
      return;
    }
    emit('saveEdit', form.value);
  });
};

const handleDatasetChange = (e: any) => {
  emit('changeEmit', e);
  emit('emitForm', form.value);
};

const handleDatasetChanges = (e: any) => {
  emit('changeEmits', e);
  emit('emitForm', form.value);
};
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  // 清空上传的文件
  options.list.forEach((item: any) => {
    if (item.type === 'upload') {
      form.value[item.prop] = null;
      // 清空文件输入
      const fileInput = document.getElementById(
        `file-input-${item.prop}`,
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  });
};
</script>

<style scoped>
.upload-container {
  width: 100%;
}

.file-info {
  display: flex;
  align-items: center;
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  color: #606266;
}

.delete-icon {
  margin-left: 8px;
  color: #f56c6c;
  cursor: pointer;
  font-size: 16px;
}

.delete-icon:hover {
  color: #f78989;
}
</style>
