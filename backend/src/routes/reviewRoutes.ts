import { Router } from "express";
import {
  createReview,
  getListingReviews,
} from "../controllers/reviewController";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /api/reviews?listingId=...
router.get("/", getListingReviews);

// POST /api/reviews
router.post("/", requireAuth, createReview);

export default router;
