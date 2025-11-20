import mongoose, { Schema, model, models } from 'mongoose';

export interface IStockHistory {
  _id: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  previousStock: number;
  newStock: number;
  change: number;
  reason?: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const StockHistorySchema = new Schema<IStockHistory>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  previousStock: {
    type: Number,
    required: true,
  },
  newStock: {
    type: Number,
    required: true,
  },
  change: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    default: 'Manual Adjustment',
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient querying by product
StockHistorySchema.index({ productId: 1, createdAt: -1 });

export default models.StockHistory || model<IStockHistory>('StockHistory', StockHistorySchema);
