import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
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

const COUNTDOWN_SECONDS = 60;
const WAITING_STATUSES = new Set([
  "pending",
  "waiting",
  "awaiting",
  "awaiting_confirmation",
  "requested",
]);
const ACCEPTED_STATUSES = new Set([
  "accepted",
  "accept",
  "preparing",
  "in_progress",
]);
const COMPLETED_STATUSES = new Set([
  "completed",
  "complete",
  "done",
  "finished",
]);
const CANCELLED_STATUSES = new Set([
  "cancelled",
  "canceled",
  "declined",
  "decline",
  "rejected",
  "cancelled_by_shop",
  "canceled_by_shop",
]);

const normalizeStatus = (status) => (status || "").toLowerCase();
const isWaitingStatus = (status) => WAITING_STATUSES.has(normalizeStatus(status));
const isAcceptedStatus = (status) =>
  ACCEPTED_STATUSES.has(normalizeStatus(status));
const isCompletedStatus = (status) =>
  COMPLETED_STATUSES.has(normalizeStatus(status));
const isCancelledStatus = (status) =>
  CANCELLED_STATUSES.has(normalizeStatus(status));

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
    const timerStart =
      item.timerStartedAt?.toDate?.() ??
      (item.timerStartedAt ? new Date(item.timerStartedAt) : null) ??
      item.acceptedAt?.toDate?.() ??
      (item.acceptedAt ? new Date(item.acceptedAt) : null);
    const status = normalizeStatus(item.status);
    const waiting = isWaitingStatus(status);
    const accepted = isAcceptedStatus(status);
    const completed = isCompletedStatus(status);
    const cancelled = isCancelledStatus(status);
    let remainingTime = 0;
    if (accepted) {
      if (timerStart instanceof Date && !Number.isNaN(timerStart.getTime())) {
        const elapsed = (Date.now() - timerStart.getTime()) / 1000;
        remainingTime = Math.max(0, COUNTDOWN_SECONDS - elapsed);
      } else {
        remainingTime = COUNTDOWN_SECONDS;
      }
    }
    const itemCount = item?.items
      ? Object.values(item.items).reduce(
          (acc, val) => acc + Number(val || 0),
          0
        )
      : 0;
    const totalDisplay = Number(item.total || 0).toFixed(2);
    let statusColor = "#4B5563";
    let statusLabel = item.status || "Unknown";
    if (waiting) {
      statusColor = "#F59E0B";
      statusLabel = "Awaiting confirmation";
    } else if (accepted) {
      statusColor = "#2563EB";
      statusLabel = "Accepted";
    } else if (completed) {
      statusColor = "#16A34A";
      statusLabel = "Completed";
    } else if (cancelled) {
      statusColor = "#DC2626";
      statusLabel =
        status === "declined" || status === "decline"
          ? "Declined"
          : "Cancelled";
    }
    const orderNumberLabel =
      item?.shopOrderNumber != null
        ? `#${String(item.shopOrderNumber).padStart(3, "0")}`
        : item?.orderNumber ||
          (item?.id ? `#${String(item.id).slice(-6).toUpperCase()}` : null);
    const timerStartKey =
      timerStart instanceof Date && !Number.isNaN(timerStart.getTime())
        ? timerStart.getTime()
        : "fallback";
    const countdownSeconds = Math.max(0, Math.ceil(remainingTime));

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
            {accepted && remainingTime > 0 ? (
              <View style={styles.countdownWrapper}>
                <CircularCountdown
                  key={`${item.id}-${timerStartKey}`}
                  duration={countdownSeconds}
                />
                <Text style={styles.countdownText}>
                  Shop accepted your order
                </Text>
              </View>
            ) : waiting ? (
              <View style={styles.waitingWrapper}>
                <Ionicons name="time-outline" size={14} color="#F59E0B" />
                <Text style={styles.waitingText}>Waiting for shop reply</Text>
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
  const timersRef = useRef({});

  const syncPendingOrdersStorage = useCallback(async (orders) => {
    try {
      const storedRaw =
        JSON.parse(await AsyncStorage.getItem("pendingOrders")) || [];
      const storedMap = new Map(
        storedRaw.map((entry) => [entry.orderId, entry])
      );
      const nowIso = new Date().toISOString();
      const updatedEntries = [];

      orders.forEach((order) => {
        const statusKey = normalizeStatus(order.status);
        if (
          !isWaitingStatus(statusKey) &&
          !isAcceptedStatus(statusKey)
        ) {
          return;
        }

        const createdDate =
          order.createdAt?.toDate?.() ??
          (order.createdAt instanceof Date ? order.createdAt : null);
        const existing =
          storedMap.get(order.id) || {
            orderId: order.id,
            createdAt:
              createdDate instanceof Date &&
              !Number.isNaN(createdDate.getTime())
                ? createdDate.toISOString()
                : nowIso,
            shopId: order.shopId ?? null,
            orderNumber: order.orderNumber ?? null,
            shopOrderNumber: order.shopOrderNumber ?? null,
            acceptedAt: null,
          };

        if (isAcceptedStatus(statusKey)) {
          const docAccepted =
            order.timerStartedAt?.toDate?.() ??
            (order.timerStartedAt ? new Date(order.timerStartedAt) : null) ??
            order.acceptedAt?.toDate?.() ??
            (order.acceptedAt ? new Date(order.acceptedAt) : null);
          if (
            docAccepted instanceof Date &&
            !Number.isNaN(docAccepted.getTime())
          ) {
            existing.acceptedAt = docAccepted.toISOString();
          } else if (!existing.acceptedAt) {
            existing.acceptedAt = new Date().toISOString();
          }
        } else {
          existing.acceptedAt = existing.acceptedAt ?? null;
        }

        updatedEntries.push(existing);
      });

      await AsyncStorage.setItem(
        "pendingOrders",
        JSON.stringify(updatedEntries)
      );
    } catch (error) {
      console.error("Failed to sync pending orders cache:", error);
    }
  }, [syncPendingOrdersStorage]);

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

      const activeOrders = ordersData
        .filter((order) => {
          const statusKey = normalizeStatus(order.status);
          if (isCompletedStatus(statusKey) || isCancelledStatus(statusKey)) {
            return false;
          }
          return (
            isWaitingStatus(statusKey) || isAcceptedStatus(statusKey)
          );
        })
        .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));

      const historicalOrders = ordersData
        .filter((order) => {
          const statusKey = normalizeStatus(order.status);
          if (isCompletedStatus(statusKey) || isCancelledStatus(statusKey)) {
            return true;
          }
          return (
            !isWaitingStatus(statusKey) && !isAcceptedStatus(statusKey)
          );
        })
        .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));

      setInProgressOrders(activeOrders);
      setHistoryOrders(historicalOrders);
      await syncPendingOrdersStorage(ordersData);

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
  }, [syncPendingOrdersStorage]);

  useEffect(() => {
    let isActive = true;

    const managePendingOrderTimers = async () => {
      try {
        const stored =
          JSON.parse(await AsyncStorage.getItem("pendingOrders")) || [];
        const activeMap = new Map(
          inProgressOrders.map((order) => [order.id, order])
        );
        const updatedEntries = [];
        const now = Date.now();

        for (const entry of stored) {
          const order = activeMap.get(entry.orderId);
          const statusKey = normalizeStatus(order?.status);

          // Clear timers for orders no longer active
          if (
            !order ||
            (!isWaitingStatus(statusKey) && !isAcceptedStatus(statusKey))
          ) {
            if (timersRef.current[entry.orderId]) {
              clearTimeout(timersRef.current[entry.orderId]);
              delete timersRef.current[entry.orderId];
            }
            continue;
          }

          if (!isAcceptedStatus(statusKey)) {
            if (timersRef.current[entry.orderId]) {
              clearTimeout(timersRef.current[entry.orderId]);
              delete timersRef.current[entry.orderId];
            }
            updatedEntries.push({ ...entry, acceptedAt: null });
            continue;
          }

          let acceptedAtIso = entry.acceptedAt;
          const docTimerStart =
            order.timerStartedAt?.toDate?.() ??
            (order.timerStartedAt ? new Date(order.timerStartedAt) : null) ??
            order.acceptedAt?.toDate?.() ??
            (order.acceptedAt ? new Date(order.acceptedAt) : null);

          if (!acceptedAtIso) {
            const acceptedDate =
              docTimerStart instanceof Date &&
              !Number.isNaN(docTimerStart.getTime())
                ? docTimerStart
                : new Date();
            acceptedAtIso = acceptedDate.toISOString();
          }

          const startMillis = new Date(acceptedAtIso).getTime();
          if (Number.isNaN(startMillis)) {
            continue;
          }

          const elapsed = now - startMillis;
          const remaining = COUNTDOWN_SECONDS * 1000 - elapsed;

          if (remaining <= 0) {
            await updateDoc(doc(db, "orders", entry.orderId), {
              status: "completed",
            });
            if (timersRef.current[entry.orderId]) {
              clearTimeout(timersRef.current[entry.orderId]);
              delete timersRef.current[entry.orderId];
            }
            continue;
          }

          const nextEntry = { ...entry, acceptedAt: acceptedAtIso };

          if (timersRef.current[entry.orderId]) {
            clearTimeout(timersRef.current[entry.orderId]);
          }

          timersRef.current[entry.orderId] = setTimeout(async () => {
            try {
              await updateDoc(doc(db, "orders", entry.orderId), {
                status: "completed",
              });
            } catch (error) {
              console.error("Failed to mark order completed:", error);
            } finally {
              const latest =
                JSON.parse(await AsyncStorage.getItem("pendingOrders")) || [];
              const filtered = latest.filter(
                (pending) => pending.orderId !== entry.orderId
              );
              await AsyncStorage.setItem(
                "pendingOrders",
                JSON.stringify(filtered)
              );
              if (timersRef.current[entry.orderId]) {
                clearTimeout(timersRef.current[entry.orderId]);
                delete timersRef.current[entry.orderId];
              }
            }
          }, remaining);

          updatedEntries.push(nextEntry);
        }

        if (!isActive) {
          return;
        }

        await AsyncStorage.setItem(
          "pendingOrders",
          JSON.stringify(updatedEntries)
        );
      } catch (error) {
        console.error("Failed to manage pending order timers:", error);
      }
    };

    managePendingOrderTimers();

    return () => {
      isActive = false;
      Object.values(timersRef.current).forEach((timer) =>
        clearTimeout(timer)
      );
      timersRef.current = {};
    };
  }, [inProgressOrders]);

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
        accent: "#19bc00ff",
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
  waitingWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(245,158,11,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  waitingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#B45309",
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
