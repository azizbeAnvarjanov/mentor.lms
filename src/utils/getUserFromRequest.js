import { createClient } from '@/utils/supabase/server'

export async function getUserFromRequest(req) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return null;

  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  return user || null;
}
