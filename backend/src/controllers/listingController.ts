import { Request, Response, NextFunction } from "express";
import { Listing } from "../models/Listing";

const sanitizeListing = (listing: any) => ({
  id: listing._id,
  title: listing.title,
  description: listing.description,
  pricePerNight: listing.pricePerNight,
  location: listing.location,
  maxGuests: listing.maxGuests,
  host: listing.host,
  images: listing.images,
  createdAt: listing.createdAt,
  updatedAt: listing.updatedAt,
});

export const createListing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      title,
      description,
      pricePerNight,
      location,
      maxGuests,
      images,
    } = req.body as {
      title?: string;
      description?: string;
      pricePerNight?: number;
      location?: string;
      maxGuests?: number;
      images?: string[];
    };

    if (!title || !description || !location || pricePerNight == null || maxGuests == null) {
      return res.status(400).json({
        message:
          "title, description, pricePerNight, location and maxGuests are required",
      });
    }

    if (pricePerNight <= 0 || maxGuests <= 0) {
      return res
        .status(400)
        .json({ message: "pricePerNight and maxGuests must be positive" });
    }

    const normalizedImages =
      Array.isArray(images) && images.length > 0
        ? images.filter((url) => typeof url === "string")
        : [];

    const listing = await Listing.create({
      title,
      description,
      pricePerNight,
      location,
      maxGuests,
      host: req.user.id,
      images: normalizedImages,
    });

    res.status(201).json({
      listing: sanitizeListing(listing),
    });
  } catch (error) {
    next(error);
  }
};


export const getListings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Math.max(parseInt(String(req.query.page || "1"), 10), 1);
    const limit = Math.max(parseInt(String(req.query.limit || "10"), 10), 1);

    const q = (req.query.q as string | undefined)?.trim();
    const location = (req.query.location as string | undefined)?.trim();
    const minPriceRaw = req.query.minPrice as string | undefined;
    const maxPriceRaw = req.query.maxPrice as string | undefined;
    const guestsRaw = req.query.guests as string | undefined;

    const filter: Record<string, any> = {};

    // Text search across title / description / location
    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [
        { title: regex },
        { description: regex },
        { location: regex },
      ];
    }

    // Location specific filter (case-insensitive)
    if (location) {
      filter.location = new RegExp(location, "i");
    }

    // Price range filters
    const priceFilter: Record<string, number> = {};
    const minPrice = minPriceRaw ? Number(minPriceRaw) : undefined;
    const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : undefined;

    if (!Number.isNaN(minPrice) && minPrice !== undefined) {
      priceFilter.$gte = minPrice;
    }
    if (!Number.isNaN(maxPrice) && maxPrice !== undefined) {
      priceFilter.$lte = maxPrice;
    }
    if (Object.keys(priceFilter).length > 0) {
      filter.pricePerNight = priceFilter;
    }

    // Guests filter: listing must support at least this many guests
    const guests = guestsRaw ? Number(guestsRaw) : undefined;
    if (!Number.isNaN(guests) && guests !== undefined && guests > 0) {
      filter.maxGuests = { $gte: guests };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Listing.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Listing.countDocuments(filter),
    ]);

    res.json({
      items: items.map(sanitizeListing),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      filtersUsed: {
        q: q || null,
        location: location || null,
        minPrice: minPrice ?? null,
        maxPrice: maxPrice ?? null,
        guests: guests ?? null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getListingById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.json({
      listing: sanitizeListing(listing),
    });
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const isOwner = listing.host.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Forbidden: Not your listing" });
    }

    const {
      title,
      description,
      pricePerNight,
      location,
      maxGuests,
      images,
    } = req.body as {
      title?: string;
      description?: string;
      pricePerNight?: number;
      location?: string;
      maxGuests?: number;
      images?: string[];
    };

    if (title !== undefined) listing.title = title;
    if (description !== undefined) listing.description = description;
    if (location !== undefined) listing.location = location;
    if (pricePerNight !== undefined) listing.pricePerNight = pricePerNight;
    if (maxGuests !== undefined) listing.maxGuests = maxGuests;
    if (images !== undefined && Array.isArray(images)) {
      listing.images = images.filter((url) => typeof url === "string");
    }

    await listing.save();

    res.json({
      listing: sanitizeListing(listing),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const isOwner = listing.host.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Forbidden: Not your listing" });
    }

    await listing.deleteOne();

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
