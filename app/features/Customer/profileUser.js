import { StyleSheet, Text, TextInput, TouchableOpacity, View, Image, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { auth, db } from '../../../firebase/connect';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import KeyboardAwareScreen from '../../../components/KeyboardAwareScreen';
import FocusFade from '../../../components/FocusFade';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Profile(){
  const avatar = require("../../../assets/profile/default.jpg");
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [surename, setSurename] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const pulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setFirstName(userData.name || '');
          setSurename(userData.surename || '');
          setEmail(userData.email || '');
          setPhone(userData.phone || '');
          setAddress(userData.address || '');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ])
    );
    if (loading) loop.start();
    return () => loop.stop();
  }, [loading]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: firstName,
        surename: surename,
        phone: phone,
        address: address,
      });
      Alert.alert('Success', 'Profile updated successfully');
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F6F6F6' }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <KeyboardAwareScreen>
        <FocusFade style={{ flex: 1 }}>
          <View style={styles.container}>
            <View style={styles.profileCard}>
              <Image source={avatar} style={styles.avatar} />
              <View style={{ alignItems: 'center' }}>
                {loading ? (
                  <Animated.View style={[styles.skelLine, { width: 140, height: 18, opacity: pulse }]} />
                ) : (
                  <Text style={styles.profileName}>{firstName} {surename}</Text>
                )}
                {loading ? (
                  <Animated.View style={[styles.skelLine, { width: 180, height: 14, marginTop: 6, opacity: pulse }]} />
                ) : (
                  <Text style={styles.profileEmail}>{email}</Text>
                )}
              </View>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.inputRow}>
                <Ionicons name="person-outline" size={18} color="#6B7280" />
                <TextInput placeholder="First name" style={styles.input} value={firstName} onChangeText={setFirstName} />
              </View>
              <View style={styles.inputRow}>
                <Ionicons name="person" size={18} color="#6B7280" />
                <TextInput placeholder="Surname" style={styles.input} value={surename} onChangeText={setSurename} />
              </View>
              <View style={styles.inputRow}>
                <Ionicons name="mail-outline" size={18} color="#6B7280" />
                <TextInput placeholder="Email" style={styles.input} value={email} editable={false} />
              </View>
              <View style={styles.inputRow}>
                <Ionicons name="call-outline" size={18} color="#6B7280" />
                <TextInput placeholder="Phone number" keyboardType="phone-pad" style={styles.input} value={phone} onChangeText={setPhone} />
              </View>
              <View style={[styles.inputRow, { alignItems: 'flex-start' }]}>
                <Ionicons name="location-outline" size={18} color="#6B7280" style={{ marginTop: 12 }} />
                <TextInput placeholder="Address" style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]} value={address} onChangeText={setAddress} multiline />
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity style={[styles.button, { backgroundColor: '#111827' }]} onPress={() => {}} disabled>
                  <Ionicons name="image-outline" size={18} color="white" />
                  <Text style={styles.buttonText}>Change Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, { backgroundColor: '#FA4A0C' }]} onPress={handleUpdateProfile}>
                  <Ionicons name="save-outline" size={18} color="white" />
                  <Text style={styles.buttonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </FocusFade>
      </KeyboardAwareScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FA4A0C',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    color: '#111827',
  },
  actionsRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
  },
  skelLine: {
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
  },
});

