import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { db, auth } from "../../../../firebase/connect";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CircularCountdown from "../../../../components/CircularCountdown";
import FocusFade from "../../../../components/FocusFade";

const placeholder = require("../../../../assets/profile/default.jpg");

const OrderList = ({
  orders,
  shops,
  emptyLabel = "No orders yet.",
  scrollEnabled = true,
}) => {
  const renderOrderItem = ({ item }) => {
    const shop = shops[String(item.shopId ?? "")];
    if (!shop) return null;

    const rawCreatedAt =
      item.createdAt?.toDate?.() ??
      (item.createdAt ? new Date(item.createdAt) : null);
    const createdDate =
      rawCreatedAt instanceof Date && !Number.isNaN(rawCreatedAt.getTime())
        ? rawCreatedAt
        : null;
    const createdMillis = createdDate ? createdDate.getTime() : 0;
    const remainingTime = createdDate
      ? 60 - (Date.now() - createdMillis) / 1000
      : 0;
    const itemCount = item?.items
      ? Object.values(item.items).reduce(
          (acc, val) => acc + Number(val || 0),
          0
        )
      : 0;
    const totalDisplay = Number(item.total || 0).toFixed(2);
    const statusColor =
      item.status === "completed"
        ? "#16A34A"
        : item.status === "pending"
        ? "#F59E0B"
        : "#4B5563";
    const statusLabel =
      item.status === "completed"
        ? "Completed"
        : item.status === "pending"
        ? "Preparing"
        : item.status || "Unknown";
    const orderNumberLabel =
      item.orderNumber ||
      (item.id ? `#${String(item.id).slice(-6).toUpperCase()}` : null);

    return (
      <TouchableOpacity
        style={styles.orderCard}
        activeOpacity={0.9}
        onPress={() =>
          router.push({
            pathname: "/features/Customer/OrderDetail",
            params: { orderId: item.id },
          })
        }
      >
        <View style={styles.orderHeader}>
          <View style={styles.shopInfo}>
            <Image
              source={shop.logo ? { uri: shop.logo } : placeholder}
              style={styles.shopImage}
            />
            <View style={styles.orderHeaderText}>
              <Text numberOfLines={1} style={styles.shopName}>
                {shop.name}
              </Text>
              {!!orderNumberLabel && (
                <Text style={styles.orderNumberLabel}>
                  {orderNumberLabel}
                </Text>
              )}
              <Text style={styles.orderTimestamp}>
                {createdDate ? createdDate.toLocaleString() : ""}
              </Text>
            </View>
          </View>
          <View style={[styles.statusChip, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.orderBody}>
          <View style={styles.orderMetaRow}>
            <View style={styles.metaPill}>
              <Ionicons name="cube-outline" size={14} color="#FA4A0C" />
              <Text style={styles.metaPillText}>{itemCount} items</Text>
            </View>
            <Text style={styles.orderTotal}>{totalDisplay} THB</Text>
          </View>

          <View style={styles.orderFooter}>
            {item.status === "pending" && remainingTime > 0 ? (
              <View style={styles.countdownWrapper}>
                <CircularCountdown duration={remainingTime} />
                <Text style={styles.countdownText}>Preparing your order</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.orderAgainButton}
                onPress={() =>
                  item.shopId &&
                  router.push(`/features/Customer/InfoMarket?id=${item.shopId}`)
                }
                disabled={!item.shopId}
              >
                <Ionicons name="arrow-redo-outline" size={16} color="#fff" />
                <Text style={styles.orderAgainText}>Order again</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.viewShopLink}
              onPress={() =>
                router.push({
                  pathname: "/features/Customer/OrderDetail",
                  params: { orderId: item.id },
                })
              }
            >
              <Text style={styles.viewShopText}>View Details</Text>
              <Ionicons name="chevron-forward" size={12} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={orders}
      renderItem={renderOrderItem}
      keyExtractor={(item) => item.id}
      scrollEnabled={scrollEnabled}
      nestedScrollEnabled
      style={styles.orderList}
      contentContainerStyle={[
        styles.listContainer,
        orders.length === 0 ? styles.emptyListContent : styles.listContent,
      ]}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      ListEmptyComponent={<Text style={styles.emptyText}>{emptyLabel}</Text>}
    />
  );
};

export default function OrderHistory() {
  const [inProgressOrders, setInProgressOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [shops, setShops] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("inProgress");
  const shopCacheRef = useRef({});

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setInProgressOrders([]);
      setHistoryOrders([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, "orders"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      setLoading(true);
      const ordersData = [];
      querySnapshot.forEach((docSnap) => {
        ordersData.push({ id: docSnap.id, ...docSnap.data() });
      });

      const toMillis = (value) => {
        if (value?.toDate) return value.toDate().getTime();
        if (value instanceof Date) return value.getTime();
        if (typeof value === "number") return value;
        return 0;
      };

      const pending = ordersData
        .filter((order) => order.status === "pending")
        .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
      const completed = ordersData
        .filter((order) => order.status === "completed")
        .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));

      setInProgressOrders(pending);
      setHistoryOrders(completed);

      const fetchShopData = async (shopId) => {
        const key = String(shopId || "");
        if (!key || shopCacheRef.current[key]) return;
        const shopDocRef = doc(db, "info", key);
        const shopDoc = await getDoc(shopDocRef);
        if (shopDoc.exists()) {
          const data = shopDoc.data();
          shopCacheRef.current = { ...shopCacheRef.current, [key]: data };
          setShops((prev) => ({ ...prev, [key]: data }));
        }
      };

      await Promise.all(ordersData.map((order) => fetchShopData(order.shopId)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkPendingOrders = async () => {
      let pendingOrders =
        JSON.parse(await AsyncStorage.getItem("pendingOrders")) || [];
      const now = new Date();

      for (const order of pendingOrders) {
        const orderDocRef = doc(db, "orders", order.orderId);
        const orderDoc = await getDoc(orderDocRef);

        if (!orderDoc.exists()) {
          pendingOrders = pendingOrders.filter(
            (p) => p.orderId !== order.orderId
          );
          await AsyncStorage.setItem(
            "pendingOrders",
            JSON.stringify(pendingOrders)
          );
          continue;
        }

        const orderTime = new Date(order.createdAt);
        const diff = now.getTime() - orderTime.getTime();

        if (diff >= 60000) {
          await updateDoc(orderDocRef, { status: "completed" });
          pendingOrders = pendingOrders.filter(
            (p) => p.orderId !== order.orderId
          );
          await AsyncStorage.setItem(
            "pendingOrders",
            JSON.stringify(pendingOrders)
          );
        } else {
          setTimeout(async () => {
            await updateDoc(orderDocRef, { status: "completed" });
            const updatedPendingOrders =
              JSON.parse(await AsyncStorage.getItem("pendingOrders")) || [];
            const filtered = updatedPendingOrders.filter(
              (p) => p.orderId !== order.orderId
            );
            await AsyncStorage.setItem(
              "pendingOrders",
              JSON.stringify(filtered)
            );
          }, 60000 - diff);
        }
      }
    };

    checkPendingOrders();
  }, []);

  const summaryMetrics = useMemo(() => {
    const totalSpent = historyOrders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );
    return [
      {
        key: "active",
        label: "Active Orders",
        value: inProgressOrders.length,
        accent: "#F97316",
        softAccent: "rgba(249,115,22,0.12)",
        icon: "bicycle-outline",
      },
      {
        key: "completed",
        label: "Completed",
        value: historyOrders.length,
        accent: "#16A34A",
        softAccent: "rgba(22,163,74,0.12)",
        icon: "checkmark-circle-outline",
      },
      {
        key: "spent",
        label: "Total Spent",
        value: `${totalSpent.toFixed(2)} `,
        accent: "#2563EB",
        softAccent: "rgba(37,99,235,0.12)",
        icon: "wallet-outline",
      },
    ];
  }, [historyOrders, inProgressOrders]);

  const orderTabs = useMemo(
    () => [
      {
        key: "inProgress",
        label: "In Progress",
        subtitle: "Track active deliveries in real time",
        icon: "timer-outline",
        accent: "#FA4A0C",
        softAccent: "rgba(250,74,12,0.16)",
        count: inProgressOrders.length,
        emptyLabel: "No active orders.",
      },
      {
        key: "history",
        label: "History",
        subtitle: "Browse completed orders anytime",
        icon: "time-outline",
        accent: "#2563EB",
        softAccent: "rgba(37,99,235,0.16)",
        count: historyOrders.length,
        emptyLabel: "No past orders yet.",
      },
    ],
    [inProgressOrders.length, historyOrders.length]
  );

  const activeTabMeta =
    orderTabs.find((tab) => tab.key === activeTab) ?? orderTabs[0];

  const displayedOrders =
    activeTabMeta?.key === "history" ? historyOrders : inProgressOrders;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.hero}>
        <View>
          <Text style={styles.heroTitle}>Orders</Text>
          <Text style={styles.heroSubtitle}>
            Track active deliveries & history
          </Text>
        </View>
        <TouchableOpacity
          style={styles.heroProfile}
          onPress={() => router.push("/features/Customer/(tabs)/wallet")}
        >
          <Ionicons name="wallet-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
      <FocusFade style={styles.contentWrapper}>
        <View style={styles.summaryCard}>
          {summaryMetrics.map((metric) => (
            <View key={metric.key} style={styles.summaryItem}>
              <View
                style={[
                  styles.summaryIcon,
                  { backgroundColor: metric.softAccent },
                ]}
              >
                <Ionicons name={metric.icon} size={18} color={metric.accent} />
              </View>
              <Text style={styles.summaryLabel}>{metric.label}</Text>
              <View style={styles.summaryValueBox}>
                <Text style={styles.summaryValue}>{metric.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.sectionsContainer}>
          <View
            style={[
              styles.sectionCard,
              activeTabMeta?.key === "history"
                ? styles.sectionCardHistory
                : styles.sectionCardActive,
            ]}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View
                  style={[
                    styles.sectionIcon,
                    { backgroundColor: activeTabMeta?.softAccent },
                  ]}
                >
                  <Ionicons
                    name={activeTabMeta?.icon ?? "timer-outline"}
                    size={18}
                    color={activeTabMeta?.accent ?? "#FA4A0C"}
                  />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>
                    {activeTabMeta?.label ?? "Orders"}
                  </Text>
                  <Text style={styles.sectionSubtitle}>
                    {activeTabMeta?.subtitle ?? ""}
                  </Text>
                </View>
              </View>
              {typeof activeTabMeta?.count === "number" && (
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>
                    {activeTabMeta.count}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.tabBar}>
              {orderTabs.map((tab) => {
                const isActive = tab.key === activeTab;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[
                      styles.tabButton,
                      isActive && styles.tabButtonActive,
                    ]}
                    onPress={() => setActiveTab(tab.key)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.tabButtonInner}>
                      <Ionicons
                        name={tab.icon}
                        size={16}
                        color={isActive ? tab.accent : "#6B7280"}
                      />
                      <Text
                        style={[
                          styles.tabButtonLabel,
                          isActive && styles.tabButtonLabelActive,
                        ]}
                      >
                        {tab.label}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.tabButtonBadge,
                        isActive && { backgroundColor: tab.accent },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tabButtonBadgeText,
                          isActive && styles.tabButtonBadgeTextActive,
                        ]}
                      >
                        {tab.count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {loading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator color="#FA4A0C" />
                <Text style={styles.loadingText}>Loading orders...</Text>
              </View>
            ) : (
              <View style={styles.sectionContent}>
                <OrderList
                  orders={displayedOrders}
                  shops={shops}
                  emptyLabel={activeTabMeta?.emptyLabel}
                />
              </View>
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
    backgroundColor: "#ffffffff",
  },
  hero: {
    backgroundColor: "#FA4A0C",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  heroSubtitle: {
    marginTop: 6,
    color: "rgba(255,255,255,0.75)",
  },
  heroProfile: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 20,
    paddingBottom: 32,
  },
  sectionsContainer: {
    flex: 1,
    gap: 20,
    minHeight: 0,
  },
  summaryCard: {
    
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
    gap: 18,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.02)",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent:'space-between',
    gap: 10,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: {
    color: "#6B7280",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "700",
    textAlign: "center",
  },
  summaryValue: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },
  summaryValueBox: {
    height: 24, // ✅ ให้ความสูงเท่ากันทุกช่อง
    justifyContent: "center",
    alignItems: "center",
  },

  sectionCard: {
    flex: 1,
    minHeight: 385,
    backgroundColor: "#fff",
    borderRadius: 20,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
    paddingVertical: 20,
    paddingHorizontal: 18,
    gap: 18,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
  },
  sectionCardActive: {
    backgroundColor: "#FFF7ED",
    borderColor: "rgba(250,74,12,0.18)",
  },
  sectionCardHistory: {
    backgroundColor: "#F8FAFF",
    borderColor: "rgba(37,99,235,0.18)",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(17,24,39,0.08)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  sectionBadge: {
    minWidth: 28,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
  sectionContent: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    minHeight: 180,
    backgroundColor: "#fff",
  },
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(17,24,39,0.05)",
    padding: 6,
    borderRadius: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: "#fff",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  tabButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tabButtonLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    paddingRight: 2,
  },
  tabButtonLabelActive: {
    color: "#111827",
  },
  tabButtonBadge: {
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5E7EB",
  },
  tabButtonBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4B5563",
  },
  tabButtonBadgeTextActive: {
    color: "#fff",
  },
  orderList: {
    flex: 1,
    minHeight: 0,
  },
  listContainer: {
    flexGrow: 1,
    paddingVertical: 4,
  },
  listContent: {
    gap: 12,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    fontWeight: "500",
  },
  loadingState: {
    paddingVertical: 28,
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: "#6B7280",
    fontWeight: "500",
    fontSize: 13,
  },
  orderCard: {
    flexDirection: "column",
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    padding: 18,
    gap: 18,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.05)",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shopInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  shopImage: {
    height: 56,
    width: 56,
    borderRadius: 14,
    resizeMode: "cover",
    backgroundColor: "#fff",
  },
  orderHeaderText: {
    flex: 1,
    gap: 4,
  },
  shopName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  orderNumberLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  orderTimestamp: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "500",
  },
  orderBody: {
    gap: 14,
  },
  orderMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(250,74,12,0.08)",
  },
  metaPillText: {
    color: "#FA4A0C",
    fontWeight: "600",
    fontSize: 12,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  orderTotal: {
    color: "#FA4A0C",
    fontWeight: "700",
    fontSize: 16,
  },
  orderFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  orderAgainButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    backgroundColor: "#FA4A0C",
    paddingHorizontal: 16,
    paddingVertical: 10,
    opacity: 0.9,
  },
  orderAgainText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.3,
  },
  countdownWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(55,65,81,0.06)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  countdownText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  viewShopLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  viewShopText: {
    color: "#6B7280",
    fontWeight: "600",
    fontSize: 12,
  },
});
