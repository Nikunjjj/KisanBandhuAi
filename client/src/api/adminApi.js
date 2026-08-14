import { http } from "./http";

export const adminApi = {
  getStats: () => http.get("/admin/stats"),
  getUsers: (params) => http.get("/admin/users", { params }),
  updateUserStatus: (id, status) => http.put(`/admin/users/${id}/status`, { status }),

  // Moderation
  getJobs: () => http.get("/admin/jobs"),
  deleteJob: (id) => http.delete(`/admin/jobs/${id}`),

  getCrops: () => http.get("/admin/marketplace"),
  deleteCrop: (id) => http.delete(`/admin/marketplace/${id}`),

  getPosts: () => http.get("/admin/community"),
  deletePost: (id) => http.delete(`/admin/community/${id}`),

  getLocations: () => http.get("/admin/locations"),
  deleteLocation: (id) => http.delete(`/admin/locations/${id}`),

  getSchemes: () => http.get("/admin/schemes"),
  deleteScheme: (id) => http.delete(`/admin/schemes/${id}`),
};
