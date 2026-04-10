<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getModelList,
  createModel,
  updateModel,
  deleteModel,
  type Model
} from "@/api/models";

defineOptions({
  name: "Models"
});

const loading = ref(false);
const tableData = ref<Model[]>([]);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
});

const dialogVisible = ref(false);
const dialogTitle = ref("新增模型");
const isEdit = ref(false);
const currentId = ref<string>("");

const formData = reactive<{
  name: string;
  provider: string;
  base_url: string;
  api_key: string;
  status: "active" | "inactive";
  models: string;
}>({
  name: "",
  provider: "",
  base_url: "",
  api_key: "",
  status: "active",
  models: ""
});

async function fetchModels() {
  loading.value = true;
  try {
    const res = await getModelList({
      page: pagination.current,
      pageSize: pagination.pageSize
    });
    tableData.value = res.data.list;
    pagination.total = res.data.total;
  } catch {
    ElMessage.error("获取模型列表失败");
  } finally {
    loading.value = false;
  }
}

function handlePageChange(page: number) {
  pagination.current = page;
  fetchModels();
}

function openAddDialog() {
  dialogTitle.value = "新增模型";
  isEdit.value = false;
  currentId.value = "";
  Object.assign(formData, { name: "", provider: "", base_url: "", api_key: "", status: "active", models: "" });
  dialogVisible.value = true;
}

function openEditDialog(row: Model) {
  dialogTitle.value = "编辑模型";
  isEdit.value = true;
  currentId.value = row.id as string;
  Object.assign(formData, {
    name: row.name || "",
    provider: row.provider || "",
    base_url: row.base_url || "",
    api_key: row.api_key || "",
    status: row.status || "active",
    models: (row.models || []).join(", ")
  });
  dialogVisible.value = true;
}

async function handleSubmit() {
  try {
    const payload: any = {
      name: formData.name,
      provider: formData.provider,
      base_url: formData.base_url,
      api_key: formData.api_key,
      enabled: formData.status === "active",
      models: formData.models.split(",").map((m: string) => m.trim()).filter(Boolean)
    };

    if (isEdit.value && currentId.value) {
      await updateModel(currentId.value, payload);
      ElMessage.success("更新成功");
    } else {
      await createModel(payload);
      ElMessage.success("创建成功");
    }
    dialogVisible.value = false;
    fetchModels();
  } catch (err: any) {
    ElMessage.error(err?.message || (isEdit.value ? "更新失败" : "创建失败"));
  }
}

async function handleDelete(row: Model) {
  try {
    await ElMessageBox.confirm(`确定删除模型 "${row.name}" 吗？`, "提示", {
      type: "warning"
    });
    await deleteModel(row.id as string);
    ElMessage.success("删除成功");
    fetchModels();
  } catch (err: any) {
    if (err !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
}

function maskKey(key: string | undefined) {
  if (!key) return "-";
  return key.slice(0, 8) + "..." + key.slice(-6);
}

fetchModels();
</script>

<template>
  <div class="models-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>模型列表</span>
          <el-button type="primary" @click="openAddDialog">新增模型</el-button>
        </div>
      </template>
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="name" label="名称" min-width="120" />
        <el-table-column prop="provider" label="Provider" width="100" />
        <el-table-column prop="base_url" label="Base URL" min-width="180" show-overflow-tooltip />
        <el-table-column prop="models" label="模型" min-width="140">
          <template #default="{ row }">
            {{ (row.models || []).join(", ") }}
          </template>
        </el-table-column>
        <el-table-column prop="api_key" label="API Key" min-width="140">
          <template #default="{ row }">
            <span style="font-family: monospace; color: #909399; font-size: 12px;">
              {{ maskKey(row.api_key) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === "active" ? "启用" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.current"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="formData" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="formData.name" placeholder="如 MiniMax-M2.7" />
        </el-form-item>
        <el-form-item label="Provider" required>
          <el-input v-model="formData.provider" placeholder="如 minimax / openai" />
        </el-form-item>
        <el-form-item label="Base URL">
          <el-input v-model="formData.base_url" placeholder="如 https://api.minimaxi.com/v1" />
        </el-form-item>
        <el-form-item label="API Key">
          <el-input v-model="formData.api_key" placeholder="上游 API Key" />
        </el-form-item>
        <el-form-item label="模型" required>
          <el-input v-model="formData.models" placeholder="如 MiniMax-M2.7（多个用逗号分隔）" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.models-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
