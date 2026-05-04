"use client";

import { useState } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

const categoryOptions = [
  { label: "Seed", value: "Seed" },
  { label: "Medicine", value: "Medicine" },
  { label: "Feed", value: "Feed" },
  { label: "Food", value: "Food" },
];

const deliveryOptions = [
  { label: "Standard Delivery", value: "Standard" },
  { label: "Express Delivery", value: "Express" },
  { label: "Cash on Delivery", value: "Cash on Delivery" },
  { label: "Pickup", value: "Pickup" },
];

export default function AddProductsPage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Seed");
  const [details, setDetails] = useState("");
  const [price, setPrice] = useState("");
  const [deliveryOption, setDeliveryOption] = useState("Standard");
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFilesChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []).slice(0, 5);
    setFiles(selectedFiles);
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim() || !category || !details.trim() || !price || !deliveryOption) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (files.length > 5) {
      toast.error("You can add up to 5 images only.");
      return;
    }

    setIsSubmitting(true);

    try {
      const imageData = await Promise.all(
        files.map((file) => convertFileToBase64(file))
      );

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          category,
          details: details.trim(),
          price: parseFloat(price),
          deliveryOption,
          images: imageData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to save product.");
      }

      toast.success("Product added successfully.");
      setName("");
      setCategory("Seed");
      setDetails("");
      setPrice("");
      setDeliveryOption("Standard");
      setFiles([]);
      event.target.reset();
    } catch (error) {
      toast.error(error.message || "Could not save product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Toaster position="top-right" />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Add New Product</h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            Add a new shop product for Seed, Medicine, Feed, or Food and save it directly to the product collection.
          </p>
        </div>
        <Link
          href="/all-products"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
        >
          View All Products
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Product Name</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              placeholder="Enter product name"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              required
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Product Details</span>
            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              className="mt-2 h-32 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 resize-none"
              placeholder="Describe the product, its benefits, and usage."
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Price</span>
            <input
              type="number"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Delivery Option</span>
            <select
              value={deliveryOption}
              onChange={(event) => setDeliveryOption(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              required
            >
              {deliveryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Product Images</span>
          <span className="mt-1 block text-xs text-slate-500">Up to 5 images. JPEG or PNG files only.</span>
          <input
            type="file"
            accept="image/png, image/jpeg"
            multiple
            onChange={handleFilesChange}
            className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:text-white"
          />
          {files.length > 0 && (
            <div className="mt-3 grid gap-2 text-sm text-slate-600">
              {files.map((file, index) => (
                <div key={`${file.name}-${index}`} className="rounded-2xl bg-slate-100 px-4 py-3">
                  {file.name}
                </div>
              ))}
            </div>
          )}
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">
            {files.length}/5 images selected
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Saving product..." : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
