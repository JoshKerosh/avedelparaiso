'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import CloudinaryUploadWidget from '@/components/CloudinaryUploadWidget';
import toast from 'react-hot-toast';

interface Settings {
  heroBannerUrl?: string;
  heroBannerPublicId?: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || {});
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('No se pudo cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = async (result: { url: string; publicId: string }) => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroBannerUrl: result.url,
          heroBannerPublicId: result.publicId,
          deleteOldImage: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        toast.success('¡Banner principal actualizado con éxito!');
      } else {
        toast.error('No se pudo actualizar el banner principal');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Ocurrió un error');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveBanner = async () => {
    if (!window.confirm('¿Seguro que quieres eliminar el banner principal?')) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroBannerUrl: '',
          heroBannerPublicId: '',
          deleteOldImage: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        toast.success('¡Banner principal eliminado!');
      } else {
        toast.error('No se pudo eliminar el banner principal');
      }
    } catch (error) {
      console.error('Error removing banner:', error);
      toast.error('Ocurrió un error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configuración</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Administra la configuración del sitio</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Cargando configuración...</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Banner principal</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Sube una imagen para mostrar en la parte superior de la página de inicio. Tamaño recomendado: 1920x600px
              </p>

              {/* Current Banner Preview */}
              {settings.heroBannerUrl ? (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">Banner actual:</p>
                  <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={settings.heroBannerUrl}
                      alt="Hero Banner"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    onClick={handleRemoveBanner}
                    disabled={saving}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors"
                  >
                    Eliminar banner
                  </button>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">Aún no se ha subido un banner</p>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div className="flex items-center gap-4">
                <CloudinaryUploadWidget
                  onUploadSuccess={handleUploadSuccess}
                  folder="inventory/hero"
                  buttonText={settings.heroBannerUrl ? 'Cambiar banner' : 'Subir banner'}
                  multiple={false}
                />
                {saving && <span className="text-gray-600">Guardando...</span>}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Para mejores resultados, usa una imagen de alta calidad con dimensiones de
                  1920x600 píxeles o una proporción similar (16:5).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
