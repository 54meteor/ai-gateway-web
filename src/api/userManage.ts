import { http } from "@/utils/http";

// ==========================================
// 用户管理 API
// ==========================================

/** 用户类型 */
export type User = {
  id?: string;
  email?: string;
  phone?: string;
  username?: string;
  balance?: number;
  created_at?: string;
  api_key?: string;  // 脱敏格式的 Key，前5位+*****+后5位
};

/** 用户列表响应 */
export type UserListResult = {
  success: boolean;
  data: User[];
};

/** 操作响应 */
export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};

/** API Key 类型 */
export type APIKey = {
  id: string;
  user_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
};

/** API Key 列表响应 */
export type APIKeyListResult = {
  success: boolean;
  data: APIKey[];
};

/** 创建 Key 响应 */
export type CreateKeyResult = {
  success: boolean;
  api_key: string;
  message: string;
};

/** 用户余额响应 */
export type UserBalanceResult = {
  success: boolean;
  data: {
    balance: number;
    user_id: string;
  };
};

/** 用户用量响应 */
export type UserUsageResult = {
  success: boolean;
  data: {
    total_requests: number;
    total_prompt_tokens: number;
    total_completion_tokens: number;
    total_tokens: number;
    total_cost: number;
    records: UsageRecord[];
  };
};

/** 用量记录 */
export type UsageRecord = {
  api_key_id: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost: number;
  created_at: string;
};

// ==========================================
// 管理后台 API
// ==========================================

/** 获取用户列表 */
export const getUserList = () => {
  return http.request<UserListResult>("get", "/admin/users");
};

/** 创建用户 */
export const createUser = (data: {
  email?: string;
  phone?: string;
  username?: string;
}) => {
  return http.request<ActionResult>("post", "/admin/api/user/create", { data });
};

/** 更新用户 */
export const updateUser = (data: {
  user_id: string;
  email?: string;
  phone?: string;
  username?: string;
}) => {
  return http.request<ActionResult>("post", "/admin/api/user/update", { data });
};

/** 删除用户 */
export const deleteUser = (userId: string) => {
  return http.request<ActionResult>("post", "/admin/api/user/delete", {
    data: { user_id: userId }
  });
};

/** 余额充值 */
export const recharge = (userId: string, amount: number) => {
  return http.request<ActionResult>("post", "/admin/api/user/recharge", {
    data: { user_id: userId, amount }
  });
};

/** 重置余额 */
export const resetBalance = (userId: string) => {
  return http.request<ActionResult>("post", "/admin/api/user/reset", {
    data: { user_id: userId }
  });
};

/** 为用户创建 API Key */
export const createKey = (userId: string) => {
  return http.request<CreateKeyResult>("post", "/admin/api/key/create", {
    data: { user_id: userId }
  });
};

/** 重置用户的 API Key */
export const resetKey = (userId: string) => {
  return http.request<CreateKeyResult>("post", "/admin/api/key/reset", {
    data: { user_id: userId }
  });
};

/** 启用/禁用 API Key */
export const toggleKey = (keyId: string) => {
  return http.request<ActionResult>("post", "/admin/api/key/toggle", {
    data: { key_id: keyId }
  });
};

/** 删除 API Key */
export const deleteKey = (keyId: string) => {
  return http.request<ActionResult>("post", "/admin/api/key/delete", {
    data: { key_id: keyId }
  });
};

// ==========================================
// 用户自助 API（用户用自己的 Key 调用）
// ==========================================

/** 查询自己的余额 */
export const getMyBalance = () => {
  return http.request<UserBalanceResult>("get", "/v1/me/balance");
};

/** 查询自己的用量 */
export const getMyUsage = (params?: { start?: string; end?: string }) => {
  return http.request<UserUsageResult>("get", "/v1/me/usage", { params });
};

// ==========================================
// 用量统计 API
// ==========================================

/** 用量统计概览 */
export type UsageStats = {
  TotalRequests: number;
  TotalPrompt: number;
  TotalCompletion: number;
  TotalTokens: number;
  TotalCost: number;
  SuccessRate: number;
};

/** 用量明细记录 */
export type UsageRecord = {
  UserID: string;
  UserEmail: string;
  APIKeyID: string;
  Model: string;
  PromptTokens: number;
  CompletionTokens: number;
  TotalTokens: number;
  Cost: number;
  CreatedAt: string;
};

/** 用量统计响应 */
export type UsageResult = {
  Stats: UsageStats;
  Usage: UsageRecord[];
};

/** 获取用量统计数据 */
export const getUsageStats = (params?: { start?: string; end?: string; user?: string }) => {
  return http.request<UsageResult>("get", "/admin/usage", { params });
};
