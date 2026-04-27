import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { orders } from '../../mockData';

const fmt = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export default function Home() {
  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startWeek = new Date(now); startWeek.setDate(now.getDate() - 7);

  const total = orders.reduce((s, o) => s + o.total_amount, 0);
  const zomato = orders.filter(o => o.app_name === 'Zomato').reduce((s, o) => s + o.total_amount, 0);
  const swiggy = orders.filter(o => o.app_name === 'Swiggy').reduce((s, o) => s + o.total_amount, 0);
  const month = orders.filter(o => new Date(o.order_date) >= startMonth).reduce((s, o) => s + o.total_amount, 0);
  const week = orders.filter(o => new Date(o.order_date) >= startWeek).reduce((s, o) => s + o.total_amount, 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="titleLarge" style={styles.h1}>SpendLens</Text>
        <Text style={styles.sub}>Your unified spending dashboard</Text>

        <Card style={styles.totalCard} testID="total-spend-card">
          <Card.Content>
            <Text style={styles.label}>Total Lifetime Spend</Text>
            <Text style={styles.totalAmt} testID="total-spend-amount">{fmt(total)}</Text>
          </Card.Content>
        </Card>

        <View style={styles.row}>
          <Card style={[styles.appCard, { borderLeftColor: '#E23744' }]} testID="zomato-card">
            <Card.Content>
              <Text style={styles.appName}>Zomato</Text>
              <Text style={styles.appAmt}>{fmt(zomato)}</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.appCard, { borderLeftColor: '#FC8019' }]} testID="swiggy-card">
            <Card.Content>
              <Text style={styles.appName}>Swiggy</Text>
              <Text style={styles.appAmt}>{fmt(swiggy)}</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.row}>
          <Card style={styles.smallCard} testID="month-card">
            <Card.Content>
              <Text style={styles.label}>This Month</Text>
              <Text style={styles.smallAmt}>{fmt(month)}</Text>
            </Card.Content>
          </Card>
          <Card style={styles.smallCard} testID="week-card">
            <Card.Content>
              <Text style={styles.label}>This Week</Text>
              <Text style={styles.smallAmt}>{fmt(week)}</Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0c0c0c' },
  scroll: { padding: 20, paddingBottom: 40 },
  h1: { color: '#fff', fontSize: 32, fontWeight: '700' },
  sub: { color: '#888', marginBottom: 24 },
  label: { color: '#888', fontSize: 13 },
  totalCard: { backgroundColor: '#1a1a1a', marginBottom: 16, borderRadius: 16 },
  totalAmt: { color: '#FF5A5F', fontSize: 36, fontWeight: '700', marginTop: 4 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  appCard: { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 14, borderLeftWidth: 4 },
  appName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  appAmt: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 4 },
  smallCard: { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 14 },
  smallAmt: { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: 4 },
});
