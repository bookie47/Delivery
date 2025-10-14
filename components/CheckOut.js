// CheckoutSheet.jsx
import React, { useEffect, useRef } from "react";
import { Modal, View, Text, Pressable, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CheckoutSheet({ visible, onClose }) {
  const SHEET_HEIGHT = 320;
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
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
            Top Up & Order
          </Text>

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

              <View
                style={{
                  backgroundColor: colors.chip,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 999,
                }}
              >
                <Text style={{ fontSize: 12, color: colors.text }}>
                  Default
                </Text>
              </View>
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
              ฿80.00
            </Text>
          </View>

          <Pressable
            onPress={() => {
              onClose();
              alert("Order Success");
            }}
            style={({ pressed }) => ({
              backgroundColor: colors.primary,
              opacity: pressed ? 0.9 : 1,
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: "center",
            })}
          >
            <Text
              style={{ color: colors.white, fontWeight: "700", fontSize: 16 }}
            >
              สั่งซื้อ
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
