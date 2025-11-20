import mongoose, { Schema, model, models } from 'mongoose';

export interface IProductImage {
  url: string;
  publicId: string;
  isMain: boolean;
}

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  images: IProductImage[];
  category1Id?: string | null;
  category2Id?: string | null;
  category3Id?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const ProductImageSchema = new Schema<IProductImage>({
  url: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
  isMain: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: 0,
  },
  images: {
    type: [ProductImageSchema],
    default: [],
  },
  category1Id: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  category2Id: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  category3Id: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
}, {
  timestamps: true,
});

// Indexes for efficient querying
ProductSchema.index({ category1Id: 1 });
ProductSchema.index({ category2Id: 1 });
ProductSchema.index({ category3Id: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

export default models.Product || model<IProduct>('Product', ProductSchema);
