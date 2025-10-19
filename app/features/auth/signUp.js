import { router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../../firebase/connect";
import { doc, setDoc } from "firebase/firestore";

export default function SignUp() {
  const uri = require("../../../assets/Logo/deli.png");
  const [name, setName] = useState("");
  const [surename, setSurename] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignUp = async () => {
    if (!name || !surename || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("Created account for:", user.email);

      // Save user data to Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        name: name,
        surename: surename,
        email: user.email,
        wallet: 0,
      });

      console.log("User data saved to Firestore");
      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => router.push("/features/auth/signIn") },
      ]);
    } catch (error) {
      const errorMessage = error.message;
      Alert.alert("Sign Up Failed", errorMessage);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
        <View
          style={{
            flex: 2,
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 20,
          }}
        >
          <Image source={uri} style={{ width: 200, height: 200 }} />
        </View>
        <View style={{ flex: 4, alignItems: "center" }}>
          <View style={{ width: "80%" }}>
            <Text style={{ fontSize: 24 }}>Name</Text>
            <TextInput
              style={{
                height: 40,
                borderColor: "gray",
                borderWidth: 1,
                marginBottom: 20,
                borderRadius: 15,
                paddingLeft: 10,
              }}
              onChangeText={setName}
              value={name}
            />
            <Text style={{ fontSize: 24 }}>Surename</Text>
            <TextInput
              style={{
                height: 40,
                borderColor: "gray",
                borderWidth: 1,
                marginBottom: 20,
                borderRadius: 15,
                paddingLeft: 10,
              }}
              onChangeText={setSurename}
              value={surename}
            />
            <Text style={{ fontSize: 24 }}>Email</Text>
            <TextInput
              style={{
                height: 40,
                borderColor: "gray",
                borderWidth: 1,
                marginBottom: 20,
                borderRadius: 15,
                paddingLeft: 10,
              }}
              onChangeText={setEmail}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={{ fontSize: 24 }}>Password</Text>
            <TextInput
              style={{
                height: 40,
                borderColor: "gray",
                borderWidth: 1,
                marginBottom: 20,
                borderRadius: 15,
                paddingLeft: 10,
              }}
              onChangeText={setPassword}
              value={password}
              secureTextEntry
            />
            <Text style={{ fontSize: 24 }}>Confirm Password</Text>
            <TextInput
              style={{
                height: 40,
                borderColor: "gray",
                borderWidth: 1,
                marginBottom: 20,
                borderRadius: 15,
                paddingLeft: 10,
              }}
              onChangeText={setConfirmPassword}
              value={confirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: 150,
              height: 50,
              borderRadius: 20,
            backgroundColor: "#FA4A0C",
              marginTop: 10,
            }}
            onPress={handleSignUp}
          >
            <Text style={{ fontSize: 32, fontWeight: "800", color: "white" }}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
  );
}