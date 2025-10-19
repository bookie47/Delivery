import { router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebase/connect";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignIn() {
  const uri = require("../../../assets/Logo/deli.png");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log("Signed in with:", user.email);
        router.replace("/features/Customer/Home");
      })
      .catch((error) => {
        const errorMessage = error.message;
        Alert.alert("Sign In Failed", errorMessage);
      });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
            <View
              style={{ flex: 2, alignItems: "center", justifyContent: "center",}}
            >
              <Image source={uri} style={{ width: 400, height: 400 }} />
            </View>
            <View style={{ flex: 2, alignItems: "center" }}>
              <View style={{ width: "80%" }}>
                <Text style={{ fontSize: 24 }}>Email</Text>
                <TextInput
                  style={{
                    height: 50,
                    borderColor: "gray",
                    borderWidth: 1,
                    marginBottom: 10,
                    borderRadius: 15,
                    paddingLeft: 10,
                  }}
                  placeholder="Enter your email"
                  onChangeText={setEmail}
                  value={email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Text style={{ fontSize: 24 }}>Password</Text>
                <TextInput
                  style={{
                    height: 50,
                    borderColor: "gray",
                    borderWidth: 1,
                    borderRadius: 15,
                    paddingLeft: 10,
                  }}
                  placeholder="Enter your password"
                  onChangeText={setPassword}
                  value={password}
                  secureTextEntry
                />
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    marginBottom: 30,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      router.push("/features/auth/resetPassword");
                    }}
                  >
                    <Text>Forgot your password?</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  width: 150,
                  height: 50,
                  borderRadius: 20,
                  backgroundColor: "#FA4A0C",
                }}
                onPress={handleSignIn}
              >
                <Text style={{ fontSize: 32, fontWeight: "800", color: "white" }}>
                  Sign In
                </Text>
              </TouchableOpacity>

              <View style={{ alignItems: "center", marginTop: 20 }}>
                <Text style={{ fontWeight: "bold" }}>Don't have an account?</Text>
                <TouchableOpacity
                  onPress={() => {
                    router.push("/features/auth/signUp");
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      textDecorationLine: "underline",
                    }}
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
