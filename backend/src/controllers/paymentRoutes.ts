import { Router } from "express";
import { createCheckoutSession } from "../controllers/paymentController";
import { requireAuth } from "../middleware/auth";

const router = Router();

// POST /api/payments/checkout-session
router.post("/checkout-session", requireAuth, createCheckoutSession);

export default router;
