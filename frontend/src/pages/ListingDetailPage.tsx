import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, type Listing, type Review } from "../api/client";
import { useAuth } from "../hooks/useAuth";

const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // booking state
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState<number | "">("");
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // admin/host delete
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [newRating, setNewRating] = useState<number | "">("");
  const [newComment, setNewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    api
      .getListingById(id)
      .then((res) => {
        setListing(res.listing);
      })
      .catch((err: any) => {
        setError(err.message || "Failed to load listing");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // load reviews for this listing
  useEffect(() => {
    if (!id) return;
    setReviewsLoading(true);
    setReviewsError(null);

    api
      .getListingReviews(id)
      .then((res) => {
        // assuming backend returns { items: Review[] }
        setReviews(res.items || []);
      })
      .catch((err: any) => {
        setReviewsError(err.message || "Failed to load reviews");
      })
      .finally(() => setReviewsLoading(false));
  }, [id]);

  const computeNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffMs = end.getTime() - start.getTime();
    const nights = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const nights = computeNights();
  const estimatedTotal =
    listing && nights > 0 ? listing.pricePerNight * nights : 0;

  const canManage =
    user &&
    listing &&
    (user.role === "admin" ||
      (listing.host && user.id === listing.host.toString()));

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  // -------------------------------
  // Create booking
  // -------------------------------
  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    setBookingSuccess(null);
    setBookingId(null);

    if (!user || !token) {
      setBookingError("You need to be logged in to book.");
      return;
    }

    if (!listing || !id) return;

    if (!checkIn || !checkOut || guests === "" || guests <= 0) {
      setBookingError("Please select valid dates and guests.");
      return;
    }

    setBookingLoading(true);
    try {
      const res = await api.createBooking(
        {
          listingId: id,
          checkIn,
          checkOut,
          guests: Number(guests),
        },
        token
      );

      setBookingId(res.booking.id);
      setBookingSuccess(
        "Booking created successfully! You can now proceed to payment."
      );
    } catch (err: any) {
      setBookingError(err.message || "Failed to create booking");
    } finally {
      setBookingLoading(false);
    }
  };

  // -------------------------------
  // Stripe Checkout
  // -------------------------------
  const handleStripeCheckout = async () => {
    if (!user || !token) {
      setBookingError("You need to be logged in to pay.");
      return;
    }

    if (!bookingId) {
      setBookingError("Create a booking before starting payment.");
      return;
    }

    setPaymentLoading(true);
    setBookingError(null);

    try {
      const origin = window.location.origin;

      const res = await api.createCheckoutSession(
        {
          bookingId,
          successUrl: `${origin}/trips`,
          cancelUrl: window.location.href,
        },
        token
      );

      window.location.href = res.url;
    } catch (err: any) {
      setBookingError(err.message || "Failed to start Stripe checkout");
      setPaymentLoading(false);
    }
  };

  // -------------------------------
  // Delete listing (admin or host)
  // -------------------------------
  const handleDeleteListing = async () => {
    if (!listing || !user || !token) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this listing? This cannot be undone."
    );
    if (!confirmed) return;

    setDeleteError(null);
    setDeleteLoading(true);

    try {
      await api.deleteListing(listing.id, token);
      navigate("/listings");
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete listing");
    } finally {
      setDeleteLoading(false);
    }
  };

  // -------------------------------
  // Submit review
  // -------------------------------
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user || !token) return;

    if (newRating === "" || newRating < 1 || newRating > 5 || !newComment) {
      setReviewsError("Please give a rating between 1 and 5 and a comment.");
      return;
    }

    setReviewsError(null);
    setReviewSubmitting(true);

    try {
      const res = await api.createReview(
        {
          listingId: id,
          rating: Number(newRating),
          comment: newComment,
        },
        token
      );

      // res.review is type Review
      setReviews((prev) => [res.review, ...prev]);
      setNewRating("");
      setNewComment("");
    } catch (err: any) {
      setReviewsError(err.message || "Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  // -------------------------------
  // UI Rendering
  // -------------------------------
  if (loading) {
    return <p className="text-sm text-slate-600">Loading listing…</p>;
  }

  if (error || !listing) {
    return (
      <p className="text-sm text-rose-600">{error || "Listing not found."}</p>
    );
  }

  return (
    <div className="space-y-10">
      {/* MAIN GRID: info + booking */}
      <section className="grid gap-8 lg:grid-cols-[1.7fr,1.2fr]">
        {/* LEFT COLUMN — Listing info */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            {listing.title}
          </h2>

          {/* Rating summary */}
          {averageRating != null && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium">
                ★ {averageRating.toFixed(1)}
              </span>
              <span>
                · {reviews.length} review{reviews.length === 1 ? "" : "s"}
              </span>
            </div>
          )}

          {/* Admin/Host Actions */}
          {canManage && (
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
              <button
                onClick={() => navigate(`/listings/${listing.id}/edit`)}
                className="rounded-full border border-slate-300 bg-white px-3 py-1 font-medium text-slate-800 hover:bg-slate-50"
              >
                Edit listing
              </button>

              <button
                onClick={handleDeleteListing}
                disabled={deleteLoading}
                className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 font-medium text-rose-600 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteLoading ? "Deleting…" : "Delete listing"}
              </button>

              {deleteError && (
                <span className="text-[11px] font-medium text-rose-600">
                  {deleteError}
                </span>
              )}
            </div>
          )}

          <p className="text-sm text-slate-600">{listing.location}</p>

          {/* Image */}
          <div className="space-y-2">
            <div className="h-56 w-full overflow-hidden rounded-3xl bg-linear-to-tr from-slate-200 to-slate-100">
              {listing.images && listing.images[0] && (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">
            {listing.description}
          </p>

          <p className="text-sm font-semibold text-slate-900">
            ₹{listing.pricePerNight.toLocaleString()}
            <span className="font-normal text-slate-500"> / night</span> ·{" "}
            <span className="font-normal text-slate-500">
              up to {listing.maxGuests} guests
            </span>
          </p>
        </div>

        {/* RIGHT COLUMN — Booking card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-baseline justify-between">
            <p className="text-lg font-semibold text-slate-900">
              ₹{listing.pricePerNight.toLocaleString()}
              <span className="text-xs font-normal text-slate-500">
                {" "}
                / night
              </span>
            </p>

            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Demo booking · Stripe test mode
            </p>
          </div>

          <form onSubmit={handleBook} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Check-in
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none ring-rose-100 focus:bg-white focus:ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Check-out
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none ring-rose-100 focus:bg-white focus:ring"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Guests
              </label>
              <input
                type="number"
                min={1}
                max={listing.maxGuests}
                value={guests}
                onChange={(e) =>
                  setGuests(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                placeholder={`Up to ${listing.maxGuests}`}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none ring-rose-100 focus:bg-white focus:ring"
              />
            </div>

            {nights > 0 && (
              <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-700">
                <p>
                  {nights} night{nights > 1 ? "s" : ""} × ₹
                  {listing.pricePerNight.toLocaleString()} ={" "}
                  <span className="font-semibold">
                    ₹{estimatedTotal.toLocaleString()}
                  </span>
                </p>
              </div>
            )}

            {bookingError && (
              <p className="text-xs font-medium text-rose-600">
                {bookingError}
              </p>
            )}
            {bookingSuccess && (
              <p className="text-xs font-medium text-emerald-600">
                {bookingSuccess}
              </p>
            )}

            <button
              type="submit"
              disabled={bookingLoading}
              className="inline-flex w-full items-center justify-center rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {bookingLoading ? "Creating booking…" : "Create booking"}
            </button>
          </form>

          {bookingId && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={handleStripeCheckout}
                disabled={paymentLoading}
                className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {paymentLoading
                  ? "Redirecting to Stripe…"
                  : "Pay with Stripe (test card)"}
              </button>
              <p className="mt-1 text-[11px] text-slate-500">
                Use Stripe test card{" "}
                <span className="font-mono">4242 4242 4242 4242</span> with any
                future expiry and any CVC.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* REVIEWS SECTION */}
      <section className="space-y-4 rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Reviews</h3>
            <p className="text-xs text-slate-500">
              Guests share their experiences after staying here.
            </p>
          </div>
          {averageRating != null && (
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-medium">
                ★ {averageRating.toFixed(1)}
              </span>
              <span>{reviews.length} reviews</span>
            </div>
          )}
        </div>

        {/* Write review */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          {!user ? (
            <p className="text-xs text-slate-600">
              Log in to write a review for this stay.
            </p>
          ) : (
            <form
              onSubmit={handleSubmitReview}
              className="grid gap-3 sm:grid-cols-[120px,1fr] sm:items-start"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Rating (1–5)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={newRating}
                  onChange={(e) =>
                    setNewRating(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-rose-100 focus:bg-white focus:ring"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Comment
                </label>
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-rose-100 focus:bg-white focus:ring"
                />
                <div className="flex items-center justify-between pt-1">
                  {reviewsError && (
                    <p className="text-[11px] font-medium text-rose-600">
                      {reviewsError}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="ml-auto rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {reviewSubmitting ? "Submitting…" : "Submit review"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Reviews list */}
        {reviewsLoading ? (
          <p className="text-xs text-slate-600">Loading reviews…</p>
        ) : reviews.length === 0 ? (
          <p className="text-xs text-slate-600">
            No reviews yet. Be the first to share your experience.
          </p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-700"
              >
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
                      G
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">Guest</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px]">
                    ★ {r.rating}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ListingDetailPage;
