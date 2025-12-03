import React, { useEffect, useState } from "react";
import { api, type Booking } from "../api/client";
import { useAuth } from "../hooks/useAuth";

const MyTripsPage: React.FC = () => {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    api
      .getMyBookings(token)
      .then((res) => setBookings(res.items))
      .catch((err: any) => setError(err.message || "Failed to load bookings"))
      .finally(() => setLoading(false));
  }, [token]);

  if (!user || !token) {
    return (
      <section className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">My trips</h2>
        <p className="text-sm text-slate-600">
          Log in to view your trips and bookings.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">My trips</h2>
        <p className="text-sm text-slate-600">
          All bookings you have made as a guest.
        </p>
      </div>

      {loading && (
        <p className="text-sm text-slate-600">Loading your bookings…</p>
      )}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      {!loading && !error && bookings.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
          You don&apos;t have any trips yet. Find a place on{" "}
          <span className="font-medium">Listings</span> and book your first
          stay.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bookings.map((b) => {
          const listing = b.listing;
          return (
            <article
              key={b.id}
              className="rounded-3xl border border-slate-200 bg-white p-4 text-xs shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {listing ? listing.title : "Listing removed"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {listing?.location}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    b.status === "confirmed"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {b.status}
                </span>
              </div>

              <p className="text-[11px] text-slate-600">
                {new Date(b.checkIn).toLocaleDateString()} →{" "}
                {new Date(b.checkOut).toLocaleDateString()}
              </p>
              <p className="text-[11px] text-slate-600">
                {b.guests} guests · Total{" "}
                <span className="font-semibold text-slate-900">
                  ₹{b.totalPrice.toLocaleString()}
                </span>
              </p>

              <p className="mt-2 text-[10px] text-slate-400">
                Booked on {new Date(b.createdAt).toLocaleDateString()}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default MyTripsPage;
