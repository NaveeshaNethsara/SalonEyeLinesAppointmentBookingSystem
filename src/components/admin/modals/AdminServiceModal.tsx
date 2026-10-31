"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Check, UploadCloud, Trash2, AlertTriangle } from "lucide-react";
import { ServiceItem } from "@/types";
import { CATEGORY_META, formatDuration } from "@/lib/services";

interface AdminServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingService: ServiceItem | null;
  onSave: (data: {
    id?: string;
    name: string;
    category: ServiceItem["category"];
    categoryName: string;
    tagline: string;
    description: string;
    fullDetails?: string[];
    priceLKR: number;
    durationMinutes: number;
    durationFormatted: string;
    image: string;
    isPopular: boolean;
  }) => Promise<void>;
  showToast: (message: string, type?: "success" | "info" | "warning") => void;
}

export default function AdminServiceModal({
  isOpen,
  onClose,
  editingService,
  onSave,
  showToast,
}: AdminServiceModalProps) {
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<ServiceItem["category"]>("eyes");
  const [formTagline, setFormTagline] = useState("");
  const [formPrice, setFormPrice] = useState<number | string>(3500);
  const [formDurationMinutes, setFormDurationMinutes] = useState<number | string>(45);
  const [formDurationFormatted, setFormDurationFormatted] = useState("45 mins");
  const [formDescription, setFormDescription] = useState("");
  const [formFullDetails, setFormFullDetails] = useState("");
  const [formImage, setFormImage] = useState("/images/service_eyelines.jpg");
  const [formIsPopular, setFormIsPopular] = useState(false);
  const [formError, setFormError] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingService) {
      setFormName(editingService.name);
      setFormCategory(editingService.category);
      setFormTagline(editingService.tagline);
      setFormPrice(editingService.priceLKR);
      setFormDurationMinutes(editingService.durationMinutes);
      setFormDurationFormatted(editingService.durationFormatted);
      setFormDescription(editingService.description);
      setFormFullDetails((editingService.fullDetails || []).join("\n"));
      setFormImage(editingService.image);
      setFormIsPopular(!!editingService.isPopular);
    } else {
      setFormName("");
      setFormCategory("eyes");
      setFormTagline("Salon EyeLines Signature Craft");
      setFormPrice(4500);
      setFormDurationMinutes(45);
      setFormDurationFormatted("45 mins");
      setFormDescription("");
      setFormFullDetails(
        "Personal anatomical consultation with master specialist\nMedical-grade hygiene and sterilized implements\nHigh-definition, skin-nurturing formulation\nComplimentary aftercare consultation & guidance"
      );
      setFormImage(CATEGORY_META.eyes.defaultImage);
      setFormIsPopular(false);
    }
    setFormError("");
    setIsUploadingImage(false);
    setImageUploadError("");
  }, [editingService, isOpen]);

  if (!isOpen) return null;

  const handleCategoryChange = (newCat: ServiceItem["category"]) => {
    setFormCategory(newCat);
    const currentDefaults = Object.values(CATEGORY_META).map((m) => m.defaultImage);
    if (!formImage || currentDefaults.includes(formImage)) {
      setFormImage(CATEGORY_META[newCat].defaultImage);
    }
  };

  const handleDurationMinutesChange = (val: string) => {
    const mins = parseInt(val, 10);
    setFormDurationMinutes(val);
    if (!isNaN(mins) && mins > 0) {
      setFormDurationFormatted(formatDuration(mins));
    }
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploadError("");

    if (file.size > 10 * 1024 * 1024) {
      setImageUploadError("Image file must be under 10MB.");
      return;
    }

    // 1. Immediate local base64 preview for 0ms visual feedback
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    // 2. Upload to server API endpoint for persistent storage
    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to upload file to server");
      }

      const data = await res.json();
      if (data.url) {
        setFormImage(data.url);
        showToast("Service image uploaded successfully", "success");
      }
    } catch (err: unknown) {
      console.warn("Server upload failed, preserved offline image preview:", err);
      showToast("Service image set (offline preview)", "info");
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formName.trim()) {
      setFormError("Treatment name is required.");
      return;
    }
    const numericPrice = Number(formPrice);
    if (isNaN(numericPrice) || numericPrice < 0) {
      setFormError("Please enter a valid price in LKR (0 or higher).");
      return;
    }
    const numericDuration = Number(formDurationMinutes);
    if (isNaN(numericDuration) || numericDuration <= 0) {
      setFormError("Please enter a valid session duration in minutes (e.g. 45, 60, 90).");
      return;
    }
    if (!formDescription.trim()) {
      setFormError("Please provide a short description for clients.");
      return;
    }

    const detailsArray = formFullDetails
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const categoryInfo = CATEGORY_META[formCategory];
    setIsSaving(true);

    try {
      await onSave({
        id: editingService?.id,
        name: formName.trim(),
        category: formCategory,
        categoryName: categoryInfo.name,
        tagline: formTagline.trim() || categoryInfo.name,
        description: formDescription.trim(),
        fullDetails: detailsArray.length > 0 ? detailsArray : undefined,
        priceLKR: numericPrice,
        durationMinutes: numericDuration,
        durationFormatted: formDurationFormatted.trim() || formatDuration(numericDuration),
        image: formImage.trim() || categoryInfo.defaultImage,
        isPopular: formIsPopular,
      });
      onClose();
    } catch (err: any) {
      setFormError(err.message || "Failed to save treatment to database.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-gold-primary/40 shadow-2xl overflow-hidden my-8 animate-scale-up">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-espresso-900 to-stone-900 p-6 text-white flex justify-between items-center border-b border-gold-primary/30">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-gold-light font-semibold block">
              Salon EyeLines Catalog
            </span>
            <h3 className="font-serif text-2xl font-light text-white mt-0.5">
              {editingService ? "Edit Treatment Details" : "Add New Salon Treatment"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 max-h-[75vh] overflow-y-auto">
          {formError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Name & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 font-semibold mb-1.5">
                Treatment Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Silk Lash Extensions"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-gold-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 font-semibold mb-1.5">
                Category *
              </label>
              <select
                value={formCategory}
                onChange={(e) => handleCategoryChange(e.target.value as any)}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-gold-primary/50 bg-white"
              >
                <option value="eyes">Eyelines & Lashes</option>
                <option value="bridal">Bridal Couture</option>
                <option value="facials">Skin & Facials</option>
                <option value="hair">Hair Couture</option>
                <option value="nails">Nail Lounge</option>
              </select>
            </div>
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-600 font-semibold mb-1.5">
              Short Tagline / Subtitle
            </label>
            <input
              type="text"
              placeholder="e.g. Featherlight volume for enchanting depth"
              value={formTagline}
              onChange={(e) => setFormTagline(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-gold-primary/50"
            />
          </div>

          {/* Price & Duration Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 font-semibold mb-1.5">
                Price (LKR) *
              </label>
              <input
                type="number"
                min="0"
                step="100"
                required
                placeholder="e.g. 7500"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-gold-primary/50 font-serif"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 font-semibold mb-1.5">
                Duration (Minutes) *
              </label>
              <input
                type="number"
                min="5"
                step="5"
                required
                placeholder="e.g. 60"
                value={formDurationMinutes}
                onChange={(e) => handleDurationMinutesChange(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-gold-primary/50 font-mono"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Formatted preview: <strong>{formDurationFormatted}</strong>
              </span>
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-600 font-semibold mb-1.5">
              Short Description (Website & Cards) *
            </label>
            <textarea
              rows={2}
              required
              placeholder="Exquisite Japanese silk extensions individually applied..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-gold-primary/50 leading-relaxed"
            />
          </div>

          {/* Full Treatment Ritual Details (one per line) */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-600 font-semibold mb-1.5">
              Full Ritual Details (One bullet point per line)
            </label>
            <textarea
              rows={4}
              placeholder="Anatomical lash health assessment&#10;Complimentary anti-aging collagen eye pads&#10;Choice of Classic, Hybrid, or Russian Volume&#10;Hypoallergenic bonding resin"
              value={formFullDetails}
              onChange={(e) => setFormFullDetails(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-gold-primary/50 font-mono text-[11px] leading-relaxed"
            />
          </div>

          {/* Image Upload & Preset Picker */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-600 font-semibold mb-1.5">
              Service Showcase Photo *
            </label>

            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-gold-primary/30 space-y-3">
              {/* Image Preview Box */}
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-stone-200 border-2 border-gold-primary/40 shadow-sm flex-shrink-0">
                  {formImage ? (
                    <Image
                      src={formImage}
                      alt="Service Preview"
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                      No Photo
                    </div>
                  )}
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-semibold animate-pulse">
                      Uploading...
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <span className="text-xs font-semibold text-stone-900 block">
                    Upload Custom Photo or Choose Preset
                  </span>
                  <p className="text-[11px] text-stone-500 font-light leading-snug">
                    Upload a high-definition photo showcasing this ritual. Photos are stored persistently and displayed across all client booking flows.
                  </p>
                  {imageUploadError && (
                    <span className="text-[10px] text-red-600 font-medium block">
                      {imageUploadError}
                    </span>
                  )}
                </div>
              </div>

              {/* Upload File Button + Clear Button */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 text-gold-light hover:bg-black text-xs font-semibold tracking-wide cursor-pointer transition shadow-sm hover:shadow-md border border-gold-primary/40 active:scale-95">
                  <UploadCloud className="w-4 h-4 text-gold-primary" />
                  <span>{formImage ? "Upload / Replace Photo" : "Upload Custom Photo"}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="hidden"
                    onChange={handleImageFileUpload}
                    disabled={isUploadingImage}
                  />
                </label>

                {formImage && (
                  <button
                    type="button"
                    onClick={() => setFormImage("")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium transition cursor-pointer active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Photo</span>
                  </button>
                )}

                <span className="text-[11px] text-stone-400 font-light ml-auto">
                  Supports JPG, PNG, WebP up to 10MB
                </span>
              </div>

              {/* Curated Presets */}
              <div className="pt-2 border-t border-stone-200/80">
                <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold block mb-1.5">
                  Or Choose Salon Category Preset:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { cat: "eyes", label: "Eyelines", src: "/images/service_eyelines.jpg" },
                    { cat: "bridal", label: "Bridal Suite", src: "/images/service_bridal.jpg" },
                    { cat: "facials", label: "Skin & Facials", src: "/images/service_facial.jpg" },
                    { cat: "hair", label: "Hair Couture", src: "/images/service_hair.jpg" },
                    { cat: "nails", label: "Nails Lounge", src: "/images/service_nails.jpg" }
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset.cat}
                      onClick={() => setFormImage(preset.src)}
                      className={`text-xs py-1.5 px-2 rounded-lg border text-center transition flex items-center justify-center gap-1 cursor-pointer ${
                        formImage === preset.src
                          ? "border-gold-primary bg-gold-light/40 text-gold-deep font-semibold ring-1 ring-gold-primary shadow-sm"
                          : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                      }`}
                    >
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual URL / Path Input */}
              <div className="pt-1">
                <label className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold block mb-1">
                  Direct Image URL or Relative Path:
                </label>
                <input
                  type="text"
                  placeholder="e.g. /images/service_eyelines.jpg, /api/uploads/..., or https://..."
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-gold-primary/50 text-stone-800 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Popular / Signature Toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formIsPopular}
                onChange={(e) => setFormIsPopular(e.target.checked)}
                className="w-4 h-4 rounded text-gold-primary focus:ring-gold-primary border-stone-300"
              />
              <span className="text-xs text-stone-800 font-medium">
                Feature as <strong>Signature Offering</strong> on the salon homepage and highlight badges
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:text-stone-900 text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`btn-luxury shimmer-gold px-6 py-2.5 rounded-xl bg-gold-primary hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-wider shadow-gold inline-flex items-center gap-2 cursor-pointer ${
                isSaving ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                {isSaving
                  ? "Saving to Database..."
                  : editingService
                  ? "Update Treatment"
                  : "Save New Treatment"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
