import { api } from "./api";

export const adminApi = {
  listUsers: () => api.get("/admin/users"),
  createUser: (payload) => api.post("/admin/users", payload),
  updateUser: (id, payload) => api.put(`/admin/users/${id}`, payload),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};