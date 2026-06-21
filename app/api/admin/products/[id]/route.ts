import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import cloudinary from '@/lib/cloudinary';
import { handleApiError } from '@/lib/apiError';
import { productInputSchema, firstZodError } from '@/lib/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const product = await Product.findById(id)
      .populate('category1Id category2Id category3Id')
      .lean();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
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

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price,
        stock,
        lowStockThreshold: lowStockThreshold ?? 10,
        images: imagesList,
        category1Id: category1Id || null,
        category2Id: category2Id || null,
        category3Id: category3Id || null,
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete images from Cloudinary
    for (const image of product.images) {
      if (image.publicId) {
        try {
          await cloudinary.uploader.destroy(image.publicId);
        } catch (error) {
          console.error('Error deleting image from Cloudinary:', error);
        }
      }
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
