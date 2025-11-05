import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import PasswordResetIllustration from '../../../components/PasswordResetIllustration';
import { useState, useRef } from "react";

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const floatingLabelAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    Animated.timing(floatingLabelAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    if (email === '') {
      Animated.timing(floatingLabelAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
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
        <TouchableOpacity>
          <LinearGradient
            colors={['#f85e26ff', '#FA4A0C']}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Send Reset Link</Text>
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
});
