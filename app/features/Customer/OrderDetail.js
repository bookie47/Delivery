import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/connect';
import Ionicons from '@expo/vector-icons/Ionicons';

const placeholder = require('../../../assets/profile/default.jpg');

export default function OrderDetail() {
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          const orderData = { id: orderSnap.id, ...orderSnap.data() };
          setOrder(orderData);

          if (orderData.shopId) {
            const shopRef = doc(db, 'info', String(orderData.shopId));
            const shopSnap = await getDoc(shopRef);
            if (shopSnap.exists()) {
              setShop(shopSnap.data());
            }
          }
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const orderItems = useMemo(() => {
    if (!order?.items || !shop?.menu) return [];
    return Object.entries(order.items).map(([menuId, quantity]) => {
      const menuItem = shop.menu.find(item => item.id === menuId);
      return { ...menuItem, quantity };
    }).filter(item => item.id && item.price); // Ensure item is valid
  }, [order, shop]);

  const subtotal = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [orderItems]);

  const deliveryFee = useMemo(() => {
    if (order?.total != null && subtotal != null) {
        const fee = order.total - subtotal;
        return fee >= 0 ? fee : 0;
    }
    return 0;
  }, [order, subtotal]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FA4A0C" />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Order not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const createdDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
  const statusColor = order.status === 'completed' ? '#16A34A' : '#F59E0B';
  const statusLabel = order.status === 'completed' ? 'Completed' : 'Preparing';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Image source={shop?.logo ? { uri: shop.logo } : placeholder} style={styles.shopImage} />
            <View style={styles.shopInfo}>
              <Text style={styles.shopName}>{shop?.name || 'Shop'}</Text>
              <Text style={styles.orderDate}>{createdDate.toLocaleString()}</Text>
            </View>
            <View style={[styles.statusChip, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Address</Text>
          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={20} color="#FA4A0C" />
            <Text style={styles.addressText}>{order.deliveryAddress || 'No address provided'}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          {orderItems.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemQuantity}>{item.quantity}x</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>฿{(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Details</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>฿{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Delivery Fee</Text>
            <Text style={styles.totalValue}>฿{deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>฿{order.total?.toFixed(2) || '0.00'}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  header: {
    backgroundColor: '#FA4A0C',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  backButton: { padding: 5 },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#666' },
  scrollContent: { padding: 15, gap: 15, paddingBottom: 30 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  shopImage: { width: 50, height: 50, borderRadius: 10, backgroundColor: '#eee' },
  shopInfo: { flex: 1, marginLeft: 10, gap: 2 },
  shopName: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  orderDate: { fontSize: 12, color: '#666' },
  statusChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#222' },
  addressContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addressText: { flex: 1, fontSize: 14, color: '#444', lineHeight: 20 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemQuantity: { fontSize: 14, color: '#666', fontWeight: 'bold' },
  itemName: { flex: 1, fontSize: 14, color: '#222', marginHorizontal: 10 },
  itemPrice: { fontSize: 14, fontWeight: 'bold', color: '#222' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  totalLabel: { fontSize: 14, color: '#666' },
  totalValue: { fontSize: 14, color: '#222', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 10 },
  grandTotalLabel: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  grandTotalValue: { fontSize: 16, fontWeight: 'bold', color: '#FA4A0C' },
});