<script setup lang="ts">
import { ref, reactive } from "vue";
import type { FormInstance, FormRules } from "element-plus";

interface ModelForm {
  id?: number;
  name: string;
  provider: string;
  baseUrl: string;
  apiKey: string;
  enabled: boolean;
}

const visible = ref(false);
const title = ref("新增模型");
const formRef = ref<FormInstance>();
const loading = ref(false);

const defaultForm: ModelForm = {
  name: "",
  provider: "",
  baseUrl: "",
  apiKey: "",
  enabled: true
};

const form = reactive<ModelForm>({ ...defaultForm });

const rules: FormRules<ModelForm> = {
  name: [{ required: true, message: "请输入模型名称", trigger: "blur" }],
  provider: [{ required: true, message: "请输入 Provider", trigger: "blur" }],
  apiKey: [{ required: true, message: "请输入 API Key", trigger: "blur" }]
};

function open(row?: ModelForm) {
  if (row?.id) {
    title.value = "编辑模型";
    Object.assign(form, row);
  } else {
    title.value = "新增模型";
    Object.assign(form, defaultForm);
  }
  visible.value = true;
}

function close() {
  visible.value = false;
  formRef.value?.resetFields();
}

async function submit() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      // TODO: 调用 API
      console.log("submit", form);
      loading.value = false;
      close();
    }
  });
}

defineExpose({ open });
</script>

<template>
  <el-dialog v-model="visible" :title="title" width="500px" destroy-on-close>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入模型名称" />
      </el-form-item>
      <el-form-item label="Provider" prop="provider">
        <el-input v-model="form.provider" placeholder="请输入 Provider" />
      </el-form-item>
      <el-form-item label="BaseURL" prop="baseUrl">
        <el-input v-model="form.baseUrl" placeholder="请输入 Base URL（可选）" />
      </el-form-item>
      <el-form-item label="API Key" prop="apiKey">
        <el-input v-model="form.apiKey" placeholder="请输入 API Key" show-password />
      </el-form-item>
      <el-form-item label="启用">
        <el-switch v-model="form.enabled" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" :loading="loading" @click="submit">确定</el-button>
    </template>
  </el-dialog>
</template>
