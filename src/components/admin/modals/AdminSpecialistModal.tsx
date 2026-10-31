"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Camera, AlertTriangle } from "lucide-react";
import { SpecialistItem } from "@/types";

interface AdminSpecialistModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSpecialist: SpecialistItem | null;
  onSave: (data: {
    id?: string;
    name: string;
    role: string;
    experience: string;
    bio: string;
    specialties: string[];
    avatar?: string;
  }) => Promise<void>;
}

export default function AdminSpecialistModal({
  isOpen,
  onClose,
  editingSpecialist,
  onSave,
}: AdminSpecialistModalProps) {
  const [specFormName, setSpecFormName] = useState("");
  const [specFormRole, setSpecFormRole] = useState("Senior Beauty Specialist");
  const [specFormExperience, setSpecFormExperience] = useState("5+ Years Experience");
  const [specFormBio, setSpecFormBio] = useState("");
  const [specFormSpecialties, setSpecFormSpecialties] = useState("");
  const [specFormAvatar, setSpecFormAvatar] = useState("");
  const [specFormError, setSpecFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingSpecialist) {
      setSpecFormName(editingSpecialist.name);
      setSpecFormRole(editingSpecialist.role);
      setSpecFormExperience(editingSpecialist.experience);
      setSpecFormBio(editingSpecialist.bio);
      setSpecFormSpecialties((editingSpecialist.specialties || []).join(", "));
      setSpecFormAvatar(editingSpecialist.avatar || "");
    } else {
      setSpecFormName("");
      setSpecFormRole("Senior Beauty Specialist");
      setSpecFormExperience("5+ Years Experience");
      setSpecFormBio("");
      setSpecFormSpecialties("Bridal Artistry, Eye Styling, Lash Care");
      setSpecFormAvatar("");
    }
    setSpecFormError("");
  }, [editingSpecialist, isOpen]);

  if (!isOpen) return null;

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setSpecFormError("Photo file must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSpecFormAvatar(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSpecFormError("");

    if (!specFormName.trim()) {
      setSpecFormError("Specialist name is required.");
      return;
    }
    if (!specFormRole.trim()) {
      setSpecFormError("Professional title or role is required.");
      return;
    }

    const specialtiesArray = specFormSpecialties
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    setIsSaving(true);
    try {
      await onSave({
        id: editingSpecialist?.id,
        name: specFormName.trim(),
        role: specFormRole.trim(),
        experience: specFormExperience.trim() || "5+ Years Experience",
        bio: specFormBio.trim() || "Dedicated stylist at Salon EyeLines.",
        specialties: specialtiesArray.length > 0 ? specialtiesArray : ["Aesthetic Care"],
        avatar: specFormAvatar.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setSpecFormError(err.message || "Failed to persist specialist to database.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 border border-gold-primary/30 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto animate-scale-up">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-6">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-gold-deep font-semibold block">
              {editingSpecialist ? "Edit Profile" : "New Team Member"}
            </span>
            <h3 className="font-serif text-2xl text-stone-900 font-medium">
              {editingSpecialist ? "Update Beauty Specialist" : "Add Beauty Specialist"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {specFormError && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{specFormError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Preview & Upload */}
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-gold-primary/30 flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gold-light border-2 border-gold-primary flex items-center justify-center font-serif text-2xl font-bold text-gold-deep flex-shrink-0 overflow-hidden relative shadow-sm">
              {specFormAvatar ? (
                <Image
                  src={specFormAvatar}
                  alt={specFormName || "Preview"}
                  fill
                  sizes="80px"
                  className="object-cover object-top"
                />
              ) : (
                (specFormName.trim()
                  ? specFormName.split(" ").map((n) => n[0]).slice(0, 2).join("")
                  : "SP")
              )}
            </div>
            <div className="flex-1 space-y-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-stone-700 block">
                Specialist Profile Photo
              </span>
              <p className="text-[11px] text-stone-500 font-light leading-tight">
                Displayed on the booking concierge and about page. Enter image path/URL or pick a preset.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSpecFormAvatar("/images/nayani_munasinghe.jpg")}
                  className="text-[10px] bg-white border border-gold-primary/40 hover:bg-gold-primary hover:text-white px-2.5 py-1 rounded font-medium transition cursor-pointer"
                >
                  Founder Photo (Nayani)
                </button>
                {specFormAvatar && (
                  <button
                    type="button"
                    onClick={() => setSpecFormAvatar("")}
                    className="text-[10px] bg-white border border-red-200 text-red-600 hover:bg-red-50 px-2 py-1 rounded font-medium transition cursor-pointer"
                  >
                    Remove Photo
                  </button>
                )}
                <label className="text-[10px] bg-stone-900 text-gold-light hover:bg-black px-2.5 py-1 rounded font-medium transition inline-flex items-center gap-1 cursor-pointer">
                  <Camera className="w-3 h-3" />
                  <span>Upload File</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarFileUpload}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Photo URL Input */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1.5">
              Image URL / Relative Path
            </label>
            <input
              type="text"
              placeholder="e.g. /images/nayani_munasinghe.jpg or https://..."
              value={specFormAvatar}
              onChange={(e) => setSpecFormAvatar(e.target.value)}
              className="w-full p-3 rounded-lg border border-stone-300 bg-white text-stone-800 text-xs focus:outline-none focus:ring-1 focus:ring-gold-primary"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Nayani Munasinghe"
              value={specFormName}
              onChange={(e) => setSpecFormName(e.target.value)}
              className="w-full p-3 rounded-lg border border-stone-300 bg-white text-stone-800 text-xs focus:outline-none focus:ring-1 focus:ring-gold-primary"
            />
          </div>

          {/* Role / Title */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1.5">
              Professional Role / Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Founder & Master Bridal Director, Senior Lash Artist"
              value={specFormRole}
              onChange={(e) => setSpecFormRole(e.target.value)}
              className="w-full p-3 rounded-lg border border-stone-300 bg-white text-stone-800 text-xs focus:outline-none focus:ring-1 focus:ring-gold-primary"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[
                "Founder & Master Bridal Director",
                "Senior Eyeliner & Lash Artist",
                "Lead Hair Stylist & Colorist",
                "Senior Aesthetician & Nail Artist"
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSpecFormRole(preset)}
                  className="text-[10px] bg-stone-100 hover:bg-gold-light/40 border border-stone-200 px-2 py-0.5 rounded text-stone-700 transition cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1.5">
              Experience Level
            </label>
            <input
              type="text"
              placeholder="e.g. 15+ Years Experience"
              value={specFormExperience}
              onChange={(e) => setSpecFormExperience(e.target.value)}
              className="w-full p-3 rounded-lg border border-stone-300 bg-white text-stone-800 text-xs focus:outline-none focus:ring-1 focus:ring-gold-primary"
            />
          </div>

          {/* Specialties */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1.5">
              Specialties (Comma Separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Royal Kandyan Dressing, Airbrush Makeup, Lash Lifts"
              value={specFormSpecialties}
              onChange={(e) => setSpecFormSpecialties(e.target.value)}
              className="w-full p-3 rounded-lg border border-stone-300 bg-white text-stone-800 text-xs focus:outline-none focus:ring-1 focus:ring-gold-primary"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1.5">
              Professional Biography
            </label>
            <textarea
              rows={3}
              placeholder="Short client-facing description of the stylist's qualifications and artistic philosophy..."
              value={specFormBio}
              onChange={(e) => setSpecFormBio(e.target.value)}
              className="w-full p-3 rounded-lg border border-stone-300 bg-white text-stone-800 text-xs focus:outline-none focus:ring-1 focus:ring-gold-primary"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-luxury shimmer-gold bg-gold-primary hover:bg-gold-hover text-white px-6 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition shadow-sm cursor-pointer disabled:opacity-60"
            >
              {isSaving ? "Saving..." : editingSpecialist ? "Save Changes" : "Create Specialist"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
