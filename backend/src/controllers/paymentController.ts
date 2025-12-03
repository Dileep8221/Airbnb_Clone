import { Request, Response, NextFunction } from "express";
import { stripe } from "../config/stripe";
import { Booking } from "../models/Booking";
import { Listing } from "../models/Listing";

export const createCheckoutSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { bookingId, successUrl, cancelUrl } = req.body as {
      bookingId?: string;
      successUrl?: string;
      cancelUrl?: string;
    };

    if (!bookingId || !successUrl || !cancelUrl) {
      return res.status(400).json({
        message: "bookingId, successUrl and cancelUrl are required",
      });
    }

    const booking = await Booking.findById(bookingId).populate("listing");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Ensure the booking belongs to this user
    if (booking.guest.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: Not your booking" });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({
        message: "Only confirmed bookings can be paid",
      });
    }

    if (!booking.listing) {
      return res.status(400).json({ message: "Booking listing missing" });
    }

    const listingDoc = booking.listing as any;

    const amountInPaise = Math.round(booking.totalPrice * 100); // INR

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // simple one-line item: "Stay at <title>"
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "inr",
            unit_amount: amountInPaise,
            product_data: {
              name: `Stay at ${listingDoc.title}`,
              description: listingDoc.location,
            },
          },
        },
      ],
      success_url: successUrl, // e.g. http://localhost:5173/trips
      cancel_url: cancelUrl,   // e.g. current listing detail page
      metadata: {
        bookingId: booking._id.toString(),
        listingId: listingDoc._id.toString(),
        userId: req.user.id,
      },

    });

    if (!session.url) {
      return res
        .status(500)
        .json({ message: "Stripe session created without URL" });
    }

    res.json({
      url: session.url,
    });
  } catch (error) {
    next(error);
  }
};
