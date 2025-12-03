import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const categories = [
  { id: "beach", label: "Beachfront", query: "beach" },
  { id: "mountains", label: "Mountains", query: "mountain" },
  { id: "city", label: "City breaks", query: "city" },
  { id: "rooms", label: "Private rooms", query: "room" },
  { id: "countryside", label: "Countryside", query: "countryside" },
];

const HomePage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = destination.trim();
    if (!trimmed) {
      navigate("/listings");
    } else {
      navigate(`/listings?location=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleCategoryClick = (query: string) => {
    navigate(`/listings?q=${encodeURIComponent(query)}`);
  };

  return (
    <main className="space-y-10">
      {/* Hero with search */}
      <section className="grid gap-8 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-[1.4fr,1fr] md:p-10">
        {/* Left: text + search */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight leading-tight">
              Find stays that{" "}
              <span className="text-rose-500">feel like home.</span>
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-slate-600">
              Explore unique homes, apartments, and rooms across top
              destinations. Choose your dates, confirm availability, and book
              your next trip in minutes.
            </p>
          </div>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:flex-row sm:items-center sm:px-4"
          >
            <div className="flex-1">
              <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Where
              </label>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Search destinations – e.g. Bangalore, Goa, Hyderabad"
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-end justify-end sm:w-auto">
              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-600"
              >
                Search
              </button>
            </div>
          </form>

          {/* Categories */}
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Inspiration for your next trip
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.query)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: gradient / “image” card */}
        <div className="relative flex items-center justify-center overflow-hidden rounded-3xl bg-linear-to-br from-rose-500 via-orange-400 to-amber-300 p-1">
          <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl animate-pulse" />
          <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-black/10 blur-3xl" />

          <div className="relative h-full w-full rounded-3xl bg-linear-to-br from-slate-950/80 via-slate-900/90 to-slate-800/90 p-5 text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
              Featured stay
            </p>
            <h2 className="mt-3 text-lg font-semibold">
              Test room in Bangalore
            </h2>
            <p className="mt-1 text-xs text-slate-300">
              A modern studio with fast Wi-Fi, great light, and quick access to
              cafes and co-working spaces.
            </p>

            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-200">
                ★ 4.8
              </span>
              <span className="text-xs text-slate-300">Bangalore, India</span>
            </div>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-xl font-semibold">₹2,500</span>
              <span className="text-xs text-slate-300">/ night</span>
            </div>

            <div className="mt-6 flex gap-2">
              <Link
                to="/listings"
                className="inline-flex flex-1 items-center justify-center rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-100"
              >
                View stays in Bangalore
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Session info (simple) */}
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">
          Your account
        </h3>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          {loading ? (
            <p>Checking your session…</p>
          ) : user ? (
            <p>
              Logged in as <span className="font-medium">{user.name}</span>{" "}
              ({user.role}).{" "}
              <Link
                to="/trips"
                className="text-rose-500 underline hover:text-rose-600"
              >
                View your trips
              </Link>
              .
            </p>
          ) : (
            <p>
              You&apos;re browsing as a guest.{" "}
              <Link
                to="/login"
                className="text-rose-500 underline hover:text-rose-600"
              >
                Log in
              </Link>{" "}
              or{" "}
              <Link
                to="/register"
                className="text-rose-500 underline hover:text-rose-600"
              >
                create an account
              </Link>{" "}
              to save trips and become a host.
            </p>
          )}
        </div>
      </section>
    </main>
  );
};

export default HomePage;
