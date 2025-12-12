<template>
  <el-form ref="formRef" :model="form" :rules="rules" :label-width="options.labelWidth">
    <el-row :gutter="50">
      <el-col :span="options.span" v-for="item in options.list">
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
          <el-select
            v-else-if="item.type === 'select'"
            v-model="form[item.prop]"
            :disabled="item.disabled"
            :placeholder="'请选择' + item.label"
            clearable
            @change="handleDatasetChange(form[item.prop])"
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
          <el-upload
            v-else-if="item.type === 'upload'"
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
          >
            <img v-if="form[item.prop]" :src="form[item.prop]" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
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
import { FormInstance, FormRules, UploadProps } from 'element-plus';
import { PropType, ref } from 'vue';
const emit = defineEmits(['saveEdit', 'changeEmit']);
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
    required: true,
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
  .map((item) => {
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
const saveEdit = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate((valid) => {
    if (!valid) {
      console.log('error save');
      return;
    }
    emit('saveEdit', form.value);
  });
};

const handleDatasetChange = (e) => {
  emit('changeEmit', e);
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

const handleAvatarSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
  form.value.thumb = URL.createObjectURL(uploadFile.raw!);
};
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}

.bottom-button {
  text-align: center;
}
</style>
