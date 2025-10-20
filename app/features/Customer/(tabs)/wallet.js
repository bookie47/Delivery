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
        setActivities([]);
        setShops({});
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
          <View style={styles.txDetails}>
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
        <View style={styles.txDetails}>
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.hero}>
        <View>
          <Text style={styles.heroTitle}>Wallet</Text>
          <Text style={styles.heroSubtitle}>Track your balance & activity</Text>
        </View>
        <TouchableOpacity style={styles.heroProfile} onPress={() => router.push('/features/Customer/TopUp')}>
          <Ionicons name="add" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
      <FocusFade style={{ flex: 1 }}>
        <View style={styles.content}>
          <View style={styles.balanceCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.balanceLabel}>Current Balance</Text>
              {loading ? (
                <SkeletonLine width={'60%'} height={28} style={{ marginTop: 10, backgroundColor: 'rgba(255,255,255,0.25)' }} />
              ) : (
                <Text style={styles.balanceValue}>{balance.toFixed(2)} THB</Text>
              )}
            </View>
            <TouchableOpacity style={styles.balanceAction} onPress={() => router.push('/features/Customer/TopUp')}>
              <Ionicons name="add-circle-outline" size={20} color="#FA4A0C" />
              <Text style={styles.balanceActionText}>Top Up</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push('/features/Customer/(tabs)/orderHistory')}>
              <Text style={styles.sectionLink}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.listCard}>
            {loading ? (
              <View style={styles.skeletonList}>
                {[...Array(4)].map((_, i) => (
                  <View key={i} style={[styles.txItem, styles.skeletonRow]}>
                    <SkeletonLine width={40} height={40} style={{ borderRadius: 20, backgroundColor: '#E5E7EB' }} />
                    <View style={styles.txDetails}>
                      <SkeletonLine width={'70%'} style={{ backgroundColor: '#E5E7EB' }} />
                      <SkeletonLine width={'40%'} style={{ marginTop: 8, backgroundColor: '#E5E7EB' }} />
                    </View>
                    <SkeletonLine width={80} style={{ backgroundColor: '#E5E7EB' }} />
                  </View>
                ))}
              </View>
            ) : (
              <FlatList
                data={activities.slice(0, 10)}
                keyExtractor={(it) => it.id}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View style={{ flex:1 }} />}
                contentContainerStyle={activities.length === 0 ? styles.emptyListContent : styles.listContent}
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
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  hero: {
    backgroundColor: '#FA4A0C',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  heroSubtitle: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.75)',
  },
  heroProfile: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 25,
    gap: 20,
  },
  balanceCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  balanceValue: {
    marginTop: 6,
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
  },
  balanceAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#fff',
  },
  balanceActionText: {
    color: '#FA4A0C',
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  actionTile: {
    flexBasis: '48%',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
    gap: 10,
  },
  actionTileDisabled: {
    opacity: 0.5,
  },
  actionLabel: {
    fontWeight: '600',
    color: '#111827',
  },
  actionLabelMuted: {
    color: '#6B7280',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  sectionLink: {
    color: '#2563EB',
    fontWeight: '600',
  },
  listCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'transparent',
  },
  txLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  txDetails: {
    flex: 1,
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
  skeletonList: {
    padding: 16,
    gap: 12,
  },
  skeletonRow: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
  },
  listContent: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  emptyListContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
});
