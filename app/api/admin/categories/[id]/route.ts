import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';

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

    const category = await Category.findById(id).lean();

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error: any) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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
    const { name, description } = body;

    const currentCategory = await Category.findById(id);
    if (!currentCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check for unique name within same parent (excluding current category)
    const existingCategory = await Category.findOne({
      _id: { $ne: id },
      name: name.trim(),
      parentId: currentCategory.parentId,
    });

    if (existingCategory) {
      return NextResponse.json({ error: 'A category with this name already exists at this level' }, { status: 400 });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { name: name.trim(), description },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ category });
  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check if category has child categories
    const childCategories = await Category.countDocuments({ parentId: id });
    if (childCategories > 0) {
      return NextResponse.json({ error: 'Cannot delete category with subcategories. Please delete subcategories first.' }, { status: 400 });
    }

    // Check if products are assigned to this category
    const productsWithCategory = await Product.countDocuments({
      $or: [
        { category1Id: id },
        { category2Id: id },
        { category3Id: id },
      ],
    });

    if (productsWithCategory > 0) {
      return NextResponse.json({ 
        error: `Cannot delete category. ${productsWithCategory} product(s) are assigned to this category. Please reassign or delete the products first.` 
      }, { status: 400 });
    }

    await Category.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
