"use client";

import { ReactNode } from "react";
import { Trash2, RotateCcw, AlertTriangle } from "lucide-react";

interface AdminConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: ReactNode;
  warningText?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "gold";
  icon?: "trash" | "reset" | "warning";
}

export default function AdminConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  warningText,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  icon = "trash",
}: AdminConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`bg-white rounded-2xl max-w-md w-full border shadow-2xl p-6 sm:p-8 space-y-4 animate-scale-up ${
          variant === "danger" ? "border-red-200" : "border-gold-primary/40"
        }`}
      >
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
            variant === "danger"
              ? "bg-red-100 text-red-600"
              : "bg-gold-light/60 text-gold-deep"
          }`}
        >
          {icon === "trash" && <Trash2 className="w-6 h-6" />}
          {icon === "reset" && <RotateCcw className="w-6 h-6" />}
          {icon === "warning" && <AlertTriangle className="w-6 h-6" />}
        </div>

        <div className="text-center space-y-1">
          <h4 className="font-serif text-2xl font-normal text-stone-900">
            {title}
          </h4>
          <div className="text-xs text-stone-600 font-light leading-relaxed">
            {description}
          </div>
          {warningText && (
            <p className="text-[11px] text-red-600 font-medium pt-1">
              {warningText}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:text-stone-900 text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-white text-xs font-semibold uppercase tracking-wider shadow-md inline-flex items-center gap-1.5 transition cursor-pointer ${
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "btn-luxury bg-gold-primary hover:bg-gold-hover shadow-gold"
            }`}
          >
            {icon === "trash" && <Trash2 className="w-4 h-4" />}
            {icon === "reset" && <RotateCcw className="w-4 h-4" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
