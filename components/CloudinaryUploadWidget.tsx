'use client';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

interface CloudinaryUploadWidgetProps {
  onUploadSuccess: (result: { url: string; publicId: string }) => void;
  folder?: string;
  buttonText?: string;
  multiple?: boolean;
}

interface CloudinaryWidget {
  open: () => void;
  close: () => void;
}

interface CloudinaryWidgetError {
  statusText?: string;
  message?: string;
}

interface CloudinaryWidgetResult {
  event?: string;
  info?: { secure_url: string; public_id: string };
}

interface CloudinaryGlobal {
  createUploadWidget: (
    options: Record<string, unknown>,
    callback: (error: CloudinaryWidgetError | null, result: CloudinaryWidgetResult) => void
  ) => CloudinaryWidget;
}

declare global {
  interface Window {
    cloudinary?: CloudinaryGlobal;
  }
}

export default function CloudinaryUploadWidget({
  onUploadSuccess,
  folder = 'inventory',
  buttonText = 'Upload Image',
  multiple = false,
}: CloudinaryUploadWidgetProps) {
  const widgetRef = useRef<CloudinaryWidget | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    const existingScript = document.getElementById('cloudinary-upload-widget');

    if (existingScript) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'cloudinary-upload-widget';
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.async = true;
    script.onload = () => {
      setScriptLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Cloudinary widget script');
      toast.error('Failed to load upload widget. Please refresh the page.');
    };
    document.body.appendChild(script);

    return () => {
      if (widgetRef.current) {
        widgetRef.current.close();
      }
    };
  }, []);

  const openWidget = () => {
    if (!scriptLoaded || !window.cloudinary) {
      toast.error('Upload widget is still loading. Please wait a moment and try again.');
      return;
    }

    if (!cloudName) {
      toast.error('Cloudinary cloud name is not configured (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME).');
      return;
    }

    if (!uploadPreset) {
      toast.error('Cloudinary upload preset is not configured (NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET).');
      return;
    }

    try {
      if (!widgetRef.current) {
        widgetRef.current = window.cloudinary.createUploadWidget(
          {
            cloudName,
            uploadPreset,
            folder,
            multiple,
            maxFiles: multiple ? 10 : 1,
            sources: ['local', 'url'],
            resourceType: 'image',
            clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
            maxFileSize: 5000000, // 5MB
            showSkipCropButton: false,
            cropping: false,
          },
          (error, result) => {
            if (error) {
              console.error('Upload error:', error);
              toast.error(`Upload failed: ${error.statusText || error.message || 'Unknown error'}`);
              return;
            }

            if (result.event === 'success' && result.info) {
              onUploadSuccess({
                url: result.info.secure_url,
                publicId: result.info.public_id,
              });
            }
          }
        );
      }

      widgetRef.current.open();
    } catch (err) {
      console.error('Widget error:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to open upload widget: ${message}`);
    }
  };

  return (
    <button
      type="button"
      onClick={openWidget}
      disabled={!scriptLoaded}
      className={`px-4 py-2 rounded-lg transition-colors ${
        scriptLoaded
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`}
    >
      {scriptLoaded ? buttonText : 'Loading...'}
    </button>
  );
}
