import { http } from "@/utils/http";

export type Model = {
  id?: string;
  name: string;
  provider: string;
  base_url?: string;
  api_key?: string;
  status: "active" | "inactive";
  models?: string[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ModelListResult = {
  success: boolean;
  data: {
    list: Model[];
    total: number;
  };
};

export type ModelResult = {
  success: boolean;
  data: Model;
};

/** 获取模型列表 */
export const getModelList = (params?: object) => {
  return http.request<ModelListResult>("get", "/admin/models", { params });
};

/** 创建模型 */
export const createModel = (data: object) => {
  return http.request<ModelResult>("post", "/admin/models", { data });
};

/** 更新模型 */
export const updateModel = (id: string, data: object) => {
  return http.request<ModelResult>("post", "/admin/models/update", { data: { id, ...data } });
};

/** 删除模型 */
export const deleteModel = (id: string) => {
  return http.request<ModelResult>("post", "/admin/models/delete", { data: { id } });
};
