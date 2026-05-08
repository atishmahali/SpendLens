import { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSpending } from '../../lib/useSpending';

const fmt = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export default function Categories() {
  const { cats, loading } = useSpending();
  const [open, setOpen] = useState(null);

  const totals = cats.reduce((m, c) => {
    if (!m[c.category]) m[c.category] = { total: 0, subs: {} };
    m[c.category].total += Number(c.amount);
    m[c.category].subs[c.subcategory || c.category] = (m[c.category].subs[c.subcategory || c.category] || 0) + Number(c.amount);
    return m;
  }, {});
  const list = Object.entries(totals).sort((a, b) => b[1].total - a[1].total);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="titleLarge" style={styles.h1}>Categories</Text>
        <Text style={styles.sub}>Where your money goes</Text>
        {loading && <ActivityIndicator color="#FF5A5F" style={{ marginTop: 40 }} />}
        {!loading && list.length === 0 && (
          <Card style={styles.empty}><Card.Content>
            <Text style={styles.emptyTitle}>No categories yet</Text>
            <Text style={styles.emptyText}>Categories appear once orders are captured.</Text>
          </Card.Content></Card>
        )}
        {list.map(([cat, data]) => {
          const isOpen = open === cat;
          return (
            <View key={cat}>
              <TouchableOpacity onPress={() => setOpen(isOpen ? null : cat)} testID={`cat-${cat.toLowerCase()}`}>
                <Card style={styles.card}>
                  <Card.Content style={styles.cardRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.catName}>{cat}</Text>
                      <Text style={styles.catAmt}>{fmt(data.total)}</Text>
                    </View>
                    <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={22} color="#888" />
                  </Card.Content>
                </Card>
              </TouchableOpacity>
              {isOpen && (
                <View style={styles.subBox} testID={`subs-${cat.toLowerCase()}`}>
                  {Object.entries(data.subs).sort((a, b) => b[1] - a[1]).map(([s, amt]) => (
                    <View key={s} style={styles.subRow}>
                      <Text style={styles.subName}>{s}</Text>
                      <Text style={styles.subAmt}>{fmt(amt)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0c0c0c' },
  scroll: { padding: 20, paddingBottom: 40 },
  h1: { color: '#fff', fontSize: 32, fontWeight: '700' },
  sub: { color: '#888', marginBottom: 20 },
  card: { backgroundColor: '#1a1a1a', marginBottom: 10, borderRadius: 14 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  catName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  catAmt: { color: '#FF5A5F', fontSize: 22, fontWeight: '700', marginTop: 2 },
  subBox: { backgroundColor: '#141414', borderRadius: 12, marginBottom: 10, paddingHorizontal: 16, paddingVertical: 8 },
  subRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#222' },
  subName: { color: '#ccc', fontSize: 14 },
  subAmt: { color: '#fff', fontSize: 14, fontWeight: '600' },
  empty: { backgroundColor: '#1a1a1a', borderRadius: 14 },
  emptyTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptyText: { color: '#aaa', fontSize: 13 },
});
