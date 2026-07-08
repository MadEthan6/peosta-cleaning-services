import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ikrpobckicztrekvzvij.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrcnBvYmNraWN6dHJla3Z6dmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMTcxMjQsImV4cCI6MjA5ODg5MzEyNH0.o8vxClxDfY3ajp5jHlnYpEvp53g3gmLhCRwFH94_YWY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
