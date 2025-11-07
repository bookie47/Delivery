import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import PasswordResetIllustration from "../../../components/PasswordResetIllustration";
import { useState, useRef, useMemo } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../firebase/connect";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: null, message: "" });
  const [submitting, setSubmitting] = useState(false);
  const floatingLabelAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    Animated.timing(floatingLabelAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    if (email === "") {
      Animated.timing(floatingLabelAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const isValidEmail = useMemo(() => {
    const trimmed = email.trim();
    if (!trimmed) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  }, [email]);

  const handleResetPassword = async () => {
    if (!isValidEmail || submitting) {
      setStatus({
        type: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    setSubmitting(true);
    setStatus({ type: null, message: "" });
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setStatus({
        type: "success",
        message: "Reset link sent! Please check your email inbox.",
      });
    } catch (error) {
      let message = "Something went wrong. Please try again.";
      if (error.code === "auth/user-not-found") {
        message = "No account found with this email.";
      } else if (error.code === "auth/invalid-email") {
        message = "The email format looks incorrect.";
      } else if (error.code === "auth/network-request-failed") {
        message = "Network error. Check your connection and try again.";
      }
      setStatus({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  };

  const labelStyle = {
    top: floatingLabelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 0],
    }),
    fontSize: floatingLabelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: floatingLabelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['#A9A9A9', '#FA4A0C'],
    }),
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <PasswordResetIllustration />
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>
        Don't worry! It happens. Please enter the email address associated with your account.
      </Text>
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Animated.Text style={[styles.label, labelStyle]}>Email Address</Animated.Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            onFocus={handleFocus}
            onBlur={handleBlur}
            keyboardType="email-address"
            autoCapitalize="none"
            />
        </View>
        {status.message ? (
          <View
            style={[
              styles.statusBanner,
              status.type === "success"
                ? styles.statusBannerSuccess
                : styles.statusBannerError,
            ]}
          >
            <Ionicons
              name={status.type === "success" ? "checkmark-circle" : "alert-circle"}
              size={18}
              color={status.type === "success" ? "#065F46" : "#991B1B"}
            />
            <Text
              style={[
                styles.statusText,
                status.type === "success"
                  ? styles.statusTextSuccess
                  : styles.statusTextError,
              ]}
            >
              {status.message}
            </Text>
          </View>
        ) : null}
        <TouchableOpacity
          disabled={submitting || !isValidEmail}
          onPress={handleResetPassword}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={submitting || !isValidEmail ? ["#FECACA", "#FECACA"] : ["#f85e26ff", "#FA4A0C"]}
            style={[styles.button, (submitting || !isValidEmail) && styles.buttonDisabled]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send Reset Link</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => { router.push("/features/auth/signIn") }}
      >
        <Text style={styles.backButtonText}>Back to Sign In</Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 30,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    height: 50,
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
    marginBottom: 30,
    justifyContent: 'flex-end',
  },
  label: {
    position: 'absolute',
    left: 0,
  },
  input: {
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  button: {
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 20,
  },
  backButtonText: {
    color: '#FA4A0C',
    fontSize: 16,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusBannerSuccess: {
    backgroundColor: '#D1FAE5',
  },
  statusBannerError: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    flex: 1,
    fontSize: 14,
  },
  statusTextSuccess: {
    color: '#065F46',
  },
  statusTextError: {
    color: '#991B1B',
  },
});
