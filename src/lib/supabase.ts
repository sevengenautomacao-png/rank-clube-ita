import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zbtfewceyjgqdonmlqlj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_IjfavGoT4AT1yOug0qkptg_--hxQpmt';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
