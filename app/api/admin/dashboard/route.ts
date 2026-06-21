import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import StockHistory from '@/models/StockHistory';
import { handleApiError } from '@/lib/apiError';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Total products
    const totalProducts = await Product.countDocuments();

    // Low stock products (stock <= lowStockThreshold)
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      stock: { $gt: 0 },
    })
      .select('name stock lowStockThreshold')
      .lean();

    // Out of stock products
    const outOfStockProducts = await Product.find({ stock: 0 })
      .select('name')
      .lean();

    // Recent stock changes (last 10)
    const recentStockChanges = await StockHistory.find()
      .populate('productId', 'name')
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      totalProducts,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      outOfStockCount: outOfStockProducts.length,
      outOfStockProducts,
      recentStockChanges,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
