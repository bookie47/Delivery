import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { auth, db } from '../../../../firebase/connect';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { router } from 'expo-router';
import FocusFade from '../../../../components/FocusFade';

const placeholder = require('../../../../assets/profile/default.jpg');

const SkeletonLine = ({ width = '100%', height = 16, style }) => {
  const pulse = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return <Animated.View style={[{ width, height, borderRadius: 6, backgroundColor: '#E0E0E0', opacity: pulse }, style]} />;
};

export default function Wallet() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [activities, setActivities] = useState([]); // merged orders + topups
  const [shops, setShops] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u || null);
      if (!u) {
        setBalance(0);
        setOrders([]);
        setLoading(false);
        return;
      }
      try {
        // Fetch balance
        const userDoc = await getDoc(doc(db, 'users', u.uid));
        if (userDoc.exists()) {
          setBalance(userDoc.data().wallet || 0);
        }
        // Subscribe orders
        const orderQ = query(collection(db, 'orders'), where('userId', '==', u.uid));
        const unsubOrders = onSnapshot(orderQ, async (snap) => {
          const orders = [];
          snap.forEach((d) => orders.push({ id: d.id, type: 'order', ...d.data() }));
          // fetch shops lazily for new shopIds
          orders.forEach(async (o) => {
            if (o.shopId && !shops[o.shopId]) {
              const sDoc = await getDoc(doc(db, 'info', String(o.shopId)));
              if (sDoc.exists()) {
                setShops((prev) => ({ ...prev, [o.shopId]: sDoc.data() }));
              }
            }
          });
          // merge later with transactions inside combined setter below
          setActivities((prev) => {
            const prevTopups = prev.filter((a) => a.type === 'topup');
            const merged = [...orders, ...prevTopups];
            merged.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
            return merged;
          });
          setLoading(false);
        });

        // Subscribe topups
        const topupQ = query(collection(db, 'transactions'), where('userId', '==', u.uid));
        const unsubTopups = onSnapshot(topupQ, (snap) => {
          const topups = [];
          snap.forEach((d) => topups.push({ id: d.id, type: d.data().type || 'topup', ...d.data() }));

          setActivities((prev) => {
            const prevOrders = prev.filter((a) => a.type === 'order');
            const merged = [...prevOrders, ...topups];
            merged.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
            return merged;
          });
          setLoading(false);
        });

        return () => { unsubOrders(); unsubTopups(); };
      } catch (e) {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const renderItem = ({ item }) => {
    if (item.type === 'topup') {
      return (
        <View style={styles.txItem}>
          <View style={[styles.txLogo, { backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center' }]}> 
            <Ionicons name="wallet" size={18} color="#92400E" />
          </View>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={styles.txTitle}>Top Up</Text>
            <Text style={styles.txSub}>{new Date(item.createdAt?.toDate?.()).toLocaleString?.() || ''}</Text>
          </View>
          <Text style={[styles.txAmount, { color: '#16a34a' }]}>+ {Number(item.amount || 0).toFixed(2)} THB</Text>
        </View>
      );
    }

    // order row
    const shop = shops[item.shopId];
    const logoSrc = shop?.logo ? { uri: shop.logo } : placeholder;
    const statusColor = item.status === 'completed' ? '#16a34a' : '#f59e0b';
    const statusLabel = item.status === 'completed' ? 'Completed' : 'Pending';
    return (
      <View style={styles.txItem}>
        <Image source={logoSrc} style={styles.txLogo} />
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={styles.txTitle}>{shop?.name || 'Shop'}</Text>
          <Text style={styles.txSub}>{new Date(item.createdAt?.toDate?.()).toLocaleString?.() || ''}</Text>
        </View>
        <Text style={styles.txAmount}>- {Number(item.total || 0).toFixed(2)} THB</Text>
        <View style={[styles.statusChip, { backgroundColor: statusColor }]}>
          <Text style={{ color: 'white', fontSize: 10 }}>{statusLabel}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F6F6F6' }}>
      <FocusFade style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wallet</Text>
        </View>

        <View style={styles.container}>
          <View style={styles.balanceCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="wallet" size={24} color="#FA4A0C" />
              <Text style={styles.balanceLabel}>Current Balance</Text>
            </View>
            {loading ? (
              <SkeletonLine width={'60%'} height={28} style={{ marginTop: 10 }} />
            ) : (
              <Text style={styles.balanceValue}>{balance.toFixed(2)} THB</Text>
            )}

            <View style={styles.actions}>
              <TouchableOpacity style={[styles.button, { backgroundColor: '#FA4A0C' }]} onPress={() => router.push('/features/Customer/TopUp')}>
                <Ionicons name="add" size={18} color="white" />
                <Text style={styles.buttonText}>Top Up</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: '#E5E7EB' }]} disabled>
                <Ionicons name="download" size={18} color="#6B7280" />
                <Text style={[styles.buttonText, { color: '#6B7280' }]}>Withdraw</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: '#111827' }]} onPress={() => router.push('/features/Customer/(tabs)/orderHistory')}>
                <Ionicons name="time-outline" size={18} color="white" />
                <Text style={styles.buttonText}>History</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.listWrapper}>
            {loading ? (
              <View style={{ padding: 12 }}>
                {[...Array(4)].map((_, i) => (
                  <View key={i} style={[styles.txItem, { backgroundColor: 'white' }] }>
                    <SkeletonLine width={40} height={40} style={{ borderRadius: 20 }} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <SkeletonLine width={'70%'} />
                      <SkeletonLine width={'40%'} style={{ marginTop: 8 }} />
                    </View>
                    <SkeletonLine width={80} />
                  </View>
                ))}
              </View>
            ) : (
              <FlatList
                data={activities.slice(0, 10)}
                keyExtractor={(it) => it.id}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#6B7280', padding: 16 }}>No recent activity</Text>}
              />
            )}
          </View>
        </View>
      </FocusFade>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FA4A0C',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  balanceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceLabel: {
    marginLeft: 8,
    color: '#374151',
    fontWeight: '600',
  },
  balanceValue: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  actions: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  listWrapper: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  txLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  txTitle: {
    color: '#111827',
    fontWeight: '600',
  },
  txSub: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  txAmount: {
    color: '#111827',
    fontWeight: '700',
    marginRight: 8,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
});
