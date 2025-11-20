'use client';

import { useEffect, useRef, useState } from 'react';

interface CloudinaryUploadWidgetProps {
  onUploadSuccess: (result: { url: string; publicId: string }) => void;
  folder?: string;
  buttonText?: string;
  multiple?: boolean;
}

declare global {
  interface Window {
    cloudinary: any;
  }
}

export default function CloudinaryUploadWidget({
  onUploadSuccess,
  folder = 'inventory',
  buttonText = 'Upload Image',
  multiple = false,
}: CloudinaryUploadWidgetProps) {
  const widgetRef = useRef<any>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    // Check if script already exists
    const existingScript = document.getElementById('cloudinary-upload-widget');
    
    if (existingScript) {
      setScriptLoaded(true);
      return;
    }

    // Load Cloudinary widget script
    const script = document.createElement('script');
    script.id = 'cloudinary-upload-widget';
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.async = true;
    script.onload = () => {
      setScriptLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Cloudinary widget script');
      alert('Failed to load upload widget. Please refresh the page.');
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup if component unmounts
      if (widgetRef.current) {
        widgetRef.current.close();
      }
    };
  }, []);

  const openWidget = () => {
    if (!scriptLoaded || !window.cloudinary) {
      alert('Cloudinary widget is still loading. Please wait a moment and try again.');
      return;
    }

    if (!cloudName) {
      alert('Cloudinary cloud name is not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.local');
      return;
    }

    if (!uploadPreset) {
      alert('Cloudinary upload preset is not configured. Please set NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local');
      return;
    }

    try {
      if (!widgetRef.current) {
        widgetRef.current = window.cloudinary.createUploadWidget(
          {
            cloudName: cloudName,
            uploadPreset: uploadPreset,
            multiple: multiple,
            maxFiles: multiple ? 10 : 1,
            sources: ['local', 'url'],
            resourceType: 'image',
            clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
            maxFileSize: 5000000, // 5MB
            showSkipCropButton: false,
            cropping: false,
          },
          (error: any, result: any) => {
            if (error) {
              console.error('Upload error:', error);
              alert(`Upload failed: ${error.statusText || error.message || 'Unknown error'}`);
              return;
            }

            if (result.event === 'success') {
              console.log('Upload successful:', result.info);
              onUploadSuccess({
                url: result.info.secure_url,
                publicId: result.info.public_id,
              });
            }
          }
        );
      }

      widgetRef.current.open();
    } catch (err: any) {
      console.error('Widget error:', err);
      alert(`Failed to open upload widget: ${err.message}`);
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
