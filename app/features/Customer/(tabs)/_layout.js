// app/features/Customer/_layout.js
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function CustomerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FA4A0C", // สี icon + label ตอน active
        tabBarInactiveTintColor: "#ccc", // สีตอนยังไม่ active
        tabBarStyle: {
          backgroundColor: "#ffffff", // พื้นหลัง tab bar
          borderTopColor: "#ddd", // เส้นขอบบน
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orderHistory"
        options={{
          tabBarLabel: "Order",
          tabBarIcon: ({ color }) => (
            <Ionicons name="list" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          tabBarLabel: "Menu",
          tabBarIcon: ({ color }) => (
            <Ionicons name="menu" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
