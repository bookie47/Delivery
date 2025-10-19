import { View, Text, TextInput, Image, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";

export default function ResetPassword() {
  const logo = require("../../../assets/Logo/forgot.png");
  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center" }}
    >
      <Image source={logo} style={{ width: 100, height: 100 }}></Image>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginTop: 20 }}>
        Forgot your password?
      </Text>
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 14, fontWeight: "bold" }}>Email</Text>
        <View style={{ flexDirection: "row" }}>
          <TextInput
            style={{
              borderWidth: 1,
              borderRadius: 20,
              width: 300,
              marginTop: 5,
              paddingLeft: 15,
            }}
            placeholder="Enter your Email"
          ></TextInput>
        </View>
        <TouchableOpacity
          style={{
            marginTop: 25,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#FA4A0C",
            height: 40,
            borderRadius: 25,
          }}
        >
          <Text style={{ color: "white", fontSize: 18 }}>Send Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 5,
          }}
          onPress={() =>{ router.push("/features/auth/signIn")}}
        >
          <Ionicons name="chevron-back-outline" size={24} color="black" />
          <Text>Back to Signin</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}
