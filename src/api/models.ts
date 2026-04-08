import { http } from "@/utils/http";

export type Model = {
  id?: number;
  name: string;
  provider: string;
  status: "active" | "inactive";
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
export const updateModel = (id: number, data: object) => {
  return http.request<ModelResult>("put", `/admin/models/${id}`, { data });
};

/** 删除模型 */
export const deleteModel = (id: number) => {
  return http.request<ModelResult>("delete", `/admin/models/${id}`);
};
