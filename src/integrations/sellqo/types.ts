// === PRODUCTS ===
export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  short_description?: string;
  price: number;
  compare_at_price?: number;
  currency: string;
  images: ProductImage[];
  variants: ProductVariant[];
  collection?: string;
  collections?: string[];
  category?: Category;
  tags?: string[];
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  stock_quantity?: number;
  sku?: string;
  barcode?: string;
  weight?: number;
  weight_unit?: string;
  seo?: SEOData;
  reviews_summary?: ReviewsSummary;
  related_products?: string[];
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  position: number;
  width?: number;
  height?: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku?: string;
  price: number;
  compare_at_price?: number;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  stock_quantity?: number;
  options: Record<string, string>;
  image?: ProductImage;
}

// === COLLECTIONS / CATEGORIES ===
export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  product_count?: number;
  parent_id?: string;
  position: number;
}

export interface Collection {
  id: string;
  slug: string;
  title: string;
  description?: string;
  image?: string;
  products?: Product[];
  product_count?: number;
}

// === CART ===
export interface CartItem {
  id: string;
  product_id: string;
  variant_id: string;
  title: string;
  variant_title: string;
  price: number;
  quantity: number;
  image?: string;
  max_quantity?: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  item_count: number;
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  discount_code?: string;
  free_shipping_eligible?: boolean;
  free_shipping_remaining?: number;
}

// === CHECKOUT ===
export interface CheckoutSession {
  id: string;
  checkout_url: string;
  cart_id: string;
  status: 'pending' | 'completed' | 'cancelled';
}

// === GIFT CARDS ===
export interface GiftCard {
  id: string;
  code?: string;
  amount: number;
  balance: number;
  currency: string;
  status: 'active' | 'used' | 'expired';
  expires_at?: string;
}

// === PAGES ===
export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  content_plain?: string;
  type: 'static' | 'legal';
  seo?: SEOData;
  updated_at: string;
}

// === NAVIGATION ===
export interface NavigationMenu {
  main: NavigationItem[];
  footer: NavigationItem[];
  announcement?: AnnouncementBar;
}

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  children?: NavigationItem[];
  is_external?: boolean;
}

export interface AnnouncementBar {
  text: string;
  link?: string;
  link_text?: string;
  background_color?: string;
  text_color?: string;
  is_visible: boolean;
}

// === REVIEWS ===
export interface Review {
  id: string;
  platform: string;
  author: string;
  rating: number;
  title?: string;
  content: string;
  product_id?: string;
  created_at: string;
  is_verified?: boolean;
}

export interface ReviewsSummary {
  average_rating: number;
  total_count: number;
  distribution: Record<number, number>;
}

// === SETTINGS ===
export interface StorefrontSettings {
  social: SocialLinks;
  trust: TrustSettings;
  conversion: ConversionSettings;
  tracking: TrackingSettings;
  checkout: CheckoutSettings;
  newsletter: NewsletterSettings;
  languages: LanguageSettings;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
}

export interface TrustSettings {
  cookie_banner: {
    enabled: boolean;
    text: string;
    accept_text: string;
    decline_text: string;
  };
  badges: TrustBadge[];
  usps: string[];
}

export interface TrustBadge {
  name: string;
  image?: string;
  url?: string;
}

export interface ConversionSettings {
  stock_urgency: {
    enabled: boolean;
    threshold: number;
  };
  recent_purchases: {
    enabled: boolean;
  };
  free_shipping_bar: {
    enabled: boolean;
    threshold: number;
    currency: string;
  };
}

export interface TrackingSettings {
  [key: string]: unknown;
}

export interface CheckoutSettings {
  mode: 'hosted' | 'embedded';
  guest_checkout: boolean;
  phone_required: boolean;
  company_field: 'hidden' | 'optional' | 'required';
  address_autocomplete: boolean;
  success_url?: string;
  cancel_url?: string;
}

export interface NewsletterSettings {
  enabled: boolean;
  double_optin: boolean;
  popup?: {
    enabled: boolean;
    delay_seconds: number;
    title: string;
    description: string;
    button_text: string;
  };
}

export interface LanguageSettings {
  available: { code: string; name: string; flag?: string }[];
  default: string;
}

export interface SEOData {
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
}

// === API RESPONSE WRAPPERS ===
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ProductsParams {
  collection?: string;
  category?: string;
  category_slug?: string;
  search?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'title_asc' | 'bestselling';
  page?: number;
  per_page?: number;
  in_stock?: boolean;
  tags?: string[];
}
