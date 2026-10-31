import { SPECIALISTS } from "@/lib/data";
import { SpecialistItem } from "@/types";

export const SPECIALISTS_STORAGE_KEY = "salon_eyelines_specialists";

let lastSpecialistsSyncTimestamp = 0;

/**
 * Fetch latest specialists directly from the API / PostgreSQL database with live cache update
 */
export async function syncSpecialistsFromDatabase(force: boolean = false): Promise<SpecialistItem[] | null> {
  if (typeof window === "undefined") return null;
  const now = Date.now();
  if (!force && now - lastSpecialistsSyncTimestamp < 3000) return null;
  lastSpecialistsSyncTimestamp = now;

  try {
    const res = await fetch("/api/specialists", { cache: "no-store" });
    if (!res.ok) return null;
    const data: SpecialistItem[] = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      saveSpecialistsToStorage(data);
      return data;
    }
  } catch (err) {
    console.warn("Database sync for specialists deferred, using local cache:", err);
  }
  return null;
}

/**
 * Retrieve specialists list, falling back to static default SPECIALISTS
 */
export function getStoredSpecialists(): SpecialistItem[] {
  return SPECIALISTS;
}

/**
 * Update active in-memory specialists array and notify listeners
 */
export function saveSpecialistsToStorage(specialists: SpecialistItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent("salon_specialists_updated", { detail: specialists })
    );
  } catch (err) {
    console.warn("Failed to dispatch specialists update event:", err);
  }
}

/**
 * Add a new specialist item directly into the Supabase PostgreSQL Server database,
 * then updates the local cache and notifies all listeners across the website.
 */
export async function createSpecialist(
  input: Omit<SpecialistItem, "id"> & { id?: string }
): Promise<SpecialistItem> {
  const id = input.id || `spec-${Date.now().toString().slice(-5)}`;

  const payload = {
    id,
    name: input.name.trim(),
    role: input.role.trim(),
    experience: input.experience.trim() || "5+ Years Experience",
    bio: input.bio.trim() || "Dedicated salon beauty and wellness specialist at Salon EyeLines.",
    specialties:
      Array.isArray(input.specialties) && input.specialties.length > 0
        ? input.specialties
        : ["Bridal Artistry", "Aesthetic Care"],
    avatar: input.avatar?.trim() || undefined
  };

  const res = await fetch("/api/specialists", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.error || `Failed to create specialist in database (Status ${res.status})`);
  }

  const newSpecialist: SpecialistItem = await res.json();

  const current = getStoredSpecialists();
  const updated = [...current.filter((s) => s.id !== newSpecialist.id && s.id !== id), newSpecialist];
  saveSpecialistsToStorage(updated);

  return newSpecialist;
}

/**
 * Update an existing specialist item directly in Supabase PostgreSQL Server database,
 * then updates the local cache and notifies all listeners across the website.
 */
export async function updateExistingSpecialist(
  specialistId: string,
  updates: Partial<SpecialistItem>
): Promise<SpecialistItem> {
  const current = getStoredSpecialists();
  const existing = current.find((s) => s.id === specialistId) || {
    id: specialistId,
    name: updates.name || "",
    role: updates.role || "Senior Beauty Specialist",
    experience: "5+ Years Experience",
    bio: "",
    specialties: ["Bridal Artistry"]
  };

  const payload = {
    ...existing,
    ...updates,
    name: updates.name ? updates.name.trim() : existing.name,
    role: updates.role ? updates.role.trim() : existing.role,
    experience: updates.experience ? updates.experience.trim() : existing.experience,
    bio: updates.bio ? updates.bio.trim() : existing.bio,
    specialties: updates.specialties ? updates.specialties : existing.specialties,
    avatar: updates.avatar !== undefined ? updates.avatar.trim() || undefined : existing.avatar
  };

  const res = await fetch(`/api/specialists/${specialistId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.error || `Failed to update specialist in database (Status ${res.status})`);
  }

  const updatedSpecialist: SpecialistItem = await res.json();

  const nextList = current.map((s) => (s.id === specialistId ? updatedSpecialist : s));
  if (!nextList.some((s) => s.id === updatedSpecialist.id)) {
    nextList.push(updatedSpecialist);
  }
  saveSpecialistsToStorage(nextList);

  return updatedSpecialist;
}

/**
 * Delete a specialist by ID directly from Supabase PostgreSQL Server database
 */
export async function deleteSpecialistById(specialistId: string): Promise<boolean> {
  const res = await fetch(`/api/specialists/${specialistId}`, {
    method: "DELETE"
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.error || `Failed to delete specialist from database (Status ${res.status})`);
  }

  const current = getStoredSpecialists();
  const filtered = current.filter((s) => s.id !== specialistId);
  saveSpecialistsToStorage(filtered);

  return true;
}

/**
 * Restore specialists to default roster
 */
export function restoreDefaultSpecialists(): SpecialistItem[] {
  saveSpecialistsToStorage(SPECIALISTS);
  return SPECIALISTS;
}

/**
 * Reactive listener hook to listen to specialist modifications across tabs / admin updates
 */
export function subscribeToSpecialists(
  callback: (specialists: SpecialistItem[]) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const handleUpdate = () => {
    callback(getStoredSpecialists());
  };

  window.addEventListener("storage", handleUpdate);
  window.addEventListener("salon_specialists_updated", handleUpdate);

  return () => {
    window.removeEventListener("storage", handleUpdate);
    window.removeEventListener("salon_specialists_updated", handleUpdate);
  };
}
