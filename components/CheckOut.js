// CheckoutSheet.jsx
import React, { useEffect, useRef, useMemo, useState } from "react";
import { Modal, View, Text, Pressable, Animated, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../firebase/connect";
import { doc, getDoc } from "firebase/firestore";

export default function CheckoutSheet({ visible, onClose, cart, shop, handleOrder }) {
  const SHEET_HEIGHT = 400; // Increased height to accommodate cart items
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (visible) {
      const fetchBalance = async () => {
        const user = auth.currentUser;
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              setBalance(userDoc.data().wallet || 0);
            }
          } catch (error) {
            console.error("Failed to fetch balance:", error);
          }
        }
      };
      fetchBalance();
      
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SHEET_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const cartItems = useMemo(() => {
    if (!cart || !shop || !shop.menu) {
      return [];
    }
    return Object.keys(cart).map(menuId => {
      const menuItem = shop.menu.find(item => item.id === menuId);
      const quantity = cart[menuId];
      if (menuItem) {
        return { ...menuItem, quantity };
      }
      return null;
    }).filter(item => item !== null);
  }, [cart, shop]);

  const orderTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);


  const colors = {
    primary: "#FA4A0C",
    bg: "#F2F2F2",
    text: "#222",
    subText: "#666",
    border: "#E5E5E5",
    backdrop: "rgba(0,0,0,0.5)",
    chip: "#D9D9D9",
    white: "#fff",
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={onClose}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: colors.backdrop,
          opacity: backdrop,
          justifyContent: "flex-end",
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />

        <Animated.View
          style={{
            height: SHEET_HEIGHT,
            transform: [{ translateY }],
            backgroundColor: colors.bg,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 18,
            paddingTop: 14,
            paddingBottom: 24,
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 10 }}>
            <View
              style={{
                width: 44,
                height: 4,
                backgroundColor: colors.border,
                borderRadius: 2,
              }}
            />
          </View>

          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: colors.text,
              marginBottom: 14,
            }}
          >
            Your Order
          </Text>

          <ScrollView style={{ flex: 1, marginBottom: 10 }}>
            {cartItems.length > 0 ? cartItems.map(item => (
              <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text style={{ color: colors.text, flex: 1 }} numberOfLines={1}>{item.name}</Text>
                <Text style={{ color: colors.subText }}>x{item.quantity}</Text>
                <Text style={{ color: colors.text, fontWeight: 'bold', width: 80, textAlign: 'right' }}>฿{(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            )) : (
              <Text style={{textAlign: 'center', color: colors.subText, paddingVertical: 20}}>Your cart is empty.</Text>
            )}
          </ScrollView>


          <View style={{ gap: 8, marginBottom: 18 }}>
            <Text style={{ color: colors.subText, fontSize: 14 }}>Method</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: colors.white,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Ionicons name="wallet-outline" size={20} color={colors.text} />
                <Text style={{ color: colors.text, fontWeight: "500" }}>
                  Wallet
                </Text>
              </View>

              <Text style={{ fontSize: 14, color: colors.text, fontWeight: '600' }}>
                ฿{balance.toFixed(2)}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 14 }}>
              Order Total
            </Text>
            <Text
              style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}
            >
              ฿{orderTotal.toFixed(2)}
            </Text>
          </View>

          <Pressable
            onPress={handleOrder}
            style={({ pressed }) => ({
              backgroundColor: orderTotal > 0 ? colors.primary : colors.chip,
              opacity: pressed ? 0.9 : 1,
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: "center",
            })}
            disabled={orderTotal === 0}
          >
            <Text
              style={{ color: orderTotal > 0 ? colors.white : colors.subText, fontWeight: "700", fontSize: 16 }}
            >
              สั่งซื้อ
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
