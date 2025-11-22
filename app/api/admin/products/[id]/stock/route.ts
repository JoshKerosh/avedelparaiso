import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import StockHistory from '@/models/StockHistory';

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

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const previousStock = product.stock;
    const newStock = previousStock + change;

    if (newStock < 0) {
      return NextResponse.json({ error: 'Stock cannot be negative' }, { status: 400 });
    }

    // Update product stock
    product.stock = newStock;
    await product.save();

    // Create stock history record
    await StockHistory.create({
      productId: id,
      previousStock,
      newStock,
      change,
      reason: reason || 'Manual Adjustment',
      notes: notes || '',
      userId: session.user.id,
    });

    return NextResponse.json({ product, previousStock, newStock, change });
  } catch (error: any) {
    console.error('Error adjusting stock:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
