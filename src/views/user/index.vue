<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getUserList, type User } from "@/api/userManage";
import UserDialog from "./components/UserDialog.vue";

defineOptions({
  name: "User"
});

const loading = ref(false);
const tableData = ref<User[]>([]);
const dialogVisible = ref(false);
const dialogMode = ref<"create" | "update" | "recharge" | "reset" | "delete">("create");
const currentUser = ref<User>();

async function fetchUsers() {
  loading.value = true;
  try {
    const res = await getUserList();
    tableData.value = res.data || [];
  } catch {
    ElMessage.error("获取用户列表失败");
  } finally {
    loading.value = false;
  }
}

function openCreateDialog() {
  dialogMode.value = "create";
  currentUser.value = undefined;
  dialogVisible.value = true;
}

function openEditDialog(row: User) {
  dialogMode.value = "update";
  currentUser.value = row;
  dialogVisible.value = true;
}

function openRechargeDialog(row: User) {
  dialogMode.value = "recharge";
  currentUser.value = row;
  dialogVisible.value = true;
}

function openResetDialog(row: User) {
  dialogMode.value = "reset";
  currentUser.value = row;
  dialogVisible.value = true;
}

function openDeleteDialog(row: User) {
  dialogMode.value = "delete";
  currentUser.value = row;
  dialogVisible.value = true;
}

function formatBalance(balance: number | undefined) {
  return balance !== undefined ? `¥ ${balance.toFixed(4)}` : "¥ 0.0000";
}

function formatDate(date: string | undefined) {
  if (!date) return "-";
  return date.replace("T", " ").replace("Z", "");
}

onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div class="user-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="openCreateDialog">新增用户</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="balance" label="余额" width="130">
          <template #default="{ row }">
            <span style="color: #67c23a; font-weight: 500;">
              {{ formatBalance(row.balance) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" width="170">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openRechargeDialog(row)">充值</el-button>
            <el-button link type="warning" @click="openResetDialog(row)">重置</el-button>
            <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
            <el-button link type="danger" @click="openDeleteDialog(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <UserDialog
      v-model:visible="dialogVisible"
      :mode="dialogMode"
      :user="currentUser"
      @success="fetchUsers"
    />
  </div>
</template>

<style scoped>
.user-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
