import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { auth, db } from "../../../firebase/connect";
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import KeyboardAwareScreen from "../../../components/KeyboardAwareScreen";
import Ionicons from "@expo/vector-icons/Ionicons";

const TopUp = () => {
  const [user, setUser] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleTopUp = async () => {
    if (!user || !topUpAmount) return;
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Please enter a valid amount.");
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    try {
      await updateDoc(userDocRef, {
        wallet: increment(amount),
      });
      // record top-up transaction for wallet history
      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        type: "topup",
        amount: amount,
        createdAt: serverTimestamp(),
        method: "wallet",
      });
      Alert.alert("Success", `Successfully topped up ${amount} THB.`);
      setTopUpAmount("");
      router.push("/features/Customer/(tabs)/wallet");
    } catch (error) {
      Alert.alert("Error", "Failed to top up.");
      console.error("Error topping up: ", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F6F6" }}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Top Up</Text>
      </View>
      <KeyboardAwareScreen>
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Enter Amount</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="wallet-outline"
                size={24}
                color="#ccc"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Amount in THB"
                keyboardType="numeric"
                onChangeText={setTopUpAmount}
                value={topUpAmount}
              />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleTopUp}>
              <Text style={styles.buttonText}>Confirm Top Up</Text>
            </TouchableOpacity>
          </View>

          <View style={{flex:1,justifyContent:'flex-end',alignSelf:'flex-start'}}>
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
          </View>
        </View>
      </KeyboardAwareScreen>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#FA4A0C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  backButton: {
    position: "absolute",
    left: 15,
  },
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F6F6F6",
  },
  card: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 50,
    borderColor: "#eee",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
  },
  button: {
    backgroundColor: "#FA4A0C",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default TopUp;
