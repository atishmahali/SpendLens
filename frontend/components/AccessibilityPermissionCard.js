import { useEffect, useState } from 'react';
import { View, StyleSheet, Linking, Platform } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { supabase, hasSupabase } from '../lib/supabase';
import { USER_ID } from '../mockData';

export default function AccessibilityPermissionCard() {
  const [granted, setGranted] = useState(false);

  const check = async () => {
    if (!hasSupabase) return;
    const { data } = await supabase
      .from('connected_apps')
      .select('app_name')
      .eq('user_id', USER_ID)
      .eq('app_name', 'Accessibility')
      .maybeSingle();
    setGranted(Boolean(data));
  };

  useEffect(() => { check(); }, []);

  const open = () => {
    if (Platform.OS !== 'android') return;
    Linking.sendIntent('android.settings.ACCESSIBILITY_SETTINGS').catch(() => Linking.openSettings());
    setTimeout(check, 4000);
  };

  if (Platform.OS !== 'android') return null;

  return (
    <Card style={styles.card} testID="accessibility-card">
      <Card.Content>
        <View style={styles.head}>
          <View style={styles.icon}><Ionicons name="scan" size={22} color="#fff" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Enable Auto-Capture</Text>
            <Text style={styles.sub}>SpendLens reads your Zomato and Swiggy screens to capture orders automatically</Text>
          </View>
          {granted && <Ionicons name="checkmark-circle" size={26} color="#4ade80" testID="accessibility-tick" />}
        </View>
        <Button
          mode={granted ? 'outlined' : 'contained'}
          onPress={open}
          disabled={granted}
          style={styles.btn}
          buttonColor={granted ? undefined : '#7c3aed'}
          testID="accessibility-enable-btn"
        >
          {granted ? 'Enabled' : 'Enable in Settings'}
        </Button>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#1a1a1a', borderRadius: 16, marginTop: 6, marginBottom: 14, borderLeftWidth: 4, borderLeftColor: '#7c3aed' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#7c3aed' },
  title: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sub: { color: '#888', fontSize: 12, marginTop: 2 },
  btn: { borderRadius: 10 },
});
