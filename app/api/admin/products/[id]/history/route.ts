import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import StockHistory from '@/models/StockHistory';
import { handleApiError } from '@/lib/apiError';

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

    const history = await StockHistory.find({ productId: id })
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ history });
  } catch (error) {
    return handleApiError(error);
  }
}
