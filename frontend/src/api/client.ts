const API_URL = "https://airbnb-clone-8wrz.onrender.com";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function request<T>(
  path: string,
  options: {
    method?: HttpMethod;
    body?: any;
    token?: string | null;
  } = {}
): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = (data && (data as any).message) || "Request failed";
    throw new Error(message);
  }

  return data as T;
}

// ------------ Types -------------
export type Listing = {
  id: string;
  title: string;
  description: string;
  pricePerNight: number;
  location: string;
  maxGuests: number;
  host: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
};

export type Booking = {
  id: string;
  listing: {
    id: string;
    title: string;
    location: string;
    pricePerNight: number;
  } | null;
  guest: any;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: "confirmed" | "cancelled";
  createdAt: string;
  updatedAt: string;
};

export type Review = {
  id: string;
  rating: number;
  comment: string;
  listing: string;
  author: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};


export type AdminOverview = {
  userCount: number;
  listingCount: number;
  bookingCount: number;
  reviewCount: number;
};




// ------------ API ---------------
export const api = {
  // auth
  register: (payload: { name: string; email: string; password: string }) =>
    request<{ user: any; token: string }>("/api/auth/register", {
      method: "POST",
      body: payload,
    }),
  login: (payload: { email: string; password: string }) =>
    request<{ user: any; token: string }>("/api/auth/login", {
      method: "POST",
      body: payload,
    }),
  me: (token: string) =>
    request<{ user: any }>("/api/auth/me", {
      method: "GET",
      token,
    }),

      // admin
  getAdminOverview: (token: string) =>
    request<AdminOverview>("/api/admin/overview", {
      method: "GET",
      token,
    }),



  // listings with filters
  listListings: (params: {
    page?: number;
    limit?: number;
    q?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    guests?: number;
  }) => {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.q) searchParams.set("q", params.q);
    if (params.location) searchParams.set("location", params.location);
    if (params.minPrice !== undefined)
      searchParams.set("minPrice", String(params.minPrice));
    if (params.maxPrice !== undefined)
      searchParams.set("maxPrice", String(params.maxPrice));
    if (params.guests !== undefined)
      searchParams.set("guests", String(params.guests));

    const queryString = searchParams.toString();
    const path = `/api/listings${queryString ? `?${queryString}` : ""}`;

    return request<{
      items: Listing[];
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      filtersUsed: {
        q: string | null;
        location: string | null;
        minPrice: number | null;
        maxPrice: number | null;
        guests: number | null;
      };
    }>(path);
  },

  getListingById: (id: string) =>
    request<{ listing: Listing }>(`/api/listings/${id}`),

  createListing: (
    payload: {
      title: string;
      description: string;
      pricePerNight: number;
      location: string;
      maxGuests: number;
      images?: string[];
    },
    token: string
  ) =>
    request<{ listing: Listing }>("/api/listings", {
      method: "POST",
      body: payload,
      token,
    }),


      updateListing: (
    id: string,
    payload: {
      title?: string;
      description?: string;
      pricePerNight?: number;
      location?: string;
      maxGuests?: number;
      images?: string[];
    },
    token: string
  ) =>
    request<{ listing: Listing }>(`/api/listings/${id}`, {
      method: "PUT",
      body: payload,
      token,
    }),

  deleteListing: (id: string, token: string) =>
    request<{ message?: string } | {}>(`/api/listings/${id}`, {
      method: "DELETE",
      token,
    }),

  // bookings
  createBooking: (
    payload: {
      listingId: string;
      checkIn: string;
      checkOut: string;
      guests: number;
    },
    token: string
  ) =>
    request<{ booking: Booking }>("/api/bookings", {
      method: "POST",
      body: payload,
      token,
    }),

  getMyBookings: (token: string) =>
    request<{ items: Booking[] }>("/api/bookings/me", {
      method: "GET",
      token,
    }),

  // payments (Stripe Checkout)
  createCheckoutSession: (
    payload: {
      bookingId: string;
      successUrl: string;
      cancelUrl: string;
    },
    token: string
  ) =>
    request<{ url: string }>("/api/payments/checkout-session", {
      method: "POST",
      body: payload,
      token,
    }),

  // reviews
  getListingReviews: (listingId: string) =>
    request<{
      items: Review[];
      count: number;
      averageRating: number | null;
    }>(`/api/reviews?listingId=${encodeURIComponent(listingId)}`),

  createReview: (
    payload: { listingId: string; rating: number; comment: string },
    token: string
  ) =>
    request<{ review: Review }>("/api/reviews", {
      method: "POST",
      body: payload,
      token,
    }),
};
