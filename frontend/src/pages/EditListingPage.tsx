import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, type Listing } from "../api/client";
import { useAuth } from "../hooks/useAuth";

const EditListingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [pricePerNight, setPricePerNight] = useState<number | "">("");
  const [maxGuests, setMaxGuests] = useState<number | "">("");

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setFormError(null);

    api
      .getListingById(id)
      .then((res) => {
        const l = res.listing;
        setListing(l);
        setTitle(l.title);
        setDescription(l.description);
        setLocation(l.location);
        setPricePerNight(l.pricePerNight);
        setMaxGuests(l.maxGuests);
      })
      .catch((err: any) => {
        setFormError(err.message || "Failed to load listing");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (!user || !token) {
    return (
      <section className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Edit listing
        </h2>
        <p className="text-sm text-slate-600">
          You need to be logged in to edit a listing.
        </p>
      </section>
    );
  }

  if (loading) {
    return <p className="text-sm text-slate-600">Loading listing…</p>;
  }

  if (!listing) {
    return (
      <p className="text-sm text-rose-600">
        {formError || "Listing not found."}
      </p>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (
      !title ||
      !description ||
      !location ||
      pricePerNight === "" ||
      maxGuests === ""
    ) {
      setFormError("Please fill all fields");
      return;
    }

    setSubmitting(true);
    try {
      await api.updateListing(
        listing.id,
        {
          title,
          description,
          location,
          pricePerNight: Number(pricePerNight),
          maxGuests: Number(maxGuests),
          images: listing.images, // keep existing images
        },
        token
      );

      navigate(`/listings/${listing.id}`);
    } catch (err: any) {
      setFormError(err.message || "Failed to update listing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-xl space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Edit listing
        </h2>
        <p className="text-sm text-slate-600">
          Update details for this stay. You can adjust the title, description,
          location, price and capacity.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">
            Title<span className="text-rose-500">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-rose-100 focus:bg-white focus:ring"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">
            Description<span className="text-rose-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-rose-100 focus:bg-white focus:ring"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">
            Location<span className="text-rose-500">*</span>
          </label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-rose-100 focus:bg-white focus:ring"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Price per night (₹)<span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={pricePerNight}
              onChange={(e) =>
                setPricePerNight(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-rose-100 focus:bg-white focus:ring"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Max guests<span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={maxGuests}
              onChange={(e) =>
                setMaxGuests(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-rose-100 focus:bg-white focus:ring"
            />
          </div>
        </div>

        {formError && (
          <p className="text-xs font-medium text-rose-600">{formError}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving changes…" : "Save changes"}
        </button>
      </form>
    </section>
  );
};

export default EditListingPage;
