import { Router } from "express";
import { getAdminOverview } from "../controllers/adminController";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// GET /api/admin/overview  (admin only)
router.get("/overview", requireAuth, requireAdmin, getAdminOverview);

export default router;
