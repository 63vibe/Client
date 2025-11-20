import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hytapvvcpdnjagfjdrnp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5dGFwdnZjcGRuamFnZmpkcm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0ODI1NzcsImV4cCI6MjA3OTA1ODU3N30.tIspwGi8DcKaZFFrWHoL4MiAsKh-Bld-bbFvTzKiBQ8';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

