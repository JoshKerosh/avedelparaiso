import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { handleApiError } from '@/lib/apiError';
import { productInputSchema, firstZodError } from '@/lib/validation';

export async function GET() {
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
  } catch (error) {
    return handleApiError(error);
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
    const parsed = productInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodError(parsed.error) }, { status: 400 });
    }
    const { name, description, price, stock, lowStockThreshold, images, category1Id, category2Id, category3Id } = parsed.data;

    // Ensure at least one image is marked as main
    const imagesList = images ?? [];
    if (imagesList.length > 0 && !imagesList.some((img) => img.isMain)) {
      imagesList[0].isMain = true;
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      lowStockThreshold: lowStockThreshold ?? 10,
      images: imagesList,
      category1Id: category1Id || null,
      category2Id: category2Id || null,
      category3Id: category3Id || null,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
