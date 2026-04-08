<script setup lang="ts">
import { ref } from "vue";

defineOptions({
  name: "Models"
});

// Mock data for demonstration
const mockModels = [
  { id: 1, name: "gpt-4o", provider: "OpenAI", status: "active" },
  { id: 2, name: "gpt-4o-mini", provider: "OpenAI", status: "active" },
  { id: 3, name: "claude-3-5-sonnet", provider: "Anthropic", status: "active" },
  { id: 4, name: "gemini-2.0-flash", provider: "Google", status: "inactive" },
  { id: 5, name: "deepseek-chat", provider: "DeepSeek", status: "active" }
];

const loading = ref(false);
const tableData = ref(mockModels);
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: mockModels.length
});

function handlePageChange(page: number) {
  pagination.value.current = page;
}
</script>

<template>
  <div class="models-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>模型列表</span>
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
          <template #default>
            <el-button link type="primary">编辑</el-button>
            <el-button link type="danger">删除</el-button>
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
  </div>
</template>

<style scoped>
.models-container {
  padding: 20px;
}
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
