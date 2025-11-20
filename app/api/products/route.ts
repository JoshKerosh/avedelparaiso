import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category1 = searchParams.get('category1');
    const category2 = searchParams.get('category2');
    const category3 = searchParams.get('category3');
    const sort = searchParams.get('sort') || 'newest';

    // Build query
    const query: any = {};

    if (search) {
      query.$text = { $search: search };
    }

    // Category filtering with level + children logic
    if (category3) {
      query.category3Id = category3;
    } else if (category2) {
      // Get all level 3 categories under this level 2
      const level3Categories = await Category.find({ parentId: category2, level: 3 });
      const level3Ids = level3Categories.map(cat => cat._id);
      
      query.$or = [
        { category2Id: category2, category3Id: null },
        { category3Id: { $in: level3Ids } }
      ];
    } else if (category1) {
      // Get all level 2 and 3 categories under this level 1
      const level2Categories = await Category.find({ parentId: category1, level: 2 });
      const level2Ids = level2Categories.map(cat => cat._id);
      
      const level3Categories = await Category.find({ parentId: { $in: level2Ids }, level: 3 });
      const level3Ids = level3Categories.map(cat => cat._id);
      
      query.$or = [
        { category1Id: category1, category2Id: null },
        { category2Id: { $in: level2Ids }, category3Id: null },
        { category3Id: { $in: level3Ids } }
      ];
    }

    // Sorting
    let sortOption: any = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    if (sort === 'price-desc') sortOption = { price: -1 };
    if (sort === 'name') sortOption = { name: 1 };

    const products = await Product.find(query)
      .populate('category1Id category2Id category3Id')
      .sort(sortOption)
      .lean();

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
