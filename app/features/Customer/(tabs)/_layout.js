// app/features/Customer/(tabs)/_layout.js
import { Tabs } from "expo-router";
import TabBarAnimatedIcon from "../../../../components/TabBarAnimatedIcon";

export default function CustomerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FA4A0C",
        tabBarInactiveTintColor: "#ccc",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#ddd",
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabBarAnimatedIcon
              name="home"
              size={22}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          tabBarLabel: "Wallet",
          tabBarIcon: ({ color, focused }) => (
            <TabBarAnimatedIcon
              name="wallet"
              size={22}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orderHistory"
        options={{
          tabBarLabel: "Order",
          tabBarIcon: ({ color, focused }) => (
            <TabBarAnimatedIcon
              name="list"
              size={22}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          tabBarLabel: "Menu",
          tabBarIcon: ({ color, focused }) => (
            <TabBarAnimatedIcon
              name="menu"
              size={22}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}
