import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import StockHistory from '@/models/StockHistory';
import { handleApiError } from '@/lib/apiError';

/**
 * MongoDB transactions require a replica set. A standalone server (common in
 * local dev) rejects them with IllegalOperation (code 20) / a "replica set"
 * message. Detect that so we can fall back to a compensating write.
 */
function isTransactionUnsupported(error: unknown): boolean {
  const e = error as { code?: number; codeName?: string; message?: string };
  return (
    e?.code === 20 ||
    e?.codeName === 'IllegalOperation' ||
    /transaction numbers are only allowed|replica set|transactions are not supported/i.test(
      e?.message ?? ''
    )
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { change, reason, notes } = body;

    if (typeof change !== 'number' || !Number.isFinite(change)) {
      return NextResponse.json({ error: 'change must be a finite number' }, { status: 400 });
    }

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const previousStock = product.stock;
    const newStock = previousStock + change;

    if (newStock < 0) {
      return NextResponse.json({ error: 'Stock cannot be negative' }, { status: 400 });
    }

    const historyDoc = {
      productId: id,
      previousStock,
      newStock,
      change,
      reason: reason || 'Manual Adjustment',
      notes: notes || '',
      userId: session.user.id,
    };

    // Stock and its audit record must move together. Use a transaction so they
    // commit atomically; never leave stock changed without a StockHistory entry.
    const dbSession = await mongoose.startSession();
    try {
      await dbSession.withTransaction(async () => {
        product.stock = newStock;
        await product.save({ session: dbSession });
        await StockHistory.create([historyDoc], { session: dbSession });
      });
    } catch (txError) {
      if (isTransactionUnsupported(txError)) {
        // Standalone fallback: write sequentially and compensate on failure so
        // stock can never desync from the audit log.
        product.stock = newStock;
        await product.save();
        try {
          await StockHistory.create(historyDoc);
        } catch (historyError) {
          product.stock = previousStock;
          await product.save();
          throw historyError;
        }
      } else {
        throw txError;
      }
    } finally {
      await dbSession.endSession();
    }

    return NextResponse.json({ product, previousStock, newStock, change });
  } catch (error) {
    return handleApiError(error);
  }
}
