
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/hooks/use-auth';
import { ThemeProvider } from '@/components/theme-provider';
import type { AppSettings } from '@/lib/types';


import { supabase } from '@/lib/supabase';
import { BottomNav } from '@/components/bottom-nav';
import { SidebarNav } from '@/components/sidebar-nav';
import { SplashScreen } from '@/components/splash-screen';

async function getAppSettings(): Promise<AppSettings> {
    try {
        const { data, error } = await supabase.from('settings').select('*').eq('id', 'app').single();
        return {
            appIconUrl: (data as any)?.app_icon_url || '/icons/icon-192x192.png',
            clubName: (data as any)?.club_name || 'ITA'
        };
    } catch (error) {
        console.error("Error fetching app settings for layout:", error);
    }
    return { appIconUrl: '/icons/icon-192x192.png', clubName: 'ITA' };
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

  const settings = await getAppSettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
        <meta name="theme-color" content="#facc15" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" href={settings.appIconUrl} type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href={settings.appIconUrl} />
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
            <SplashScreen clubName={settings.clubName} />
            <div className="flex flex-col sm:flex-row min-h-screen">
              <SidebarNav clubName={settings.clubName} />
              <div className="flex-grow flex flex-col min-h-screen">
                {children}
                <BottomNav />
              </div>
            </div>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
