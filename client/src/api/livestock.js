import { http } from "./http";

export const livestockApi = {
  getProfiles: () => http.get("/livestock/profiles"),
  getProfile: (id) => http.get(`/livestock/profiles/${id}`),
  createProfile: (data) => http.post("/livestock/profiles", data),
  updateProfile: (id, data) => http.put(`/livestock/profiles/${id}`, data),
  deleteProfile: (id) => http.delete(`/livestock/profiles/${id}`),
  addHealthRecord: (id, data) => http.post(`/livestock/profiles/${id}/records`, data),
  analyzeSymptoms: (data) => http.post("/livestock/analyze-symptoms", data)
};
