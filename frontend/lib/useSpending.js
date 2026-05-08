import { useEffect, useState } from 'react';
import { supabase, hasSupabase } from './supabase';

export const USER_ID = 'mock_user_1';

export function useSpending() {
  const [orders, setOrders] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!hasSupabase) { setLoading(false); return; }
    try {
      const [{ data: o }, { data: c }] = await Promise.all([
        supabase.from('orders').select('id,app_name,order_date,total_amount,items').eq('user_id', USER_ID).order('order_date', { ascending: false }),
        supabase.from('categories').select('order_id,category,subcategory,amount'),
      ]);
      setOrders(o || []);
      setCats(c || []);
    } catch (e) {
      setOrders([]); setCats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    if (!hasSupabase) return;
    const ch = supabase.channel('sp')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return { orders, cats, loading, reload: load };
}
