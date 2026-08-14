import express from "express";
import {
  createEquipmentRental,
  createMarketplaceListing,
  getBuyerSellerDiscovery,
  getEquipmentRentals,
  getGovernmentServices,
  getLocationRecommendations,
  getMarketplaceListings,
  getNearbyResources,
  updateMarketplaceListing,
  deleteMarketplaceListing
} from "../controllers/agriMapController.js";
import { authenticate } from "../middleware/auth.js";

export const agriMapRouter = express.Router();

agriMapRouter.use(authenticate);

agriMapRouter.get("/resources", getNearbyResources);
agriMapRouter.get("/marketplace", getMarketplaceListings);
agriMapRouter.post("/marketplace", createMarketplaceListing);
agriMapRouter.put("/marketplace/:id", updateMarketplaceListing);
agriMapRouter.delete("/marketplace/:id", deleteMarketplaceListing);
agriMapRouter.get("/equipment", getEquipmentRentals);
agriMapRouter.post("/equipment", createEquipmentRental);
agriMapRouter.get("/discovery", getBuyerSellerDiscovery);
agriMapRouter.get("/government", getGovernmentServices);
agriMapRouter.get("/recommendations", getLocationRecommendations);
