import { SERVICES } from "@/lib/data";
import { ServiceItem } from "@/types";

export const SERVICES_STORAGE_KEY = "salon_eyelines_services";

export const CATEGORY_META: Record<
  ServiceItem["category"],
  { name: string; defaultImage: string; label: string }
> = {
  eyes: {
    name: "Eyelines & Lash Lounge",
    defaultImage: "/images/service_eyelines.jpg",
    label: "Eyelines & Lashes"
  },
  bridal: {
    name: "Bridal Couture Suite",
    defaultImage: "/images/service_bridal.jpg",
    label: "Bridal Couture"
  },
  facials: {
    name: "Skin Glow & Facials",
    defaultImage: "/images/service_facial.jpg",
    label: "Skin Glow & Facials"
  },
  hair: {
    name: "Hair Couture & Care",
    defaultImage: "/images/service_hair.jpg",
    label: "Hair Couture & Care"
  },
  nails: {
    name: "Nail Lounge & Spa",
    defaultImage: "/images/service_nails.jpg",
    label: "Nail Lounge & Spa"
  }
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} mins`;
  const hours = minutes / 60;
  if (Number.isInteger(hours)) {
    return hours === 1 ? "60 mins" : `${hours} hours`;
  }
  return `${hours.toFixed(1).replace(/\.0$/, "")} hours`;
}

let lastServicesSyncTimestamp = 0;

/**
 * Fetch latest services directly from Supabase PostgreSQL API with live cache update
 */
export async function syncServicesFromDatabase(force: boolean = false): Promise<ServiceItem[] | null> {
  if (typeof window === "undefined") return null;
  const now = Date.now();
  if (!force && now - lastServicesSyncTimestamp < 3000) return null;
  lastServicesSyncTimestamp = now;

  try {
    const res = await fetch("/api/services", { cache: "no-store" });
    if (!res.ok) return null;
    const data: ServiceItem[] = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      saveServicesToStorage(data);
      return data;
    }
  } catch (err) {
    console.warn("Database sync deferred, using local cache:", err);
  }
  return null;
}

/**
 * Retrieve services list, falling back to static default SERVICES
 */
export function getStoredServices(): ServiceItem[] {
  return SERVICES;
}

/**
 * Update active in-memory services array and notify listeners
 */
export function saveServicesToStorage(services: ServiceItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent("salon_services_updated", { detail: services })
    );
  } catch (err) {
    console.warn("Failed to dispatch services update event:", err);
  }
}

/**
 * Add a new service item directly into the Supabase PostgreSQL Server database,
 * then updates the local cache and notifies all listeners across the website.
 */
export async function createService(
  input: Omit<ServiceItem, "id" | "slug" | "categoryName"> & {
    id?: string;
    slug?: string;
    categoryName?: string;
  }
): Promise<ServiceItem> {
  const current = getStoredServices();
  const cat = input.category;
  const categoryMeta = CATEGORY_META[cat] || {
    name: "Aesthetic Care",
    defaultImage: "/images/service_eyelines.jpg",
    label: "Aesthetic"
  };

  const id = input.id || `srv-${cat}-${Date.now().toString().slice(-5)}`;
  const baseSlug = input.slug || slugify(input.name);
  let uniqueSlug = baseSlug;
  let counter = 1;
  while (current.some((s) => s.slug === uniqueSlug && s.id !== id)) {
    uniqueSlug = `${baseSlug}-${counter++}`;
  }

  const payload = {
    id,
    name: input.name.trim(),
    slug: uniqueSlug,
    category: input.category,
    categoryName: input.categoryName || categoryMeta.name,
    tagline: input.tagline.trim(),
    description: input.description.trim(),
    fullDetails: input.fullDetails && input.fullDetails.length > 0 ? input.fullDetails : [
      "Custom consultation tailored to client features",
      "Medical-grade hygiene and sterilized implements",
      "Premium formulations for radiant, enduring results"
    ],
    priceLKR: Number(input.priceLKR) || 0,
    durationMinutes: Number(input.durationMinutes) || 60,
    durationFormatted: input.durationFormatted?.trim() || formatDuration(Number(input.durationMinutes) || 60),
    image: input.image || categoryMeta.defaultImage,
    isPopular: !!input.isPopular
  };

  // Persist directly to Supabase PostgreSQL database
  const res = await fetch("/api/services", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.error || `Failed to create service in database (Status ${res.status})`);
  }

  const newService: ServiceItem = await res.json();

  // Update local cache and broadcast to all tabs
  const updated = [newService, ...current.filter((s) => s.id !== newService.id && s.id !== id)];
  saveServicesToStorage(updated);

  return newService;
}

/**
 * Update an existing service item directly in Supabase PostgreSQL Server database,
 * then updates the local cache and notifies all listeners across the website.
 */
export async function updateExistingService(
  serviceId: string,
  updates: Partial<ServiceItem>
): Promise<ServiceItem> {
  const current = getStoredServices();
  const existing = current.find((s) => s.id === serviceId) || {
    id: serviceId,
    category: updates.category || "eyes",
    categoryName: "Aesthetic Care",
    image: "/images/service_eyelines.jpg",
    durationFormatted: "60 mins"
  };

  const category = updates.category || existing.category;
  const categoryMeta = CATEGORY_META[category];

  const payload: Partial<ServiceItem> = {
    ...updates,
    category,
    categoryName: updates.categoryName || categoryMeta?.name || existing.categoryName,
    image: updates.image || existing.image || categoryMeta?.defaultImage || "/images/service_eyelines.jpg",
    durationFormatted:
      updates.durationFormatted ||
      (updates.durationMinutes
        ? formatDuration(updates.durationMinutes)
        : existing.durationFormatted)
  };

  // Direct persistence to Supabase PostgreSQL database
  const res = await fetch(`/api/services/${serviceId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.error || `Failed to update service in database (Status ${res.status})`);
  }

  const updatedService: ServiceItem = await res.json();

  const nextList = current.map((s) => (s.id === serviceId ? updatedService : s));
  if (!nextList.some((s) => s.id === updatedService.id)) {
    nextList.unshift(updatedService);
  }
  saveServicesToStorage(nextList);

  return updatedService;
}

/**
 * Delete a service by its ID from Supabase PostgreSQL Server database
 */
export async function deleteServiceById(serviceId: string): Promise<boolean> {
  const res = await fetch(`/api/services/${serviceId}`, {
    method: "DELETE"
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.error || `Failed to delete service from database (Status ${res.status})`);
  }

  const current = getStoredServices();
  const filtered = current.filter((s) => s.id !== serviceId && s.slug !== serviceId);
  saveServicesToStorage(filtered);

  return true;
}

/**
 * Reset catalog back to pristine 12 salon offerings
 */
export function restoreDefaultServices(): ServiceItem[] {
  saveServicesToStorage(SERVICES);
  return SERVICES;
}

/**
 * Hook or helper to subscribe to service catalog modifications
 */
export function subscribeToServices(
  callback: (services: ServiceItem[]) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const handleUpdate = () => {
    callback(getStoredServices());
  };

  window.addEventListener("storage", handleUpdate);
  window.addEventListener("salon_services_updated", handleUpdate);

  return () => {
    window.removeEventListener("storage", handleUpdate);
    window.removeEventListener("salon_services_updated", handleUpdate);
  };
}
