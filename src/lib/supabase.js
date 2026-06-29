import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

// 서비스 롤 키를 사용하므로 RLS를 우회합니다. 서버 환경에서만 사용하세요.
export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
