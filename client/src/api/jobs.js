import { http } from "./http";

export const jobApi = {
  getJobs: (params) => http.get("/jobs", { params }),
  getJobById: (id) => http.get(`/jobs/${id}`),
  createJob: (data) => http.post("/jobs", data),
  updateJob: (id, data) => http.put(`/jobs/${id}`, data),
  deleteJob: (id) => http.delete(`/jobs/${id}`),
};
