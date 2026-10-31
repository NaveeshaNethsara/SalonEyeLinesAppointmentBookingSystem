"use client";

import { useState } from "react";
import { X, UserPlus, AlertTriangle } from "lucide-react";

interface AdminUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateUser: (user: {
    name: string;
    email: string;
    password: string;
    role: "STAFF" | "SALON_OWNER" | "SUPER_ADMIN";
  }) => Promise<void>;
}

export default function AdminUserModal({
  isOpen,
  onClose,
  onCreateUser,
}: AdminUserModalProps) {
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"STAFF" | "SALON_OWNER" | "SUPER_ADMIN">("STAFF");
  const [userFormError, setUserFormError] = useState("");
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError("");
    if (!newUserEmail || !newUserPassword || !newUserName) {
      setUserFormError("Full name, email, and password are required.");
      return;
    }
    if (newUserPassword.length < 6) {
      setUserFormError("Password must be at least 6 characters.");
      return;
    }

    setIsCreatingUser(true);
    try {
      await onCreateUser({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
      });
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("STAFF");
      onClose();
    } catch (err: any) {
      setUserFormError(err.message || "Failed to create user in PostgreSQL.");
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-gold-primary/40 shadow-2xl overflow-hidden animate-scale-up">
        <div className="bg-gradient-to-r from-espresso-900 to-stone-900 p-6 text-white flex justify-between items-center border-b border-gold-primary/30">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-gold-light font-semibold block">
              Access Management
            </span>
            <h3 className="font-serif text-2xl font-light text-white mt-0.5">
              Create User Login Credentials
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              setUserFormError("");
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {userFormError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{userFormError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-600 font-semibold mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ishara Fernando"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-gold-primary/50"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-600 font-semibold mb-1.5">
              Email Address (Login Username)
            </label>
            <input
              type="email"
              required
              placeholder="e.g. ishara@saloneyelines.com"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-gold-primary/50"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-600 font-semibold mb-1.5">
              Access Role
            </label>
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as any)}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-gold-primary/50 bg-white"
            >
              <option value="STAFF">STAFF (Specialist / Front Desk)</option>
              <option value="SALON_OWNER">SALON_OWNER (Full Admin & Financial Access)</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN (System Superuser)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-600 font-semibold mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="Minimum 6 characters"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-gold-primary/50"
            />
            <p className="text-[11px] text-stone-500 font-light mt-1">
              Passwords are cryptographically secured with salted hashing before saving.
            </p>
          </div>

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
              disabled={isCreatingUser}
              className="btn-luxury shimmer-gold px-6 py-2.5 rounded-xl bg-gold-primary hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-wider shadow-gold inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isCreatingUser ? "Saving..." : "Create User"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
