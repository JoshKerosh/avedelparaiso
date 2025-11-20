import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const products = await Product.find()
      .populate('category1Id category2Id category3Id')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { name, description, price, stock, lowStockThreshold, images, category1Id, category2Id, category3Id } = body;

    // Ensure at least one image is marked as main
    if (images && images.length > 0) {
      const hasMain = images.some((img: any) => img.isMain);
      if (!hasMain) {
        images[0].isMain = true;
      }
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      lowStockThreshold: lowStockThreshold || 10,
      images,
      category1Id: category1Id || null,
      category2Id: category2Id || null,
      category3Id: category3Id || null,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
