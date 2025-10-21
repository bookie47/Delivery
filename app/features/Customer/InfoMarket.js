import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  Alert,
  Animated,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { BannerMarket } from "../../../components/bannerMarket";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router, useLocalSearchParams } from "expo-router";
import CheckoutSheet from "../../../components/CheckOut";
import { db, auth } from "../../../firebase/connect";
import { doc, getDoc, collection, runTransaction } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const placeholder = require("../../../assets/profile/default.jpg");

export default function InfoMarket() {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [open, setOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const badgeScale = useRef(new Animated.Value(0)).current;
  const { id } = useLocalSearchParams();

  useEffect(() => {
    async function fetchShop() {
      if (!id) return;
      try {
        const docRef = doc(db, "info", String(id));
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setShop({ id: snap.id, ...snap.data() });
        } else {
          console.warn("Shop not found for id", id);
          setShop(null);
        }
      } catch (err) {
        console.error("Error fetching shop:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchShop();
  }, [id]);

  const handleAdd = (menuId) => {
    setCart((prev) => ({
      ...prev,
      [menuId]: (prev[menuId] || 0) + 1,
    }));
  };

  const handleMinus = (menuId) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[menuId] > 1) {
        updated[menuId] -= 1;
      } else {
        delete updated[menuId];
      }
      return updated;
    });
  };

  const totalItems = Object.values(cart).reduce(
    (sum, quantity) => sum + quantity,
    0
  );

  const totalPrice = useMemo(() => {
    if (!shop?.menu) return 0;
    return Object.entries(cart).reduce((sum, [menuId, quantity]) => {
      const menuItem = shop.menu.find((item) => item.id === menuId);
      if (!menuItem) return sum;
      return sum + Number(menuItem.price || 0) * quantity;
    }, 0);
  }, [cart, shop]);

  useEffect(() => {
    if (orderPlaced) {
      setOpen(false);
      router.push("/features/Customer/orderHistory");
    }
  }, [orderPlaced]);

  useEffect(() => {
    if (totalItems > 0) {
      Animated.sequence([
        Animated.spring(badgeScale, {
          toValue: 1.2,
          useNativeDriver: true,
          friction: 5,
          tension: 140,
        }),
        Animated.spring(badgeScale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 6,
          tension: 120,
        }),
      ]).start();
    } else {
      badgeScale.setValue(0);
    }
  }, [totalItems]);

  const handleOrderSuccess = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to place an order.");
      return;
    }

    if (!id) {
      Alert.alert("Error", "Shop information is missing.");
      return;
    }

    if (!totalItems) {
      Alert.alert("Cart Empty", "Please add menu items before placing an order.");
      return;
    }

    const orderTotal = Number(totalPrice || 0);
    const userDocRef = doc(db, "users", user.uid);
    const counterDocRef = doc(db, "shopOrderCounters", String(id));
    const orderRef = doc(collection(db, "orders"));
    const createdAt = new Date();

    try {
      const { orderNumber, shopOrderNumber } = await runTransaction(
        db,
        async (transaction) => {
          const userSnapshot = await transaction.get(userDocRef);
          if (!userSnapshot.exists()) {
            throw new Error("USER_NOT_FOUND");
          }

          const walletBalance = Number(userSnapshot.data().wallet || 0);
          if (walletBalance < orderTotal) {
            throw new Error("INSUFFICIENT_FUNDS");
          }

          const counterSnapshot = await transaction.get(counterDocRef);
          const currentOrderNumber = counterSnapshot.exists()
            ? Number(counterSnapshot.data().lastOrderNumber || 0)
            : 0;
          const nextOrderNumber = currentOrderNumber + 1;
          const paddedOrderNumber = `#${String(nextOrderNumber).padStart(
            3,
            "0"
          )}`;

          transaction.update(userDocRef, {
            wallet: walletBalance - orderTotal,
          });

          transaction.set(
            counterDocRef,
            {
              lastOrderNumber: nextOrderNumber,
              updatedAt: createdAt,
            },
            { merge: true }
          );

          transaction.set(orderRef, {
            userId: user.uid,
            shopId: id,
            items: cart,
            total: orderTotal,
            createdAt,
            status: "pending",
            orderNumber: paddedOrderNumber,
            shopOrderNumber: nextOrderNumber,
          });

          return {
            orderNumber: paddedOrderNumber,
            shopOrderNumber: nextOrderNumber,
          };
        }
      );

      const pendingOrders =
        JSON.parse(await AsyncStorage.getItem("pendingOrders")) || [];
      pendingOrders.push({
        orderId: orderRef.id,
        createdAt,
        orderNumber,
        shopOrderNumber,
        shopId: id,
      });
      await AsyncStorage.setItem(
        "pendingOrders",
        JSON.stringify(pendingOrders)
      );
      Alert.alert(
        "Success",
        `Order placed successfully!\nShop order number: ${orderNumber}`
      );
      setCart({});
      setOrderPlaced(true);
    } catch (error) {
      if (error.message === "INSUFFICIENT_FUNDS") {
        Alert.alert("Error", "Insufficient funds.");
        return;
      }
      if (error.message === "USER_NOT_FOUND") {
        Alert.alert(
          "Error",
          "Unable to locate your account. Please try again."
        );
        return;
      }
      console.error("Error placing order: ", error);
      Alert.alert("Error", "Failed to place order.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View pointerEvents="none" style={styles.backgroundAccent} />
        <View pointerEvents="none" style={styles.backgroundAccentSecondary} />

        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, styles.iconButtonCart]}
            onPress={() => setOpen(true)}
            activeOpacity={0.85}
          >
            <FontAwesome5 name="shopping-cart" size={18} color="#FA4A0C" />
            {totalItems > 0 && (
              <Animated.View
                style={[
                  styles.badgeContainer,
                  { transform: [{ scale: badgeScale }] },
                ]}
              >
                <Text style={styles.badgeText}>{totalItems}</Text>
              </Animated.View>
            )}
          </TouchableOpacity>
        </View>

        <KeyboardAwareScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroSection}>
            <View style={styles.bannerWrapper}>
              <BannerMarket shop={shop} />
            </View>
          </View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Menu</Text>
            <Text style={styles.sectionSubtitleText}>
              Select your favorites and add them to the cart
            </Text>
          </View>

          <View style={styles.menuList}>
            {loading ? (
              [...Array(4)].map((_, idx) => <SkeletonItem key={idx} />)
            ) : shop?.menu?.length ? (
              shop.menu.map((item) => {
                const quantity = cart[item.id] || 0;
                const displayPrice = Number(item.price || 0).toFixed(2);
                const imageSource = item.imageUrl
                  ? { uri: item.imageUrl }
                  : placeholder;
                return (
                  <View key={item.id} style={styles.menuCardWrapper}>
                    <View style={styles.menuCard}>
                      <View style={styles.menuAccentBar} />
                      <View style={styles.menuImageWrapper}>
                        <Image source={imageSource} style={styles.menuImage} />
                      </View>
                      <View style={styles.menuDetails}>
                        <View style={styles.menuHeader}>
                          <Text style={styles.menuName} numberOfLines={2}>
                            {item.name}
                          </Text>
                          <Text style={styles.menuPrice}>
                            {displayPrice} THB
                          </Text>
                        </View>
                        {item.description ? (
                          <Text
                            style={styles.menuDescription}
                            numberOfLines={2}
                          >
                            {item.description}
                          </Text>
                        ) : null}
                        <View style={styles.menuFooter}>
                          <View style={styles.counterGroup}>
                            <Bouncy onPress={() => handleMinus(item.id)}>
                              <AntDesign name="minus" size={18} color="#fff" />
                            </Bouncy>
                            <Text style={styles.counterValue}>{quantity}</Text>
                            <Bouncy onPress={() => handleAdd(item.id)}>
                              <Ionicons name="add" size={20} color="#fff" />
                            </Bouncy>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyMenuText}>
                No menu available for this store.
              </Text>
            )}
          </View>
        </KeyboardAwareScrollView>

        <View style={styles.checkoutBar}>
          <View>
            <Text style={styles.checkoutLabel}>Subtotal</Text>
            <Text style={styles.checkoutValue}>
              {totalPrice.toFixed(2)} THB
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.checkoutButton,
              totalItems === 0 && styles.checkoutButtonDisabled,
            ]}
            onPress={() => setOpen(true)}
            disabled={totalItems === 0}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.checkoutButtonText,
                totalItems === 0 && styles.checkoutButtonTextDisabled,
              ]}
            >
              {totalItems === 0 ? "Add items" : "Review order"}
            </Text>
            <View
              style={[
                styles.checkoutBadge,
                totalItems === 0 && styles.checkoutBadgeDisabled,
              ]}
            >
              <Text
                style={[
                  styles.checkoutBadgeText,
                  totalItems === 0 && styles.checkoutBadgeTextDisabled,
                ]}
              >
                {totalItems}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <CheckoutSheet
          visible={open}
          onClose={() => setOpen(false)}
          cart={cart}
          shop={shop}
          handleOrder={handleOrderSuccess}
        />
      </View>
    </SafeAreaView>
  );
}

