import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef, useCallback } from "react";
import { auth, db } from "../../../firebase/connect";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import KeyboardAwareScreen from "../../../components/KeyboardAwareScreen";
import FocusFade from "../../../components/FocusFade";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";

export default function Profile() {
  const avatar = require("../../../assets/profile/default.jpg");
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [wallet, setWallet] = useState(0);
  const [stats, setStats] = useState({
    completed: 0,
    pending: 0,
    cancelled: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [profileSnapshot, setProfileSnapshot] = useState(null);
  const pulse = useRef(new Animated.Value(0.5)).current;

  const SkeletonLine = ({ width, height, style }) => (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: 8,
          backgroundColor: "#E5E7EB",
          opacity: pulse,
        },
        style,
      ]}
    />
  );

  const fetchProfileData = useCallback(async (currentUser, { silent } = {}) => {
    if (!currentUser?.uid) return;
    if (!silent) setLoading(true);
    setError("");
    try {
      const uid = currentUser.uid;
      const userDocRef = doc(db, "users", uid);
      const ordersQuery = query(
        collection(db, "orders"),
        where("userId", "==", uid)
      );
      const [userSnap, ordersSnap] = await Promise.all([
        getDoc(userDocRef),
        getDocs(ordersQuery),
      ]);

      let profileData = {
        name: "",
        email: currentUser.email || "",
        phone: "",
        address: "",
        wallet: 0,
      };

      if (userSnap.exists()) {
        const data = userSnap.data();
        profileData = {
          name: data.name || "",
          email: data.email || currentUser.email || "",
          phone: data.phone || "",
          address: data.address || "",
          wallet: Number(data.wallet || 0),
        };
      } else {
        profileData.name = currentUser.displayName || "";
      }

      setName(profileData.name);
      setEmail(profileData.email);
      setPhone(profileData.phone);
      setAddress(profileData.address);
      setWallet(profileData.wallet);
      setProfileSnapshot({
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
      });

      let completed = 0;
      let pending = 0;
      let cancelled = 0;
      let totalSpent = 0;

      ordersSnap.forEach((orderDoc) => {
        const data = orderDoc.data();
        const status = (data.status || "").toLowerCase();
        if (status === "completed") {
          completed += 1;
        } else if (status === "cancelled" || status === "canceled") {
          cancelled += 1;
        } else {
          pending += 1;
        }
        if (data.total) {
          totalSpent += Number(data.total) || 0;
        }
      });

      setStats({ completed, pending, cancelled, totalSpent });
    } catch (err) {
      console.error("Failed to load profile data", err);
      setError("Unable to load profile information right now.");
      setStats({ completed: 0, pending: 0, cancelled: 0, totalSpent: 0 });
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchProfileData(currentUser);
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [fetchProfileData]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.5,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    if (loading) loop.start();
    return () => loop.stop();
  }, [loading, pulse]);

  const hasProfileChanges = profileSnapshot
    ? name.trim() !== profileSnapshot.name ||
      (phone || "").trim() !== (profileSnapshot.phone || "") ||
      (address || "").trim() !== (profileSnapshot.address || "")
    : false;

  const formatBaht = (value) => `${Number(value || 0).toFixed(2)} THB`;

  const handleRefresh = () => {
    if (!user) return;
    setRefreshing(true);
    fetchProfileData(user, { silent: true });
  };

  const handleChangePhoto = () => {
    Alert.alert(
      "Change Photo",
      "Profile photo uploads will be available soon."
    );
  };

  const handleUpdateProfile = async () => {
    if (!user || saving || !hasProfileChanges) return;
    const trimmedName = name.trim();
    const trimmedPhone = (phone || "").trim();
    const trimmedAddress = (address || "").trim();

    if (!trimmedName) {
      Alert.alert("Incomplete", "Please provide your name.");
      return;
    }

    if (trimmedPhone && !/^[0-9+\s-]{8,15}$/.test(trimmedPhone)) {
      Alert.alert("Invalid phone number", "Please enter a valid phone number.");
      return;
    }

    try {
      setSaving(true);
      await setDoc(
        doc(db, "users", user.uid),
        {
          name: trimmedName,
          phone: trimmedPhone,
          address: trimmedAddress,
          email,
        },
        { merge: true }
      );
      setProfileSnapshot({
        name: trimmedName,
        phone: trimmedPhone,
        address: trimmedAddress,
      });
      Alert.alert("Success", "Profile updated successfully.");
    } catch (e) {
      console.error("Failed to update profile", e);
      Alert.alert("Error", "Failed to update profile, please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSupport = () => {
    Alert.alert("Support", "Need help? Reach us at support@delifast.app");
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace("/features/auth/signIn");
    } catch (e) {
      Alert.alert("Error", "Unable to sign out right now.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F6F6" }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          disabled={!user || refreshing || loading}
          onPress={handleRefresh}
          style={[
            styles.headerAction,
            (!user || refreshing || loading) && styles.disabledTile,
          ]}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="refresh" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
      <KeyboardAwareScreen
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#FA4A0C"]}
            tintColor="#FA4A0C"
          />
        }
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <FocusFade style={{ flex: 1 }}>
          <View style={styles.container}>
            <View style={styles.profileCard}>
              <View style={styles.avatarWrapper}>
                <Image source={avatar} style={styles.avatar} />
                <TouchableOpacity
                  style={styles.changePhotoButton}
                  onPress={handleChangePhoto}
                >
                  <Ionicons name="camera-outline" size={16} color="white" />
                </TouchableOpacity>
              </View>
              <View style={{ alignItems: "center" }}>
                {loading ? (
                  <SkeletonLine width={160} height={20} />
                ) : (
                  <Text style={styles.profileName}>
                    {name || "Guest"}
                  </Text>
                )}
                {loading ? (
                  <SkeletonLine
                    width={200}
                    height={16}
                    style={{ marginTop: 8 }}
                  />
                ) : (
                  <Text style={styles.profileEmail}>{email}</Text>
                )}
              </View>
              <View style={styles.walletCard}>
                {loading ? (
                  <SkeletonLine width="100%" height={58} />
                ) : (
                  <>
                    <View style={styles.walletHeader}>
                      <Text style={styles.walletLabel}>Wallet Balance</Text>
                      <TouchableOpacity
                        style={styles.walletAction}
                        onPress={() =>
                          router.push("/features/Customer/(tabs)/wallet")
                        }
                      >
                        <Text style={styles.walletActionText}>View</Text>
                        <Ionicons
                          name="arrow-forward-circle"
                          size={18}
                          color="white"
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.walletValue}>{formatBaht(wallet)}</Text>
                  </>
                )}
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            <View style={styles.statsCard}>
              <Text style={styles.sectionTitle}>Activity Overview</Text>
              {loading ? (
                <View style={{ flexDirection: "row", gap: 12 }}>
                  {[...Array(3)].map((_, index) => (
                    <View key={index} style={{ flex: 1, alignItems: "center" }}>
                      <SkeletonLine width={42} height={42} />
                      <SkeletonLine
                        width={60}
                        height={16}
                        style={{ marginTop: 12 }}
                      />
                      <SkeletonLine
                        width={70}
                        height={12}
                        style={{ marginTop: 6 }}
                      />
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <View
                      style={[styles.statIcon, { backgroundColor: "#DCFCE7" }]}
                    >
                      <Ionicons
                        name="checkmark-done-outline"
                        size={18}
                        color="#15803D"
                      />
                    </View>
                    <Text style={styles.statValue}>{stats.completed}</Text>
                    <Text style={styles.statLabel}>Completed</Text>
                  </View>
                  <View style={styles.statItem}>
                    <View
                      style={[styles.statIcon, { backgroundColor: "#FEF3C7" }]}
                    >
                      <Ionicons name="time-outline" size={18} color="#B45309" />
                    </View>
                    <Text style={styles.statValue}>{stats.pending}</Text>
                    <Text style={styles.statLabel}>In Progress</Text>
                  </View>
                  <View style={styles.statItem}>
                    <View
                      style={[styles.statIcon, { backgroundColor: "#FEE2E2" }]}
                    >
                      <Ionicons
                        name="close-circle-outline"
                        size={18}
                        color="#DC2626"
                      />
                    </View>
                    <Text style={styles.statValue}>{stats.cancelled}</Text>
                    <Text style={styles.statLabel}>Cancelled</Text>
                  </View>
                </View>
              )}
              {!loading && (
                <View style={styles.spentRow}>
                  <Ionicons name="cash-outline" size={18} color="#047857" />
                  <Text style={{ color: "#065F46", fontWeight: "600" }}>
                    Lifetime spend: {formatBaht(stats.totalSpent)}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.inputRow}>
                <Ionicons name="person-outline" size={18} color="#6B7280" />
                <TextInput
                  placeholder="Name"
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                />
              </View>
              <View style={styles.inputRow}>
                <Ionicons name="mail-outline" size={18} color="#6B7280" />
                <TextInput
                  placeholder="Email"
                  style={styles.input}
                  value={email}
                  editable={false}
                />
              </View>
              <View style={styles.inputRow}>
                <Ionicons name="call-outline" size={18} color="#6B7280" />
                <TextInput
                  placeholder="Phone number"
                  keyboardType="phone-pad"
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
              <View style={[styles.inputRow, { alignItems: "flex-start" }]}>
                <Ionicons
                  name="location-outline"
                  size={18}
                  color="#6B7280"
                  style={{ marginTop: 6 }}
                />
                <TextInput
                  placeholder="Address"
                  style={[
                    styles.input,
                    { minHeight: 90, textAlignVertical: "top" },
                  ]}
                  value={address}
                  onChangeText={setAddress}
                  multiline
                />
              </View>
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    (!hasProfileChanges || saving || !user) &&
                      styles.disabledTile,
                  ]}
                  onPress={handleUpdateProfile}
                  disabled={!hasProfileChanges || saving || !user}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="save-outline" size={18} color="white" />
                  )}
                  <Text style={styles.saveButtonText}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingsCard}>
              <Text
                style={[
                  styles.sectionTitle,
                  { marginHorizontal: 16, marginBottom: 4 },
                ]}
              >
                Account
              </Text>
              <TouchableOpacity
                style={styles.settingsRow}
                onPress={() => router.push("/features/auth/resetPassword")}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#2563EB"
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingsLabel}>Reset Password</Text>
                  <Text style={styles.settingsSub}>
                    We will send a reset link to your email.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.settingsRow}
                onPress={handleSupport}
              >
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color="#FB923C"
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingsLabel}>Need Help?</Text>
                  <Text style={styles.settingsSub}>
                    Chat with support or browse FAQs.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.settingsRow, { borderBottomWidth: 0 }]}
                onPress={handleSignOut}
              >
                <Ionicons name="exit-outline" size={20} color="#DC2626" />
                <Text style={[styles.settingsLabel, { color: "#DC2626" }]}>
                  Sign Out
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#DC2626" />
              </TouchableOpacity>

            </View>
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
                  <Ionicons
                    name="chevron-back-outline"
                    size={28}
                    color="white"
                  />
                </View>
              </TouchableOpacity>
          </View>
        </FocusFade>
      </KeyboardAwareScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#FA4A0C",
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerAction: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  changePhotoButton: {
    position: "absolute",
    right: -4,
    bottom: -4,
    backgroundColor: "#FA4A0C",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  profileEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
  },
  walletCard: {
    marginTop: 18,
    width: "100%",
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 18,
  },
  walletHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  walletLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  walletAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  walletActionText: {
    color: "white",
    fontWeight: "600",
  },
  walletValue: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  quickAction: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  quickLabel: {
    marginTop: 12,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
  statsCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: "700",
    color: "#374151",
    marginBottom: 12,
    fontSize: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  statLabel: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 2,
  },
  spentRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: "#F9FAFB",
  },
  input: {
    flex: 1,
    color: "#111827",
    fontSize: 15,
  },
  actionsRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#FA4A0C",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "700",
  },
  settingsCard: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  settingsLabel: {
    color: "#111827",
    fontWeight: "600",
    flex: 1,
  },
  settingsSub: {
    color: "#6B7280",
    fontSize: 12,
  },
  errorText: {
    color: "#DC2626",
    marginTop: 16,
    fontSize: 13,
    textAlign: "center",
  },
  disabledTile: {
    opacity: 0.5,
  },
});
