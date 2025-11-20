import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';
import cloudinary from '@/lib/cloudinary';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    let settings = await Settings.findOne().lean();

    if (!settings) {
      // Create default settings if none exist
      settings = await Settings.create({
        heroBannerUrl: '',
        heroBannerPublicId: '',
      });
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { heroBannerUrl, heroBannerPublicId, deleteOldImage } = body;

    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({
        heroBannerUrl,
        heroBannerPublicId,
      });
    } else {
      // Delete old image from Cloudinary if requested
      if (deleteOldImage && settings.heroBannerPublicId) {
        try {
          await cloudinary.uploader.destroy(settings.heroBannerPublicId);
        } catch (error) {
          console.error('Error deleting old banner from Cloudinary:', error);
        }
      }

      settings.heroBannerUrl = heroBannerUrl;
      settings.heroBannerPublicId = heroBannerPublicId;
      settings.updatedAt = new Date();
      await settings.save();
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