const Bouncy = ({ children, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => {
        Animated.spring(scale, {
          toValue: 0.92,
          useNativeDriver: true,
          friction: 6,
          tension: 120,
        }).start();
      }}
      onPressOut={() => {
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 6,
          tension: 120,
        }).start();
      }}
      activeOpacity={1}
    >
      <Animated.View style={[styles.addButton, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

const SkeletonItem = () => {
  const pulse = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.5,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={styles.menuCardWrapper}>
      <View style={[styles.menuCard, styles.menuCardSkeleton]}>
        <View style={styles.menuAccentBar} />
        <Animated.View style={[styles.skeletonImage, { opacity: pulse }]} />
        <View style={styles.menuSkeletonBody}>
          <Animated.View
            style={[styles.skeletonLine, { width: "70%", opacity: pulse }]}
          />
          <Animated.View
            style={[styles.skeletonLine, { width: "55%", opacity: pulse }]}
          />
          <Animated.View style={[styles.skeletonPill, { opacity: pulse }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F2F4F7",
  },
  screen: {
    flex: 1,
    position: "relative",
  },
  backgroundAccent: {
    position: "absolute",
    top: -140,
    right: -90,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(250,74,12,0.18)",
    opacity: 0.6,
    transform: [{ rotate: "25deg" }],
  },
  backgroundAccentSecondary: {
    position: "absolute",
    top: -60,
    left: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(37,99,235,0.12)",
    opacity: 0.5,
    transform: [{ rotate: "-18deg" }],
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(17,24,39,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconButtonCart: {
    backgroundColor: "rgba(250,74,12,0.12)",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 160,
    gap: 24,
  },
  heroSection: {
    alignItems: "center",
    
  },
  bannerWrapper: {
    justifyContent:'center',
    alignItems:'center',
    margimVertical:12
  },

  sectionHeader: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  sectionSubtitleText: {
    fontSize: 13,
    color: "#6B7280",
  },
  menuList: {
    gap: 18,
  },
  menuCardWrapper: {
    borderRadius: 22,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 6,
  },
  menuCard: {
    flexDirection: "row",
    gap: 16,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 22,
    padding: 16,
    alignItems: "stretch",
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.04)",
  },
  menuAccentBar: {
    width: 4,
    borderRadius: 4,
    backgroundColor: "#FA4A0C",
    marginRight: 8,
    opacity: 0.85,
  },
  menuImageWrapper: {
    width: 92,
    height: 92,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  menuImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  menuDetails: {
    flex: 1,
    justifyContent: "space-between",
    alignItems:'center',
    gap: 10,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  menuName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  menuPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FA4A0C",
  },
  menuDescription: {
    fontSize: 12,
    color: "#6B7280",
  },
  menuFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  counterGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  counterValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    minWidth: 24,
    textAlign: "center",
  },
  addButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FA4A0C",
    width: 32,
    height: 32,
    borderRadius: 16,
    shadowColor: "#FA4A0C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyMenuText: {
    textAlign: "center",
    color: "#6B7280",
    fontWeight: "500",
  },
  checkoutBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 12,
  },
  checkoutLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  checkoutValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  checkoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#FA4A0C",
  },
  checkoutButtonDisabled: {
    backgroundColor: "#E5E7EB",
  },
  checkoutButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  checkoutButtonTextDisabled: {
    color: "#6B7280",
  },
  checkoutBadge: {
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutBadgeDisabled: {
    backgroundColor: "#fff",
  },
  checkoutBadgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  checkoutBadgeTextDisabled: {
    color: "#6B7280",
  },
  badgeContainer: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FA4A0C",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 11,
  },
  skeletonImage: {
    width: 92,
    height: 92,
    borderRadius: 18,
    backgroundColor: "#E5E7EB",
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E0E0E0",
  },
  skeletonPill: {
    width: 80,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#E5E7EB",
  },
  menuCardSkeleton: {
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  menuSkeletonBody: {
    flex: 1,
    justifyContent: "space-between",
    gap: 12,
    marginLeft: 8,
  },
});
