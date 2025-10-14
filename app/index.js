// app/index.js
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import  SignIn  from "./features/auth/signIn";
import ResetPassword from "./features/auth/resetPassword";

export default function Home() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ResetPassword />
    </SafeAreaView>
  );
}
