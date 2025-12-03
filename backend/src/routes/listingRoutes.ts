import { Router } from "express";
import {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
} from "../controllers/listingController";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Public routes
router.get("/", getListings);
router.get("/:id", getListingById);

// Protected routes (must be logged in)
router.post("/", requireAuth, createListing);
router.put("/:id", requireAuth, updateListing);
router.delete("/:id", requireAuth, deleteListing);

export default router;
