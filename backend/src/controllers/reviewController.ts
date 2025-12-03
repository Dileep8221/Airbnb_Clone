import { Request, Response, NextFunction } from "express";
import { Review } from "../models/Review";
import { Listing } from "../models/Listing";
import { Booking } from "../models/Booking";

const sanitizeReview = (review: any) => ({
  id: review._id,
  rating: review.rating,
  comment: review.comment,
  listing: review.listing?._id || review.listing,
  author: review.author
    ? {
        id: review.author._id,
        name: review.author.name,
      }
    : review.author,
  createdAt: review.createdAt,
  updatedAt: review.updatedAt,
});

export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { listingId, rating, comment } = req.body as {
      listingId?: string;
      rating?: number;
      comment?: string;
    };

    if (!listingId || rating == null || !comment) {
      return res
        .status(400)
        .json({ message: "listingId, rating and comment are required" });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "rating must be between 1 and 5" });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // check user has at least one completed booking for this listing
    const now = new Date();
    const hasCompletedBooking = await Booking.exists({
      listing: listing._id,
      guest: req.user.id,
      status: "confirmed",
      checkOut: { $lt: now },
    });

    if (!hasCompletedBooking) {
      return res.status(400).json({
        message: "You can only review listings you have completed a stay at.",
      });
    }

    // prevent duplicates (also enforced by unique index)
    const existing = await Review.findOne({
      listing: listing._id,
      author: req.user.id,
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this listing." });
    }

    const review = await Review.create({
      listing: listing._id,
      author: req.user.id,
      rating,
      comment,
    });

    const populated = await review.populate("author");

    res.status(201).json({
      review: sanitizeReview(populated),
    });
  } catch (error: any) {
    // handle duplicate index errors nicely
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already reviewed this listing.",
      });
    }
    next(error);
  }
};

export const getListingReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const listingId = req.query.listingId as string | undefined;

    if (!listingId) {
      return res
        .status(400)
        .json({ message: "listingId query parameter is required" });
    }

    const reviews = await Review.find({ listing: listingId })
      .sort({ createdAt: -1 })
      .populate("author");

    const items = reviews.map(sanitizeReview);

    const avgRating =
      items.length === 0
        ? null
        : items.reduce((sum, r) => sum + r.rating, 0) / items.length;

    res.json({
      items,
      count: items.length,
      averageRating: avgRating,
    });
  } catch (error) {
    next(error);
  }
};
