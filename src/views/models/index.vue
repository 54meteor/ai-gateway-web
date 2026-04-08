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
const currentId = ref<number>();

const formData = reactive<Model>({
  name: "",
  provider: "",
  status: "active",
  description: ""
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
  Object.assign(formData, { name: "", provider: "", status: "active", description: "" });
  dialogVisible.value = true;
}

function openEditDialog(row: Model) {
  dialogTitle.value = "编辑模型";
  isEdit.value = true;
  currentId.value = row.id;
  Object.assign(formData, { ...row });
  dialogVisible.value = true;
}

async function handleSubmit() {
  try {
    if (isEdit.value && currentId.value) {
      await updateModel(currentId.value, formData);
      ElMessage.success("更新成功");
    } else {
      await createModel(formData);
      ElMessage.success("创建成功");
    }
    dialogVisible.value = false;
    fetchModels();
  } catch {
    ElMessage.error(isEdit.value ? "更新失败" : "创建失败");
  }
}

async function handleDelete(row: Model) {
  try {
    await ElMessageBox.confirm(`确定删除模型 "${row.name}" 吗？`, "提示", {
      type: "warning"
    });
    await deleteModel(row.id!);
    ElMessage.success("删除成功");
    fetchModels();
  } catch (err: any) {
    if (err !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
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
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="provider" label="Provider" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === "active" ? "启用" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="formData" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="formData.name" placeholder="请输入模型名称" />
        </el-form-item>
        <el-form-item label="Provider">
          <el-input v-model="formData.provider" placeholder="请输入 Provider" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" placeholder="请输入描述" />
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
