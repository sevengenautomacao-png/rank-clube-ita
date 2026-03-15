import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  let appIconUrl = '/icons/icon-192x192.png'; // Default icon

  try {
    const { data, error } = await supabase
      .from('settings')
      .select('app_icon_url')
      .eq('id', 'app')
      .single();

    if (!error && data?.app_icon_url) {
      appIconUrl = data.app_icon_url;
    }
  } catch (error) {
    console.error("Error fetching app icon for manifest from Supabase:", error);
  }

  return {
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
        src: appIconUrl,
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
