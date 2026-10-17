/** Types des lignes lues depuis Supabase (régénérables avec `supabase gen types typescript`). */
export type SalonSettings = {
  name: string;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  address: string | null;
  social: { tiktok: string | null; snapchat: string | null; instagram: string | null };
  hours_note: string | null;
  legal: Record<string, string | null>;
};

export type Category = { id: string; slug: string; name: string; image_path: string | null; sort_order: number };

export type ServiceOption = {
  id: string; service_id: string; name: string; description: string | null;
  price_delta_cents: number; duration_delta_minutes: number; sort_order: number;
};

export type Service = {
  id: string; category_id: string; slug: string; name: string;
  short_description: string | null; description: string | null;
  duration_minutes: number | null; booking_url: string | null; price_cents: number; price_is_from: boolean;
  preparation_notes: string | null; image_path: string | null; sort_order: number;
  service_options?: ServiceOption[];
  service_categories?: { slug: string; name: string } | null;
};

export type Media = {
  id: string; kind: "photo" | "video"; section: string; path: string; alt: string;
  sort_order: number;
};

