export interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  category: "eyes" | "bridal" | "facials" | "hair" | "nails";
  categoryName: string;
  tagline: string;
  description: string;
  fullDetails?: string[];
  priceLKR: number;
  durationMinutes: number;
  durationFormatted: string;
  image: string;
  isPopular?: boolean;
}

export interface SpecialistItem {
  id: string;
  name: string;
  role: string;
  experience: string;
  bio: string;
  specialties: string[];
  avatar?: string;
}

export interface HighlightItem {
  number: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface AppointmentRecord {
  id: string;
  referenceCode: string;
  serviceId: string;
  serviceName: string;
  staffId: string;
  staffName: string;
  date: string;
  time: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  occasion: string;
  specialNotes?: string;
  totalPriceLKR: number;
  status: "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "PENDING_DEPOSIT";
  createdAt: string;
  depositRequiredLKR?: number;
  depositPaidLKR?: number;
  depositSlipUrl?: string;
  depositVerifiedAt?: string;
}

export interface AdminUserRecord {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}
