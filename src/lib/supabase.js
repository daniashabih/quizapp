import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ceijrsokrtxmsbjehvgx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_LXtDanbIH5AdobDTyHgCOA_rVqmNEA_';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
