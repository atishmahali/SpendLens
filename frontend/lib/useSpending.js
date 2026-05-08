import { useEffect, useState } from 'react';
import { supabase, hasSupabase } from './supabase';

export const USER_ID = 'mock_user_1';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const headers = { apikey: key, Authorization: `Bearer ${key}` };

async function fetchJson(path) {
  try {
    const r = await fetch(`${url}/rest/v1/${path}`, { headers });
    if (!r.ok) return [];
    return await r.json();
  } catch { return []; }
}

export function useSpending() {
  const [orders, setOrders] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!hasSupabase) { setLoading(false); return; }
    const [o, c] = await Promise.all([
      fetchJson(`orders?user_id=eq.${USER_ID}&order=order_date.desc&select=id,app_name,order_date,total_amount,items`),
      fetchJson(`categories?select=order_id,category,subcategory,amount`),
    ]);
    setOrders(o);
    setCats(c);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const safety = setTimeout(() => setLoading(false), 4000);
    if (!hasSupabase) return () => clearTimeout(safety);
    const ch = supabase
      ? supabase.channel('sp').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, load).on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, load).subscribe()
      : null;
    return () => { clearTimeout(safety); if (ch) supabase.removeChannel(ch); };
  }, []);

  return { orders, cats, loading, reload: load };
}
