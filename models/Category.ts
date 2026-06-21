import { Schema, model, models } from 'mongoose';

export interface ICategory {
  _id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  level: 1 | 2 | 3;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  level: {
    type: Number,
    required: true,
    enum: [1, 2, 3],
  },
}, {
  timestamps: true,
});

// Compound index to ensure unique category names within the same parent level
CategorySchema.index({ name: 1, parentId: 1 }, { unique: true });

export default models.Category || model<ICategory>('Category', CategorySchema);
