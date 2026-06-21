/** Shared types for the admin products UI. */

export interface AdminProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  images: { url: string; publicId: string; isMain: boolean }[];
  category1Id?: string;
  category2Id?: string;
  category3Id?: string;
}

export interface AdminCategory {
  _id: string;
  name: string;
  level: number;
}

export interface StockHistoryItem {
  _id: string;
  createdAt: string;
  change: number;
  previousStock: number;
  newStock: number;
  reason: string;
  notes?: string;
  userId?: { username: string } | null;
}

export type ReduceReason = 'SALE' | 'DAMAGED' | 'ADJUSTMENT' | 'OTHER';

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  lowStockThreshold: string;
  category1Id: string;
  category2Id: string;
  category3Id: string;
  images: { url: string; publicId: string; isMain: boolean }[];
}
