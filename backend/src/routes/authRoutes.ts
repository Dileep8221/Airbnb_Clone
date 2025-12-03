import { Router } from "express";
import { register, login, getMe } from "../controllers/authController";
import { requireAuth } from "../middleware/auth";
import { authLimiter } from "../middleware/rateLimit";

const router = Router();

// Apply stricter rate limit ONLY to these paths
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

// Get current user
router.get("/me", requireAuth, getMe);

export default router;
