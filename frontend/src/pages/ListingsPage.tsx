import React, { useEffect, useState } from "react";
import { api, type Listing } from "../api/client";
import { Link, useLocation } from "react-router-dom";

type ListingFilters = {
  q: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  guests: string;
};

const ListingsPage: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const limit = 6;

  // Filter UI state
  const [formFilters, setFormFilters] = useState<ListingFilters>({
    q: "",
    location: "",
    minPrice: "",
    maxPrice: "",
    guests: "",
  });

  // Filters actually applied to API
  const [activeFilters, setActiveFilters] = useState<ListingFilters>({
    q: "",
    location: "",
    minPrice: "",
    maxPrice: "",
    guests: "",
  });

  const [showFilters, setShowFilters] = useState(false);

  const routerLocation = useLocation();

  // Initialize filters from URL query params once
  useEffect(() => {
    const params = new URLSearchParams(routerLocation.search);
    const urlLocation = params.get("location") || "";
    const urlQ = params.get("q") || "";

    if (urlLocation || urlQ) {
      setFormFilters((prev) => ({
        ...prev,
        location: urlLocation || prev.location,
        q: urlQ || prev.q,
      }));
      setActiveFilters((prev) => ({
        ...prev,
        location: urlLocation || prev.location,
        q: urlQ || prev.q,
      }));
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    api
      .listListings({
        page,
        limit,
        q: activeFilters.q || undefined,
        location: activeFilters.location || undefined,
        minPrice:
          activeFilters.minPrice !== ""
            ? Number(activeFilters.minPrice)
            : undefined,
        maxPrice:
          activeFilters.maxPrice !== ""
            ? Number(activeFilters.maxPrice)
            : undefined,
        guests:
          activeFilters.guests !== ""
            ? Number(activeFilters.guests)
            : undefined,
      })
      .then((res) => {
        setListings(res.items);
        setTotalPages(res.totalPages || 1);
        setTotal(res.total || 0);
      })
      .catch((err: any) => {
        setError(err.message || "Failed to load listings");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page, activeFilters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveFilters(formFilters);
    setPage(1);
  };

  const handleClearFilters = () => {
    const cleared: ListingFilters = {
      q: "",
      location: "",
      minPrice: "",
      maxPrice: "",
      guests: "",
    };
    setFormFilters(cleared);
    setActiveFilters(cleared);
    setPage(1);
  };

  const anyFilterActive =
    activeFilters.q ||
    activeFilters.location ||
    activeFilters.minPrice ||
    activeFilters.maxPrice ||
    activeFilters.guests;

  const categories = [
    "Beach",
    "Mountains",
    "City",
    "Rooms",
    "Heritage",
    "Villas",
    "Backwaters",
  ];

  return (
    <section className="space-y-6">
      {/* Header + results count */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Explore stays</h2>
          <p className="text-sm text-slate-600">
            Find places to stay across popular cities and destinations.
          </p>
        </div>
        <div className="text-xs text-slate-500">
          {loading ? (
            <span>Loading…</span>
          ) : (
            <span>
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {listings.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">{total}</span>{" "}
              results
              {anyFilterActive ? " (filtered)" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Top search bar + filter icon */}
      <div className="flex items-center gap-3">
        <form
          onSubmit={handleApplyFilters}
          className="flex flex-1 items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm shadow-sm hover:shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-5 w-5 text-slate-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z"
            />
          </svg>
          <input
            name="q"
            value={formFilters.q}
            onChange={handleFilterChange}
            placeholder="Search destinations, titles or descriptions"
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
          {anyFilterActive && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Clear
            </button>
          )}
        </form>

        <button
          type="button"
          onClick={() => setShowFilters(true)}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-3 shadow-sm hover:bg-slate-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-5 w-5 text-slate-800"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M6 12h12m-9 5.25h6"
            />
          </svg>
        </button>
      </div>

      {/* Categories row (quick search) */}
      <div className="flex gap-4 overflow-x-auto pb-2 pt-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() =>
              setFormFilters((prev) => ({
                ...prev,
                q: cat,
              }))
            }
            className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filters modal */}
      {showFilters && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <form
            onSubmit={(e) => {
              handleApplyFilters(e);
              setShowFilters(false);
            }}
            className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="text-sm text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Location
              </label>
              <input
                name="location"
                value={formFilters.location}
                onChange={handleFilterChange}
                placeholder="Bangalore, Hyderabad…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-rose-100 focus:bg-white focus:ring"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Min price (₹)
                </label>
                <input
                  name="minPrice"
                  type="number"
                  min={0}
                  value={formFilters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="1000"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-rose-100 focus:bg-white focus:ring"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Max price (₹)
                </label>
                <input
                  name="maxPrice"
                  type="number"
                  min={0}
                  value={formFilters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="4000"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-rose-100 focus:bg-white focus:ring"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Guests
              </label>
              <input
                name="guests"
                type="number"
                min={1}
                value={formFilters.guests}
                onChange={handleFilterChange}
                placeholder="2"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-rose-100 focus:bg-white focus:ring"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  handleClearFilters();
                  setShowFilters(false);
                }}
                className="text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Clear all
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Apply filters
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Results */}
      {loading && (
        <p className="text-sm text-slate-600">Loading listings…</p>
      )}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      {!loading && !error && listings.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
          No listings match these filters. Try adjusting your search or clearing
          filters.
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <Link key={listing.id} to={`/listings/${listing.id}`}>
            <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="relative h-40 w-full overflow-hidden rounded-3xl bg-linear-to-tr from-slate-200 to-slate-100">
                {listing.images && listing.images[0] && (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                )}
                <div className="absolute right-3 top-3 rounded-full bg-black/70 px-2 py-1 text-[10px] font-medium text-white">
                  {listing.location}
                </div>
              </div>

              <div className="space-y-1.5 p-3">
                <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">
                  {listing.title}
                </h3>
                <p className="line-clamp-2 text-xs text-slate-600">
                  {listing.description}
                </p>
                <p className="pt-1 text-sm font-semibold text-slate-900">
                  ₹{listing.pricePerNight.toLocaleString()}{" "}
                  <span className="text-xs font-normal text-slate-500">
                    / night · {listing.maxGuests} guests
                  </span>
                </p>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs text-slate-600">
            Page{" "}
            <span className="font-semibold text-slate-900">{page}</span> of{" "}
            <span className="font-semibold text-slate-900">
              {totalPages}
            </span>
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default ListingsPage;
