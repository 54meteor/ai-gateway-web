<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import ModelDialog from "./ModelDialog.vue";

defineOptions({
  name: "Models"
});

interface ModelItem {
  id: number;
  name: string;
  provider: string;
  baseUrl?: string;
  apiKey?: string;
  status: "active" | "inactive";
}

const mockModels: ModelItem[] = [
  { id: 1, name: "gpt-4o", provider: "OpenAI", status: "active" },
  { id: 2, name: "gpt-4o-mini", provider: "OpenAI", status: "active" },
  { id: 3, name: "claude-3-5-sonnet", provider: "Anthropic", status: "active" },
  { id: 4, name: "gemini-2.0-flash", provider: "Google", status: "inactive" },
  { id: 5, name: "deepseek-chat", provider: "DeepSeek", status: "active" }
];

const loading = ref(false);
const tableData = ref<ModelItem[]>([...mockModels]);
const dialogRef = ref<InstanceType<typeof ModelDialog>>();
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: mockModels.length
});

function handlePageChange(page: number) {
  pagination.current = page;
}

function handleAdd() {
  dialogRef.value?.open();
}

function handleEdit(row: ModelItem) {
  dialogRef.value?.open({ ...row });
}

async function handleDelete(row: ModelItem) {
  try {
    await ElMessageBox.confirm(`确定删除模型「${row.name}」吗？`, "删除确认", {
      confirmButtonText: "删除",
      cancelButtonText: "取消",
      type: "warning"
    });
    // TODO: 调用 API 删除
    tableData.value = tableData.value.filter((item) => item.id !== row.id);
    ElMessage.success("删除成功");
  } catch {
    // 用户取消
  }
}
</script>

<template>
  <div class="models-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>模型列表</span>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </div>
      </template>
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="provider" label="Provider" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === "active" ? "启用" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
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
    <ModelDialog ref="dialogRef" />
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
