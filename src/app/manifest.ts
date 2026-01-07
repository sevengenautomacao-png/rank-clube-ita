
import { MetadataRoute } from 'next';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import type { AppSettings } from '@/lib/types';

// Helper to initialize Firebase Admin SDK
function initializeFirebaseApp() {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

export async function GET() {
  try {
    const firebaseApp = initializeFirebaseApp();
    const firestore = getFirestore(firebaseApp);
    const settingsRef = doc(firestore, 'settings', 'app');
    const settingsSnap = await getDoc(settingsRef);
    
    let appIconUrl = '/icons/icon-192x192.png'; // Default icon
    if (settingsSnap.exists()) {
      const settings = settingsSnap.data() as AppSettings;
      if (settings.appIconUrl) {
        appIconUrl = settings.appIconUrl;
      }
    }

    const manifest: MetadataRoute.Manifest = {
      name: 'Rank Clube Ita',
      short_name: 'Rank Ita',
      description: 'Gerencie as unidades de desbravadores e o ranking dos membros.',
      start_url: '/',
      display: 'standalone',
      background_color: '#000000',
      theme_color: '#facc15',
      icons: [
        {
          src: appIconUrl,
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: appIconUrl, // You might want a different, larger icon here
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    };

    return new Response(JSON.stringify(manifest), {
      headers: {
        'Content-Type': 'application/manifest+json',
      },
    });
  } catch (error) {
    console.error("Error generating manifest:", error);
    // Return a default manifest in case of an error
    const defaultManifest: MetadataRoute.Manifest = {
       name: 'Rank Clube Ita',
      short_name: 'Rank Ita',
      description: 'Gerencie as unidades de desbravadores e o ranking dos membros.',
      start_url: '/',
      display: 'standalone',
      background_color: '#000000',
      theme_color: '#facc15',
      icons: [
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    };
    return new Response(JSON.stringify(defaultManifest), {
      status: 500,
      headers: {
        'Content-Type': 'application/manifest+json',
      },
    });
  }
}
