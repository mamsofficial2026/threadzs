import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://myfyiwtbsmvdcugvzfym.supabase.co';
const supabaseAnonKey = 'sb_publishable_oi97Bod8nc-23PtynrVMtQ_TOp5chR2';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);