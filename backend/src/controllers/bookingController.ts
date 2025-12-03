import { Request, Response, NextFunction } from "express";
import { Booking } from "../models/Booking";
import { Listing } from "../models/Listing";

const sanitizeBooking = (booking: any) => ({
  id: booking._id,
  listing: booking.listing
    ? {
        id: booking.listing._id,
        title: booking.listing.title,
        location: booking.listing.location,
        pricePerNight: booking.listing.pricePerNight,
      }
    : booking.listing,
  guest: booking.guest,
  checkIn: booking.checkIn,
  checkOut: booking.checkOut,
  guests: booking.guests,
  totalPrice: booking.totalPrice,
  status: booking.status,
  createdAt: booking.createdAt,
  updatedAt: booking.updatedAt,
});

// Helper to compute nights between two dates (YYYY-MM-DD strings or Date)
const getNightsBetween = (checkIn: Date, checkOut: Date): number => {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const start = new Date(
    checkIn.getFullYear(),
    checkIn.getMonth(),
    checkIn.getDate()
  );
  const end = new Date(
    checkOut.getFullYear(),
    checkOut.getMonth(),
    checkOut.getDate()
  );
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / MS_PER_DAY);
};

export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { listingId, checkIn, checkOut, guests } = req.body as {
      listingId?: string;
      checkIn?: string;
      checkOut?: string;
      guests?: number;
    };

    if (!listingId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({
        message: "listingId, checkIn, checkOut and guests are required",
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ message: "Invalid dates" });
    }

    if (checkOutDate <= checkInDate) {
      return res
        .status(400)
        .json({ message: "checkOut must be after checkIn" });
    }

    const nights = getNightsBetween(checkInDate, checkOutDate);
    if (nights <= 0) {
      return res.status(400).json({ message: "Stay must be at least 1 night" });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (guests <= 0 || guests > listing.maxGuests) {
      return res.status(400).json({
        message: `Guests must be between 1 and ${listing.maxGuests}`,
      });
    }

    // Availability check:
    // Overlap if existing.checkIn < newCheckOut AND existing.checkOut > newCheckIn
    const overlapping = await Booking.findOne({
      listing: listing._id,
      status: "confirmed",
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
    });

    if (overlapping) {
      return res.status(409).json({
        message:
          "This listing is not available for the selected dates. Please choose different dates.",
      });
    }

    const totalPrice = nights * listing.pricePerNight;

    const booking = await Booking.create({
      listing: listing._id,
      guest: req.user.id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalPrice,
      status: "confirmed",
    });

    const populated = await booking.populate("listing");

    res.status(201).json({
      booking: sanitizeBooking(populated),
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const bookings = await Booking.find({
      guest: req.user.id,
    })
      .sort({ createdAt: -1 })
      .populate("listing");

    res.json({
      items: bookings.map(sanitizeBooking),
    });
  } catch (error) {
    next(error);
  }
};

export const getHostBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Only host/admin should see this ideally; we’ll check role
    if (req.user.role !== "host" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Host access only" });
    }

    // Find bookings where listing.host = current user
    const bookings = await Booking.find()
      .populate({
        path: "listing",
        match: { host: req.user.id },
      })
      .populate("guest")
      .sort({ createdAt: -1 });

    const filtered = bookings.filter((b) => b.listing);

    res.json({
      items: filtered.map((b: any) => ({
        ...sanitizeBooking(b),
        guest:
          b.guest && b.guest._id
            ? {
                id: b.guest._id,
                name: b.guest.name,
                email: b.guest.email,
              }
            : b.guest,
      })),
    });
  } catch (error) {
    next(error);
  }
};
