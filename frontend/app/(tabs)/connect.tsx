import { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase, hasSupabase } from '../../lib/supabase';
import { USER_ID } from '../../mockData';
import AccessibilityPermissionCard from '../../components/AccessibilityPermissionCard';

const APPS = [
  { name: 'Zomato', color: '#E23744', desc: 'Food delivery & dining' },
  { name: 'Swiggy', color: '#FC8019', desc: 'Food, Instamart & more' },
];

export default function Connect() {
  const [connected, setConnected] = useState({});
  const [loading, setLoading] = useState(null);
  const [msg, setMsg] = useState('');

  const load = async () => {
    if (!hasSupabase) return;
    const { data } = await supabase.from('connected_apps').select('app_name').eq('user_id', USER_ID);
    if (data) setConnected(Object.fromEntries(data.map(r => [r.app_name, true])));
  };

  useEffect(() => { load(); }, []);

  const connect = async (app) => {
    if (!hasSupabase) { setMsg('Add Supabase keys to .env to connect.'); return; }
    setLoading(app);
    const { error } = await supabase.from('connected_apps').upsert({ user_id: USER_ID, app_name: app }, { onConflict: 'user_id,app_name' });
    setLoading(null);
    if (error) { setMsg(`Error: ${error.message}`); return; }
    setConnected({ ...connected, [app]: true });
    setMsg(`${app} connected`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="titleLarge" style={styles.h1}>Connect Apps</Text>
        <Text style={styles.sub}>Link accounts to track spending</Text>

        <AccessibilityPermissionCard />

        {APPS.map(a => (
          <Card key={a.name} style={[styles.card, { borderLeftColor: a.color }]} testID={`connect-${a.name.toLowerCase()}-card`}>
            <Card.Content>
              <View style={styles.head}>
                <View style={[styles.logo, { backgroundColor: a.color }]}>
                  <Text style={styles.logoText}>{a.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{a.name}</Text>
                  <Text style={styles.desc}>{a.desc}</Text>
                </View>
                {connected[a.name] && <Ionicons name="checkmark-circle" size={28} color="#4ade80" testID={`tick-${a.name.toLowerCase()}`} />}
              </View>
              <Button
                mode={connected[a.name] ? 'outlined' : 'contained'}
                onPress={() => connect(a.name)}
                loading={loading === a.name}
                disabled={connected[a.name] || loading === a.name}
                style={styles.btn}
                buttonColor={connected[a.name] ? undefined : a.color}
                testID={`connect-${a.name.toLowerCase()}-btn`}
              >
                {connected[a.name] ? 'Connected' : 'Connect'}
              </Button>
            </Card.Content>
          </Card>
        ))}

        {!hasSupabase && (
          <Card style={styles.notice}>
            <Card.Content>
              <Text style={styles.noticeText}>Supabase keys not set. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to /app/frontend/.env</Text>
            </Card.Content>
          </Card>
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
  card: { backgroundColor: '#1a1a1a', borderRadius: 16, marginBottom: 14, borderLeftWidth: 4 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  logo: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  name: { color: '#fff', fontSize: 18, fontWeight: '700' },
  desc: { color: '#888', fontSize: 12, marginTop: 2 },
  btn: { borderRadius: 10 },
  notice: { backgroundColor: '#1f1a0a', borderRadius: 12, marginTop: 8 },
  noticeText: { color: '#fbbf24', fontSize: 12 },
});
