
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/hooks/use-auth';
import { ThemeProvider } from '@/components/theme-provider';
import type { AppSettings } from '@/lib/types';


import { supabase } from '@/lib/supabase';

async function getAppIconUrl() {
    try {
        const { data, error } = await supabase.from('settings').select('app_icon_url').eq('id', 'app').single();
        if (error) throw error;
        if (data?.app_icon_url) {
            return data.app_icon_url;
        }
    } catch (error) {
        console.error("Error fetching app icon for layout from Supabase:", error);
    }
    return '/icons/icon-192x192.png'; // Default icon
}


export const metadata: Metadata = {
  title: 'Rank Clube Ita',
  description: 'Manage your Pathfinder units and member rankings.',
  manifest: '/manifest',
};

import { BottomNav } from '@/components/bottom-nav';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const appIconUrl = await getAppIconUrl();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
        <meta name="theme-color" content="#facc15" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" href={appIconUrl} type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href={appIconUrl} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="theme-retro-dark"
        >
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              {children}
            </div>
            <BottomNav />
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
