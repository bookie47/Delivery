import { router } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebase/connect";
import KeyboardAwareScreen from "../../../components/KeyboardAwareScreen";
import FocusFade from "../../../components/FocusFade";

export default function SignIn() {
  const logo = require("../../../assets/Logo/fast-shipping.png");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    try {
      setError("");
      setLoading(true);
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const signedInUser = credential.user;
      console.log("Signed in with:", signedInUser.email);
      router.replace("/features/Customer/Home");
    } catch (err) {
      const message = err?.message || "Unable to sign in right now.";
      setError(message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F6F6" }}>
      <View style={styles.hero}>
        <View style={styles.heroContent}>
          <View style={styles.heroLogo}>
            <Image
              source={logo}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.heroTitle}>Welcome back</Text>
          <Text style={styles.heroSubtitle}>
            Sign in to continue ordering your favorites.
          </Text>
        </View>
      </View>
      <KeyboardAwareScreen contentContainerStyle={{ flexGrow: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <FocusFade style={{ flex: 1 }}>
            <View style={styles.container}>
              <View style={styles.formCard}>
                <Text style={styles.sectionTitle}>Account Details</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="mail-outline" size={18} color="#6B7280" />
                  <TextInput
                    style={styles.input}
                    placeholder="Email address"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
                <View style={styles.inputRow}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color="#6B7280"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((prev) => !prev)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <TouchableOpacity
                  style={styles.forgotButton}
                  onPress={() => router.push("/features/auth/resetPassword")}
                >
                  <Text style={styles.forgotText}>Forgot your password?</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    loading && styles.primaryButtonDisabled,
                  ]}
                  onPress={handleSignIn}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="log-in-outline" size={18} color="white" />
                      <Text style={styles.primaryButtonText}>Sign In</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
              <View style={styles.secondaryCard}>
                <Text style={styles.secondaryText}>Don't have an account?</Text>
                <TouchableOpacity
                  onPress={() => router.push("/features/auth/signUp")}
                  style={styles.secondaryAction}
                >
                  <Ionicons
                    name="person-add-outline"
                    size={18}
                    color="#FA4A0C"
                  />
                  <Text style={styles.secondaryLink}>Create one now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </FocusFade>
        </TouchableWithoutFeedback>
      </KeyboardAwareScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: "#FA4A0C",
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 24,
    alignItems: "center",
  },
  heroContent: {
    alignItems: "center",
  },
  heroLogo: {
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 150,
    backgroundColor: "white",
    borderRadius: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, 
  },
  heroImage: {
    width: 110, 
    height: 110,
  },
  heroTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 12,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
    textAlign: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: "#F9FAFB",
  },
  input: {
    flex: 1,
    color: "#111827",
    fontSize: 15,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
    marginBottom: 8,
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginBottom: 16,
  },
  forgotText: {
    color: "#2563EB",
    fontWeight: "600",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: "#FA4A0C",
  },
  primaryButtonDisabled: {
    opacity: 0.75,
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryCard: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryText: {
    color: "#6B7280",
    fontWeight: "600",
  },
  secondaryAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  secondaryLink: {
    color: "#FA4A0C",
    fontWeight: "700",
  },
});
