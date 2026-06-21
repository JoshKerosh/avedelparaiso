/** Serializable product/category shapes shared between the data layer and UI. */

export interface ProductImage {
  url: string;
  isMain: boolean;
}

export interface CategoryRef {
  _id: string;
  name: string;
}

export interface ProductListItem {
  _id: string;
  name: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  images: ProductImage[];
}

export interface ProductDetail extends ProductListItem {
  description: string;
  category1Id?: CategoryRef | null;
  category2Id?: CategoryRef | null;
  category3Id?: CategoryRef | null;
}

export interface PaginatedProducts {
  products: ProductListItem[];
  total: number;
  page: number;
  totalPages: number;
}
