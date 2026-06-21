import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/products';
import { handleApiError } from '@/lib/apiError';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
    const limitParam = parseInt(searchParams.get('limit') ?? '', 10);

    const result = await getProducts({
      search: searchParams.get('search') ?? undefined,
      category1: searchParams.get('category1') ?? undefined,
      category2: searchParams.get('category2') ?? undefined,
      category3: searchParams.get('category3') ?? undefined,
      sort: searchParams.get('sort') ?? undefined,
      page,
      limit: Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
