
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import 'react-native-url-polyfill/auto'

const supabaseUrl = 'https://odymnhzgywrckloegosi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9keW1uaHpneXdyY2tsb2Vnb3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzU4OTE2NzcsImV4cCI6MTk5MTQ2NzY3N30.wzQhlkVjZ-ULtIoI2UvQDZIDCPdYY2S9t81_Fc_S5wY';

export const supabase = createClient(  `${supabaseUrl}`, `${supabaseAnonKey}`, {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})