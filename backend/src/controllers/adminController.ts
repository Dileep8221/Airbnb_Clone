import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { Listing } from "../models/Listing";
import { Booking } from "../models/Booking";
import { Review } from "../models/Review";

export const getAdminOverview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [userCount, listingCount, bookingCount, reviewCount] =
      await Promise.all([
        User.countDocuments(),
        Listing.countDocuments(),
        Booking.countDocuments(),
        Review.countDocuments(),
      ]);

    res.json({
      userCount,
      listingCount,
      bookingCount,
      reviewCount,
    });
  } catch (error) {
    next(error);
  }
};
