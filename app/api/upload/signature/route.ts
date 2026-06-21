import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { handleApiError } from '@/lib/apiError';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    // Only authenticated admins can mint upload signatures — otherwise anyone
    // could upload to (and rack up costs on) our Cloudinary account.
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Throttle signature requests per IP to limit abuse.
    const ip = getClientIp(request.headers);
    const limit = rateLimit(`upload-signature:${ip}`, 30, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
      );
    }

    const body = await request.json();
    const { timestamp } = body;

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: 'inventory',
      },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({ signature });
  } catch (error) {
    return handleApiError(error);
  }
}
