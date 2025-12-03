import React, { useEffect, useState } from "react";
import { api, type AdminOverview } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";

const AdminDashboardPage: React.FC = () => {
  const { user, token, loading } = useAuth();
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!user || !token || user.role !== "admin") return;

    setLoadingData(true);
    setError(null);

    api
      .getAdminOverview(token)
      .then((res) => setData(res))
      .catch((err: any) =>
        setError(err.message || "Failed to load admin overview")
      )
      .finally(() => setLoadingData(false));
  }, [user, token]);

  if (loading) {
    return <p className="text-sm text-slate-600">Checking session…</p>;
  }

  if (!user || user.role !== "admin") {
    return (
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Admin</h2>
        <p className="text-sm text-slate-600">
          You do not have permission to view this page.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Admin dashboard
          </h2>
          <p className="text-sm text-slate-600">
            Overview of users, listings, bookings and reviews on the platform.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Users</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {data?.userCount ?? (loadingData ? "…" : "0")}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Listings</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {data?.listingCount ?? (loadingData ? "…" : "0")}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Bookings</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {data?.bookingCount ?? (loadingData ? "…" : "0")}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Reviews</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {data?.reviewCount ?? (loadingData ? "…" : "0")}
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm font-medium text-rose-600">{error}</p>
      )}

      <p className="text-xs text-slate-500">
        Next steps: add pages to manage users, approve hosts, moderate reviews
        and remove problematic listings.
      </p>

      <div className="flex flex-wrap gap-3 text-xs">
        <Link
          to="/listings"
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-800 hover:bg-slate-50"
        >
          View all listings
        </Link>
        <Link
          to="/trips"
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-800 hover:bg-slate-50"
        >
          View your trips
        </Link>
      </div>
    </section>
  );
};

export default AdminDashboardPage;
