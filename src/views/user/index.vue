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
const dialogMode = ref<"create" | "update" | "recharge" | "reset" | "delete" | "createKey" | "resetKey">("create");
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

function openCreateKeyDialog(row: User) {
  dialogMode.value = "createKey";
  currentUser.value = row;
  dialogVisible.value = true;
}

function openResetKeyDialog(row: User) {
  dialogMode.value = "resetKey";
  currentUser.value = row;
  dialogVisible.value = true;
}

function formatBalance(balance: number | undefined) {
  return balance !== undefined ? `¥ ${balance.toFixed(4)}` : "¥ 0.0000";
}

function formatDate(date: string | undefined) {
  if (!date) return "-";
  try {
    const [y, mo, d, h, mi, s] = date.split(/[-T:Z .]/).filter(Boolean).map(Number);
    // 构造为UTC时间，然后直接取UTC组件作为北京时间显示（UTC+8）
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${y}-${pad(mo)}-${pad(d)} ${pad(h)}:${pad(mi)}:${pad(s)}`;
  } catch {
    return date.replace("T", " ").replace("Z", "");
  }
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
        <el-table-column prop="api_key" label="API Key" width="160">
          <template #default="{ row }">
            <span v-if="row.api_key" style="font-family: monospace; color: #909399; font-size: 12px;">{{ row.api_key }}</span>
            <span v-else style="color: #c0c4cc; font-size: 12px;">—</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="340" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openRechargeDialog(row)">充值</el-button>
            <el-button link type="warning" @click="openResetDialog(row)">重置</el-button>
            <template v-if="!row.api_key">
              <el-button link type="success" @click="openCreateKeyDialog(row)">生成Key</el-button>
            </template>
            <template v-else>
              <el-button link type="warning" @click="openResetKeyDialog(row)">重置Key</el-button>
            </template>
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
