import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import FocusFade from '../../../../components/FocusFade';
import KeyboardAwareScreen from '../../../../components/KeyboardAwareScreen';
import AnimatedStoreCard from '../../../../components/AnimatedStoreCard';
import { SearchBar } from '../../../../components/searchBar';
import { auth, db } from '../../../../firebase/connect';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function Home() {
  const [balance, setBalance] = useState(0);
  const [userName, setUserName] = useState('');
  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchable, setSearchable] = useState([]);

  useEffect(() => {
    let active = true;
    async function fetchStores() {
      try {
        setLoadingStores(true);
        const querySnapshot = await getDocs(collection(db, 'info'));
        if (!active) return;
        const data = querySnapshot.docs.map((d) => ({
          id: Number(d.id),
          ...d.data(),
        }));
        data.sort((a, b) => a.id - b.id);
        setStores(data);

        const entries = [];
        data.forEach((store) => {
          entries.push({ id: store.id, name: store.name, type: 'store' });
          if (Array.isArray(store.menu)) {
            store.menu.forEach((menuItem) => {
              entries.push({
                id: menuItem.id,
                name: menuItem.name,
                type: 'menu',
                storeId: store.id,
                storeName: store.name,
              });
            });
          }
        });
        setSearchable(entries);
      } catch (error) {
        console.error('Error loading Firestore data:', error);
      } finally {
        if (active) setLoadingStores(false);
      }
    }
    fetchStores();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        getDoc(userDocRef)
          .then((docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              setBalance(Number(data.wallet || 0));
              setUserName(data.name || user.displayName || 'Foodie');
            } else {
              setBalance(0);
              setUserName(user.displayName || 'Foodie');
            }
          })
          .catch((error) => {
            console.log('Error getting document:', error);
            setBalance(0);
          });
      } else {
        setBalance(0);
        setUserName('');
      }
    });
    return () => unsubscribe();
  }, []);

  const filteredSearch = useMemo(() => {
    if (!searchQuery) return [];
    const lower = searchQuery.toLowerCase();
    return searchable.filter((item) => item.name.toLowerCase().includes(lower)).slice(0, 12);
  }, [searchQuery, searchable]);

  const topRatedStores = useMemo(() => {
    if (!Array.isArray(stores) || stores.length === 0) return [];
    const parseRate = (value) => {
      const numeric = Number(value);
      return Number.isNaN(numeric) ? 0 : numeric;
    };
    return [...stores]
      .sort((a, b) => parseRate(b?.rate) - parseRate(a?.rate))
      .slice(0, 5);
  }, [stores]);

  const quickActions = [
    {
      key: 'wallet',
      icon: 'wallet-outline',
      label: 'Wallet',
      background: '#EEF2FF',
      iconColor: '#4338CA',
      onPress: () => router.push('/features/Customer/(tabs)/wallet'),
    },
    {
      key: 'topup',
      icon: 'add-circle-outline',
      label: 'Top Up',
      background: '#ECFDF5',
      iconColor: '#047857',
      onPress: () => router.push('/features/Customer/TopUp'),
    },
    {
      key: 'orders',
      icon: 'receipt-outline',
      label: 'Orders',
      background: '#FFF7ED',
      iconColor: '#C2410C',
      onPress: () => router.push('/features/Customer/(tabs)/orderHistory'),
    },
    {
      key: 'profile',
      icon: 'person-circle-outline',
      label: 'Profile',
      background: '#F3F4F6',
      iconColor: '#374151',
      onPress: () => router.push('/features/Customer/profileUser'),
    },
  ];

  const handleSelect = (item) => {
    if (item.type === 'store') {
      router.push(`/features/Customer/InfoMarket?id=${item.id}`);
    } else if (item.type === 'menu') {
      router.push(`/features/Customer/InfoMarket?id=${item.storeId}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.hero}>
        <View>
          <Text style={styles.heroGreeting}>Hello, {userName || 'Foodie'} 👋</Text>
          <Text style={styles.heroSubtitle}>Where would you like to eat today?</Text>
        </View>
        <TouchableOpacity style={styles.heroProfile} onPress={() => router.push('/features/Customer/profileUser')}>
          <Ionicons name="settings-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
      <KeyboardAwareScreen contentContainerStyle={{ flexGrow: 1 }}>
        <FocusFade style={{ flex: 1 }}>
          <View style={styles.content}>
            <View style={styles.searchWrapper}>
              <SearchBar onSearch={setSearchQuery} suggestions={filteredSearch} onSelect={handleSelect} />
            </View>

            <View style={styles.walletCard}>
              <View>
                <Text style={styles.walletLabel}>Wallet Balance</Text>
                <Text style={styles.walletValue}>{balance.toFixed(2)} THB</Text>
              </View>
              <TouchableOpacity style={styles.walletAction} onPress={() => router.push('/features/Customer/TopUp')}>
                <Ionicons name="add-circle-outline" size={20} color="#FA4A0C" />
                <Text style={styles.walletActionText}>Top Up</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionsRow}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.key}
                  style={[styles.actionTile, { backgroundColor: action.background }]}
                  onPress={action.onPress}
                >
                  <Ionicons name={action.icon} size={22} color={action.iconColor} />
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Stores</Text>
              <TouchableOpacity onPress={() => router.push('/features/Customer/(tabs)/orderHistory')}>
                <Text style={styles.sectionLink}>Recent orders</Text>
              </TouchableOpacity>
            </View>

            {loadingStores ? (
              <View style={styles.loaderWrapper}>
                <ActivityIndicator size="large" color="#FA4A0C" />
                <Text style={styles.loaderText}>Loading menus…</Text>
              </View>
            ) : (
              <View style={styles.storesList}>
                {topRatedStores.map((item, idx) => (
                  <AnimatedStoreCard
                    key={item.id || idx}
                    item={item}
                    index={idx}
                    variant="banner"
                    onPress={() => router.push(`/features/Customer/InfoMarket?id=${item.id}`)}
                  />
                ))}
                {stores.length === 0 && (
                  <View style={styles.emptyState}>
                    <Ionicons name="restaurant-outline" size={36} color="#9CA3AF" />
                    <Text style={styles.emptyTitle}>No stores available</Text>
                    <Text style={styles.emptySubtitle}>Check back soon for new delicious options.</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </FocusFade>
      </KeyboardAwareScreen>
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
  heroGreeting: {
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
    paddingVertical: 20,
    gap: 20,
  },
  searchWrapper: {
    zIndex: 10,
  },
  walletCard: {
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
  walletLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  walletValue: {
    marginTop: 6,
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
  },
  walletAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  walletActionText: {
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
  actionLabel: {
    fontWeight: '600',
    color: '#111827',
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
  loaderWrapper: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loaderText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  storesList: {
    flexDirection: 'column',
    gap: 18,
  },
  emptyState: {
    marginTop: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  emptySubtitle: {
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 220,
  },
});
