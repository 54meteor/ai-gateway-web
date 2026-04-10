<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import { ElMessage } from "element-plus";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { GridComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([LineChart, GridComponent, CanvasRenderer]);

defineOptions({
  name: "Dashboard"
});

interface DashboardStats {
  TotalUsers: number;
  TotalKeys: number;
  TodayRequests: number;
  TodayCost: number;
  TotalRequests: number;
  TotalTokens: number;
  TotalPromptTokens: number;
  TotalCompletionTokens: number;
  TotalCost: number;
  TopUsers: TopUser[];
  Trend: TrendItem[];
}

interface TopUser {
  UserID: string;
  Email: string;
  TotalPrompt: number;
  TotalCompletion: number;
  TotalTokens: number;
  TotalCost: number;
  RequestCount: number;
}

interface TrendItem {
  Date: string;
  Requests: number;
  PromptTokens: number;
  CompletionTokens: number;
  TotalTokens: number;
  Cost: number;
}

const stats = ref<DashboardStats>({
  TotalUsers: 0,
  TotalKeys: 0,
  TodayRequests: 0,
  TodayCost: 0,
  TotalRequests: 0,
  TotalTokens: 0,
  TotalPromptTokens: 0,
  TotalCompletionTokens: 0,
  TotalCost: 0,
  TopUsers: [],
  Trend: []
});

const chartRef = ref<HTMLDivElement>();
let chartInstance: echarts.ECharts | null = null;

async function fetchDashboard() {
  try {
    const res = await fetch("http://localhost:8080/admin/");
    const data = await res.json();
    stats.value = data;
    await nextTick();
    renderChart();
  } catch {
    ElMessage.error("获取仪表盘数据失败");
  }
}

function renderChart() {
  if (!chartRef.value) return;
  if (chartInstance) {
    chartInstance.dispose();
  }
  chartInstance = echarts.init(chartRef.value);
  const trend = stats.value.Trend || [];

  const option = {
    title: {
      text: "近7天用量趋势",
      left: "center",
      textStyle: { fontSize: 14, fontWeight: 500 }
    },
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        const p = params[0];
        return `${p.name}<br/>请求数: ${p.value}<br/>费用: ¥${trend[p.dataIndex]?.Cost?.toFixed(6) || 0}`;
      }
    },
    grid: { left: 50, right: 20, top: 40, bottom: 30 },
    xAxis: {
      type: "category",
      data: trend.map((t: TrendItem) => t.Date),
      axisLabel: { fontSize: 11 }
    },
    yAxis: {
      type: "value",
      name: "请求数",
      axisLabel: { fontSize: 11 }
    },
    series: [
      {
        name: "请求数",
        type: "line",
        smooth: true,
        data: trend.map((t: TrendItem) => t.Requests),
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(64, 158, 255, 0.3)" },
            { offset: 1, color: "rgba(64, 158, 255, 0.05)" }
          ])
        },
        lineStyle: { color: "#409eff", width: 2 },
        itemStyle: { color: "#409eff" }
      }
    ]
  };
  chartInstance.setOption(option);
}

function formatNumber(n: number) {
  return n.toLocaleString();
}

function formatCost(cost: number) {
  return `¥ ${cost.toFixed(6)}`;
}

onMounted(() => {
  fetchDashboard();
});
</script>

<template>
  <div class="dashboard-container">
    <!-- 指标卡片 -->
    <el-row :gutter="16" style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-icon" style="background: #409eff20; color: #409eff;">
            <span style="font-size: 24px;">👥</span>
          </div>
          <div class="stat-content">
            <div class="stat-label">总用户数</div>
            <div class="stat-value">{{ formatNumber(stats.TotalUsers) }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-icon" style="background: #67c23a20; color: #67c23a;">
            <span style="font-size: 24px;">🔑</span>
          </div>
          <div class="stat-content">
            <div class="stat-label">总 Key 数</div>
            <div class="stat-value">{{ formatNumber(stats.TotalKeys) }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-icon" style="background: #e6a23c20; color: #e6a23c;">
            <span style="font-size: 24px;">📊</span>
          </div>
          <div class="stat-content">
            <div class="stat-label">总请求数</div>
            <div class="stat-value">{{ formatNumber(stats.TotalRequests) }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-icon" style="background: #f56c6c20; color: #f56c6c;">
            <span style="font-size: 24px;">💰</span>
          </div>
          <div class="stat-content">
            <div class="stat-label">总费用</div>
            <div class="stat-value" style="color: #67c23a;">{{ formatCost(stats.TotalCost) }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 今日概况 + 趋势图表 -->
    <el-row :gutter="16" style="margin-bottom: 20px;">
      <el-col :span="8">
        <el-card shadow="never">
          <template #header><span>今日概况</span></template>
          <div class="today-stats">
            <div class="today-item">
              <span class="today-label">今日请求</span>
              <span class="today-value">{{ formatNumber(stats.TodayRequests) }}</span>
            </div>
            <div class="today-item">
              <span class="today-label">今日费用</span>
              <span class="today-value" style="color: #67c23a;">{{ formatCost(stats.TodayCost) }}</span>
            </div>
            <div class="today-item">
              <span class="today-label">累计 Tokens</span>
              <span class="today-value">{{ formatNumber(stats.TotalTokens) }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card shadow="never">
          <div ref="chartRef" style="height: 180px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Top 用户 -->
    <el-card shadow="never">
      <template #header>
        <span>Top 5 用户（按费用排序）</span>
      </template>
      <el-table :data="stats.TopUsers" stripe>
        <el-table-column prop="Email" label="用户邮箱" min-width="180" />
        <el-table-column prop="RequestCount" label="请求次数" width="100" align="center" />
        <el-table-column prop="TotalTokens" label="总 Tokens" width="120" align="right">
          <template #default="{ row }">
            {{ formatNumber(row.TotalTokens) }}
          </template>
        </el-table-column>
        <el-table-column prop="TotalCost" label="总费用" width="120" align="right">
          <template #default="{ row }">
            <span style="color: #67c23a;">{{ formatCost(row.TotalCost) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 快速入口 -->
    <el-row :gutter="16" style="margin-top: 20px;">
      <el-col :span="8">
        <el-card shadow="never" class="quick-card" @click="$router.push('/user')">
          <div class="quick-content">
            <span style="font-size: 28px;">👤</span>
            <span style="margin-top: 8px; font-weight: 500;">用户管理</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="quick-card" @click="$router.push('/models')">
          <div class="quick-content">
            <span style="font-size: 28px;">🤖</span>
            <span style="margin-top: 8px; font-weight: 500;">模型管理</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="quick-card" @click="$router.push('/usage')">
          <div class="quick-content">
            <span style="font-size: 28px;">📈</span>
            <span style="margin-top: 8px; font-weight: 500;">用量统计</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 20px;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
}
.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-content {
  flex: 1;
}
.stat-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
}
.stat-value {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}
.today-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.today-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}
.today-item:last-child {
  border-bottom: none;
}
.today-label {
  color: #606266;
  font-size: 14px;
}
.today-value {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}
.quick-card {
  cursor: pointer;
  transition: all 0.2s;
}
.quick-card:hover {
  transform: translateY(-2px);
}
.quick-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
}
</style>
