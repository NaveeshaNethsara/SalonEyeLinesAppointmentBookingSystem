"use client";

import { UserPlus, Trash2 } from "lucide-react";
import { AdminUserRecord } from "@/types";

interface AdminUsersTabProps {
  dbUsers: AdminUserRecord[];
  currentUser: { id: string; email: string; name: string; role: string } | null;
  onOpenCreateUser: () => void;
  onOpenDeleteUser: (user: AdminUserRecord) => void;
}

export default function AdminUsersTab({
  dbUsers,
  currentUser,
  onOpenCreateUser,
  onOpenDeleteUser,
}: AdminUsersTabProps) {
  const isSuperAdminOrOwner =
    currentUser?.role === "SALON_OWNER" || currentUser?.role === "SUPER_ADMIN";

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gold-primary/30 shadow-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-gold-deep font-semibold block">
            Access Control & Personnel
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-light text-stone-900 mt-0.5">
            Authorized Admin & Staff Logins
          </h3>
          <p className="text-xs text-stone-500 font-light mt-1 max-w-2xl">
            Manage authorized access and roles for stylists, managers, and salon administrators.
          </p>
        </div>

        {isSuperAdminOrOwner && (
          <button
            type="button"
            onClick={onOpenCreateUser}
            className="btn-luxury shimmer-gold bg-gold-primary hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-wider px-5 py-3 rounded-xl shadow-gold inline-flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add System User</span>
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gold-primary/30 shadow-card overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h4 className="font-serif text-lg font-normal text-stone-900">System Users</h4>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gold-light text-gold-deep font-semibold">
              {dbUsers.length} Recorded
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-[#FAF7F2] text-stone-900 uppercase font-semibold border-b border-gold-primary/20 tracking-wider">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {dbUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-400 italic font-light">
                    No users registered in system.
                  </td>
                </tr>
              ) : (
                dbUsers.map((u) => {
                  const isSelf =
                    !!currentUser &&
                    ((currentUser.id && u.id === currentUser.id) ||
                      (currentUser.email &&
                        u.email.toLowerCase() === currentUser.email.toLowerCase()));
                  const canDelete = isSuperAdminOrOwner && !isSelf;

                  return (
                    <tr key={u.id} className="hover:bg-gold-light/20 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gold-light border border-gold-primary/40 flex items-center justify-center font-serif text-xs font-bold text-gold-deep flex-shrink-0">
                            {u.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </div>
                          <div>
                            <span className="font-semibold text-stone-900 block">{u.name}</span>
                            <span className="text-[11px] text-stone-500 font-mono">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${
                            u.role === "SALON_OWNER"
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : u.role === "SUPER_ADMIN"
                              ? "bg-purple-100 text-purple-900 border border-purple-300"
                              : "bg-blue-100 text-blue-900 border border-blue-300"
                          }`}
                        >
                          {u.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4 text-stone-500 font-light">
                        {new Date(u.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-green-700 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Active
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {isSelf ? (
                          <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-500 border border-stone-200">
                            Current Session
                          </span>
                        ) : canDelete ? (
                          <button
                            type="button"
                            onClick={() => onOpenDeleteUser(u)}
                            className="px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-semibold transition inline-flex items-center gap-1 cursor-pointer"
                            title={`Delete ${u.name}'s account`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
