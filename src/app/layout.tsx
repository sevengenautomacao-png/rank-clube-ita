
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeProvider } from '@/components/theme-provider';
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

async function getAppIconUrl() {
    try {
        const firebaseApp = initializeFirebaseApp();
        const firestore = getFirestore(firebaseApp);
        const settingsRef = doc(firestore, 'settings', 'app');
        const settingsSnap = await getDoc(settingsRef);
        
        if (settingsSnap.exists()) {
            const settings = settingsSnap.data() as AppSettings;
            if (settings.appIconUrl) {
                return settings.appIconUrl;
            }
        }
    } catch (error) {
        console.error("Error fetching app icon for layout:", error);
    }
    return '/icons/icon-192x192.png'; // Default icon
}


export const metadata: Metadata = {
  title: 'Rank Clube Ita',
  description: 'Manage your Pathfinder units and member rankings.',
  manifest: '/manifest',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const appIconUrl = await getAppIconUrl();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#facc15" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" href={appIconUrl} type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href={appIconUrl} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="theme-retro-dark"
        >
          <FirebaseClientProvider>
            {children}
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
