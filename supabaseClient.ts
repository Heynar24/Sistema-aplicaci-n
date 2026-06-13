import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hdhxjjkvlhocviumomxo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_CPoUL0SwGI_QxNql2f416w_FiKMi_mS';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
