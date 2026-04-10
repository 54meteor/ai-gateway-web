<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getUsageStats, type UsageStats, type UsageRecord } from "@/api/userManage";

defineOptions({
  name: "Usage"
});

const loading = ref(false);
const stats = ref<UsageStats>({
  TotalRequests: 0,
  TotalPrompt: 0,
  TotalCompletion: 0,
  TotalTokens: 0,
  TotalCost: 0,
  SuccessRate: 0
});
const tableData = ref<UsageRecord[]>([]);

// 日期范围，默认近7天
const dateRange = ref<[string, string]>([
  (() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  })(),
  (() => new Date().toISOString().split("T")[0])()
]);

async function fetchUsage() {
  loading.value = true;
  try {
    const res = await getUsageStats({
      start: dateRange.value[0],
      end: dateRange.value[1]
    });
    stats.value = res.Stats;
    tableData.value = res.Usage || [];
  } catch {
    ElMessage.error("获取用量统计失败");
  } finally {
    loading.value = false;
  }
}

function formatNumber(n: number) {
  return n.toLocaleString();
}

function formatCost(cost: number) {
  return `¥ ${cost.toFixed(6)}`;
}

function formatDate(date: string) {
  if (!date) return "-";
  return date.replace("T", " ").replace("Z", "");
}

onMounted(() => {
  fetchUsage();
});
</script>

<template>
  <div class="usage-container">
    <!-- 统计概览卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card shadow="never">
          <div class="stat-card">
            <div class="stat-label">总请求数</div>
            <div class="stat-value">{{ formatNumber(stats.TotalRequests) }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never">
          <div class="stat-card">
            <div class="stat-label">总 Prompt Tokens</div>
            <div class="stat-value">{{ formatNumber(stats.TotalPrompt) }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never">
          <div class="stat-card">
            <div class="stat-label">总 Completion Tokens</div>
            <div class="stat-value">{{ formatNumber(stats.TotalCompletion) }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never">
          <div class="stat-card">
            <div class="stat-label">总费用</div>
            <div class="stat-value" style="color: #67c23a;">{{ formatCost(stats.TotalCost) }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 日期筛选 -->
    <el-card shadow="never" style="margin-bottom: 20px;">
      <div style="display: flex; gap: 15px; align-items: center;">
        <span style="font-weight: 500;">时间范围：</span>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="fetchUsage"
        />
        <el-button type="primary" @click="fetchUsage">刷新</el-button>
      </div>
    </el-card>

    <!-- 用量明细表格 -->
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>用量明细</span>
          <span style="font-size: 12px; color: #999;">共 {{ tableData.length }} 条记录</span>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="UserEmail" label="用户邮箱" min-width="150">
          <template #default="{ row }">
            {{ row.UserEmail || row.UserID }}
          </template>
        </el-table-column>
        <el-table-column prop="Model" label="模型" width="140" />
        <el-table-column prop="PromptTokens" label="Prompt Tokens" width="130" align="right">
          <template #default="{ row }">
            {{ formatNumber(row.PromptTokens) }}
          </template>
        </el-table-column>
        <el-table-column prop="CompletionTokens" label="Completion Tokens" width="150" align="right">
          <template #default="{ row }">
            {{ formatNumber(row.CompletionTokens) }}
          </template>
        </el-table-column>
        <el-table-column prop="TotalTokens" label="总 Tokens" width="110" align="right">
          <template #default="{ row }">
            {{ formatNumber(row.TotalTokens) }}
          </template>
        </el-table-column>
        <el-table-column prop="Cost" label="费用" width="100" align="right">
          <template #default="{ row }">
            <span style="color: #67c23a;">{{ formatCost(row.Cost) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="CreatedAt" label="请求时间" width="170">
          <template #default="{ row }">
            {{ formatDate(row.CreatedAt) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.usage-container {
  padding: 20px;
}
.stat-card {
  text-align: center;
}
.stat-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}
.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
