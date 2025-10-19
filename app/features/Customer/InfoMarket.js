import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  Alert,
  Animated,
} from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from "react-native-safe-area-context";
import { BannerMarket } from "../../../components/bannerMarket";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, useEffect, useRef } from "react";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router } from "expo-router";
import CheckoutSheet from "../../../components/CheckOut";
import { useLocalSearchParams } from "expo-router";
import { db, auth } from "../../../firebase/connect";
import {
  doc,
  getDoc,
  updateDoc,
  writeBatch,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
const placeholder = require("../../../assets/profile/default.jpg");

export default function InfoMarket() {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
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
    setCart((prevCart) => ({
      ...prevCart,
      [menuId]: (prevCart[menuId] || 0) + 1,
    }));
  };

  const handleMinus = (menuId) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      if (newCart[menuId] > 1) {
        newCart[menuId] -= 1;
      } else {
        delete newCart[menuId];
      }
      return newCart;
    });
  };

  const handleOrderSuccess = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to place an order.");
      return;
    }

    const orderTotal = Object.keys(cart).reduce((total, menuId) => {
      const menuItem = shop.menu.find((item) => item.id === menuId);
      const quantity = cart[menuId];
      return total + menuItem.price * quantity;
    }, 0);

    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists() && userDoc.data().wallet >= orderTotal) {
      const batch = writeBatch(db);

      // 1. Update user's wallet
      batch.update(userDocRef, { wallet: userDoc.data().wallet - orderTotal });

      // 2. Create new order
      const orderRef = doc(collection(db, "orders"));
      const newOrder = {
        userId: user.uid,
        shopId: id,
        items: cart,
        total: orderTotal,
        createdAt: new Date(),
        status: "pending",
      };
      batch.set(orderRef, newOrder);

      try {
        await batch.commit();
        const pendingOrders = JSON.parse(await AsyncStorage.getItem("pendingOrders")) || [];
        pendingOrders.push({ orderId: orderRef.id, createdAt: newOrder.createdAt });
        await AsyncStorage.setItem("pendingOrders", JSON.stringify(pendingOrders));

        Alert.alert("Success", "Order placed successfully!");
        setCart({});
        setOrderPlaced(true);
      } catch (error) {
        Alert.alert("Error", "Failed to place order.");
        console.error("Error placing order: ", error);
      }
    } else {
      Alert.alert("Error", "Insufficient funds.");
    }
  };

  const [open, setOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const badgeScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (orderPlaced) {
      setOpen(false);
      router.push("/features/Customer/orderHistory");
    }
  }, [orderPlaced]);

  const totalItems = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F6F6" }}>
      <View style={{ flex: 1, marginTop: 10 }}>
        <View style={{ flex: 2 }}>
          <BannerMarket shop={shop} />
        </View>
        <View style={{ flex: 10, marginHorizontal: 20 }}>
          <KeyboardAwareScrollView style={{ flex: 1 }}>
            {loading ? (
              [...Array(4)].map((_, i) => <SkeletonItem key={i} />)
            ) : shop && shop.menu ? (
              shop.menu.map((item) => (
                <View key={item.id} style={styles.container}>
                  <View style={{ flex: 1, justifyContent: "center" }}>
                    {item.imageUrl ? (
                      <View style={styles.boxPofile}>
                        <Image
                          source={{ uri: item.imageUrl }}
                          style={{ width: 90, height: 90, borderRadius: 8 }}
                        />
                      </View>
                    ) : (
                      <View style={styles.boxPofile}>
                        <Image
                          source={placeholder}
                          style={{ width: 100, height: 90, borderRadius: 8 }}
                        />
                      </View>
                    )}
                  </View>
                  <View
                    style={{
                      flex: 2,
                      paddingLeft:50,
                      marginTop:10,
                      
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                      {item.name}
                    </Text>
                    <Text style={{ fontSize: 14, color: "gray" }}>
                      {item.price} THB
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      gap: 10,
                      margin: 10,
                    }}
                  >
                    <Bouncy onPress={() => handleMinus(item.id)}>
                      <AntDesign name="minus" size={19} color="white" />
                    </Bouncy>

                    <Text>{cart[item.id] || 0}</Text>

                    <Bouncy onPress={() => handleAdd(item.id)}>
                      <Ionicons name="add" size={20} color="white" />
                    </Bouncy>
                  </View>
                </View>
              ))
            ) : (
              <Text>No menu available for this store.</Text>
            )}
          </KeyboardAwareScrollView>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                router.back();
              }}
            >
              <View
                style={{
                  backgroundColor: "#FA4A0C",
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="chevron-back-outline" size={28} color="white" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setOpen(true)}>
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: "#FA4A0C",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <FontAwesome5 name="shopping-cart" size={24} color="white" />
                {totalItems > 0 && (
                  <Animated.View style={[styles.badgeContainer, { transform: [{ scale: badgeScale }] }]}>
                    <Text style={styles.badgeText}>{totalItems}</Text>
                  </Animated.View>
                )}
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
      </View>
    </SafeAreaView>
  );
}

// Small bouncing wrapper for + / - buttons
const Bouncy = ({ children, onPress }) => {
  const s = useRef(new Animated.Value(1)).current;
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => {
        Animated.spring(s, { toValue: 0.92, useNativeDriver: true, friction: 6, tension: 120 }).start();
      }}
      onPressOut={() => {
        Animated.spring(s, { toValue: 1, useNativeDriver: true, friction: 6, tension: 120 }).start();
      }}
      activeOpacity={1}
    >
      <Animated.View style={[styles.addButton, { transform: [{ scale: s }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Simple skeleton item with pulsing shimmer
const SkeletonItem = () => {
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

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Animated.View style={[styles.boxPofile, { opacity: pulse }]} />
      </View>
      <View style={{ flex: 2, paddingLeft: 50, marginTop: 10 }}>
        <Animated.View style={[styles.skeletonLine, { width: '60%', opacity: pulse }]} />
        <Animated.View style={[styles.skeletonLine, { width: '40%', marginTop: 8, opacity: pulse }]} />
      </View>
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10, margin: 10 }}>
        <Animated.View style={[styles.addButton, { opacity: pulse }]} />
        <Animated.View style={[styles.addButton, { opacity: pulse }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    height: 110,
    marginTop: 15,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  boxPofile: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    height: 90,
    width: 90,
    borderRadius: 12,
    marginLeft: 15,
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FA4A0C',
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
  },
  badgeContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
