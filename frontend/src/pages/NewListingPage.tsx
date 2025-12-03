import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../hooks/useAuth";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

const NewListingPage: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerNight, setPricePerNight] = useState<number | "">("");
  const [location, setLocation] = useState("");
  const [maxGuests, setMaxGuests] = useState<number | "">("");

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user || !token) {
    return (
      <section className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Create listing
        </h2>
        <p className="text-sm text-slate-600">
          You need to be logged in to create a listing. Please log in or sign
          up first.
        </p>
      </section>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);

    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      throw new Error(
        "Image upload is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET."
      );
    }

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await res.json();
    if (!data.secure_url) {
      throw new Error("Upload response missing secure_url");
    }

    return data.secure_url as string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !title ||
      !description ||
      !location ||
      pricePerNight === "" ||
      maxGuests === ""
    ) {
      setError("Please fill all fields");
      return;
    }

    setSubmitting(true);
    try {
      // Upload images if any selected
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        imageUrls = await Promise.all(
          imageFiles.map((file) => uploadImageToCloudinary(file))
        );
      }

      await api.createListing(
        {
          title,
          description,
          pricePerNight: Number(pricePerNight),
          location,
          maxGuests: Number(maxGuests),
          images: imageUrls,
        },
        token
      );

      navigate("/listings");
    } catch (err: any) {
      setError(err.message || "Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-xl space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          List your place
        </h2>
        <p className="text-sm text-slate-600">
          Add details and upload a few photos. Later you can extend this with
          amenities and calendar controls.
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
            placeholder="Cozy studio in Hyderabad"
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
            placeholder="Describe the space, neighbourhood, highlights…"
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
            placeholder="Bangalore, India"
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
              placeholder="1500"
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
              placeholder="2"
            />
          </div>
        </div>

        {/* Image upload */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">
            Photos
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-slate-800"
          />
          <p className="text-[11px] text-slate-500">
            You can select multiple images. They will be uploaded to
            Cloudinary when you create the listing.
          </p>
        </div>

        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-2">
            {imagePreviews.map((src, idx) => (
              <div
                key={idx}
                className="aspect-square overflow-hidden rounded-xl border border-slate-200"
              >
                <img
                  src={src}
                  alt={`preview-${idx}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-xs font-medium text-rose-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Creating listing…" : "Create listing"}
        </button>
      </form>
    </section>
  );
};

export default NewListingPage;
