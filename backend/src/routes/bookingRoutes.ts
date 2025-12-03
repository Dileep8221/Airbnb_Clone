import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  getHostBookings,
} from "../controllers/bookingController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth, createBooking);
router.get("/me", requireAuth, getMyBookings);
router.get("/host", requireAuth, getHostBookings);

export default router;
