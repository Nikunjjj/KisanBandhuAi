import { http } from "./http";

export const marketplaceApi = {
  getCropListings: (params) => http.get("/marketplace", { params }),
  getUserCropListings: () => http.get("/marketplace/my-listings"),
  getCropById: (id) => http.get(`/marketplace/${id}`),
  createCropListing: (data) => http.post("/marketplace", data),
  updateCropListing: (id, data) => http.put(`/marketplace/${id}`, data),
  deleteCropListing: (id) => http.delete(`/marketplace/${id}`),
};
