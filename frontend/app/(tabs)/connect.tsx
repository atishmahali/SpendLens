import { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase, hasSupabase } from '../../lib/supabase';
import { USER_ID } from '../../lib/useSpending';
import AccessibilityPermissionCard from '../../components/AccessibilityPermissionCard';

const APPS = [
  { name: 'Zomato', color: '#E23744', cat: 'Food' },
  { name: 'Swiggy', color: '#FC8019', cat: 'Food' },
  { name: 'Blinkit', color: '#F8CB46', cat: 'Groceries' },
  { name: 'Zepto', color: '#7B3FE4', cat: 'Groceries' },
  { name: 'BigBasket', color: '#84C225', cat: 'Groceries' },
  { name: 'Amazon', color: '#FF9900', cat: 'Shopping' },
  { name: 'Flipkart', color: '#2874F0', cat: 'Shopping' },
  { name: 'Paytm', color: '#00BAF2', cat: 'UPI' },
  { name: 'PhonePe', color: '#5F259F', cat: 'UPI' },
  { name: 'Google Pay', color: '#4285F4', cat: 'UPI' },
];

export default function Connect() {
  const [connected, setConnected] = useState({});
  const [msg, setMsg] = useState('');

  const load = async () => {
    if (!hasSupabase) return;
    const { data } = await supabase.from('connected_apps').select('app_name').eq('user_id', USER_ID);
    if (data) setConnected(Object.fromEntries(data.map(r => [r.app_name, true])));
  };
  useEffect(() => { load(); }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="titleLarge" style={styles.h1}>Connect Apps</Text>
        <Text style={styles.sub}>Auto-capture works across these apps</Text>
        <AccessibilityPermissionCard />
        <Text style={styles.section}>Tracked Apps</Text>
        <View style={styles.grid}>
          {APPS.map(a => (
            <Card key={a.name} style={[styles.tile, { borderLeftColor: a.color }]} testID={`app-${a.name.toLowerCase().replace(' ','-')}`}>
              <Card.Content style={styles.tileContent}>
                <View style={[styles.dot, { backgroundColor: a.color }]}><Text style={styles.dotText}>{a.name[0]}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tileName}>{a.name}</Text>
                  <Text style={styles.tileCat}>{a.cat}</Text>
                </View>
                {connected[a.name] && <Ionicons name="checkmark-circle" size={20} color="#4ade80" />}
              </Card.Content>
            </Card>
          ))}
        </View>
        {!hasSupabase && (
          <Card style={styles.notice}><Card.Content>
            <Text style={styles.noticeText}>Supabase keys not set in .env</Text>
          </Card.Content></Card>
        )}
      </ScrollView>
      <Snackbar visible={!!msg} onDismiss={() => setMsg('')} duration={2500}>{msg}</Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0c0c0c' },
  scroll: { padding: 20, paddingBottom: 40 },
  h1: { color: '#fff', fontSize: 32, fontWeight: '700' },
  sub: { color: '#888', marginBottom: 20 },
  section: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 6, marginBottom: 10 },
  grid: { gap: 8 },
  tile: { backgroundColor: '#1a1a1a', borderRadius: 12, borderLeftWidth: 4, marginBottom: 8 },
  tileContent: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  dot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  dotText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  tileName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  tileCat: { color: '#888', fontSize: 11, marginTop: 1 },
  notice: { backgroundColor: '#1f1a0a', borderRadius: 12, marginTop: 12 },
  noticeText: { color: '#fbbf24', fontSize: 12 },
});
