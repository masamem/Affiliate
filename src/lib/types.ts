export type StoreStatus = "active" | "inactive";
export type ProductStatus = "active" | "inactive";
export type ProductBadge = "" | "special" | "hot" | "best" | "pick";
export type DeviceType = "mobile" | "desktop" | "tablet";

export interface Store {
  id: number;
  name: string;
  slug: string;
  logoColor: string;
  logoLetter: string;
  description: string;
  websiteUrl: string;
  status: StoreStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  image: string;
  images: string[];
  features: string[];
  price: number;
  oldPrice: number | null;
  discountPercentage: number | null;
  affiliateUrl: string;
  storeId: number;
  categoryId: number;
  badge: ProductBadge;
  featured: boolean;
  status: ProductStatus;
  expiryDate: string | null;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  rating: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateClick {
  id: number;
  productId: number;
  storeId: number;
  ipHash: string;
  userAgent: string;
  referrer: string;
  device: DeviceType;
  createdAt: string;
}

export interface Settings {
  siteName: string;
  tagline: string;
  email: string;
  twitter: string;
  instagram: string;
  whatsapp: string;
  disclosure: string;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  gaId: string;
  gscVerification: string;
  fbPixel: string;
  adminUser: string;
  adminHash: string;
}

export interface DBShape {
  version: number;
  stores: Store[];
  categories: Category[];
  products: Product[];
  clicks: AffiliateClick[];
  settings: Settings;
}

export type SortKey = "latest" | "discount" | "views" | "priceAsc" | "priceDesc";

export interface Filters {
  storeIds: number[];
  categoryId: number | null;
  minPrice: string;
  maxPrice: string;
  minDiscount: number;
  sort: SortKey;
  showExpired: boolean;
}

export const BADGE_LABELS: Record<Exclude<ProductBadge, "">, string> = {
  special: "عرض مميز",
  hot: "خصم قوي",
  best: "الأكثر مبيعًا",
  pick: "اختيارنا",
};
