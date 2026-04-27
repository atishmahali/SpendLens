import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { categories } from '../../mockData';

const fmt = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export default function Habits() {
  const cigs = categories.filter(c => c.category === 'Cigarettes');
  const total = cigs.reduce((s, c) => s + c.amount, 0);
  const count = cigs.length;
  const saved = total;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="titleLarge" style={styles.h1}>Habits</Text>
        <Text style={styles.sub}>Track what's costing you</Text>

        <Card style={styles.warn} testID="cigarette-warning-card">
          <Card.Content>
            <View style={styles.warnHead}>
              <Ionicons name="warning" size={26} color="#fff" />
              <Text style={styles.warnTitle}>Cigarettes</Text>
            </View>
            <Text style={styles.warnAmt} testID="cig-total-spent">{fmt(total)}</Text>
            <Text style={styles.warnLabel}>Total spent on cigarettes</Text>
          </Card.Content>
        </Card>

        <View style={styles.row}>
          <Card style={styles.stat} testID="cig-orders-card">
            <Card.Content>
              <Text style={styles.statLabel}>Orders</Text>
              <Text style={styles.statVal}>{count}</Text>
            </Card.Content>
          </Card>
          <Card style={styles.stat} testID="cig-avg-card">
            <Card.Content>
              <Text style={styles.statLabel}>Avg / order</Text>
              <Text style={styles.statVal}>{count ? fmt(total / count) : '₹0'}</Text>
            </Card.Content>
          </Card>
        </View>

        <Card style={styles.savedCard} testID="cig-saved-card">
          <Card.Content>
            <Ionicons name="leaf" size={22} color="#4ade80" />
            <Text style={styles.savedLabel}>You could have saved</Text>
            <Text style={styles.savedAmt}>{fmt(saved)}</Text>
            <Text style={styles.savedHint}>by skipping cigarettes entirely</Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0c0c0c' },
  scroll: { padding: 20, paddingBottom: 40 },
  h1: { color: '#fff', fontSize: 32, fontWeight: '700' },
  sub: { color: '#888', marginBottom: 20 },
  warn: { backgroundColor: '#7f1d1d', borderRadius: 16, marginBottom: 14 },
  warnHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  warnTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  warnAmt: { color: '#fff', fontSize: 40, fontWeight: '800', marginTop: 12 },
  warnLabel: { color: '#fecaca', marginTop: 2 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  stat: { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 14 },
  statLabel: { color: '#888', fontSize: 13 },
  statVal: { color: '#fff', fontSize: 24, fontWeight: '700', marginTop: 4 },
  savedCard: { backgroundColor: '#0f2a1a', borderRadius: 16, borderWidth: 1, borderColor: '#14532d' },
  savedLabel: { color: '#86efac', marginTop: 8, fontSize: 13 },
  savedAmt: { color: '#4ade80', fontSize: 32, fontWeight: '800', marginTop: 4 },
  savedHint: { color: '#86efac', marginTop: 4, fontSize: 12 },
});
