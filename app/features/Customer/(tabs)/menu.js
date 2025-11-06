import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import FocusFade from '../../../../components/FocusFade';
import { auth, db } from '../../../../firebase/connect';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const profilePlaceholder = require('../../../../assets/profile/default.jpg');

export default function Menu() {
  const [profile, setProfile] = useState({
    name: 'Guest',
    email: 'guest@example.com',
    avatar: profilePlaceholder,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setProfile({
            name: data.name || currentUser.displayName || 'User',
            email: data.email || currentUser.email || 'No Email',
            avatar: profilePlaceholder, // Assuming avatar is always placeholder for now
          });
        } else {
          setProfile({
            name: currentUser.displayName || 'User',
            email: currentUser.email || 'No Email',
            avatar: profilePlaceholder,
          });
        }
      } else {
        setProfile({
          name: 'Guest',
          email: 'guest@example.com',
          avatar: profilePlaceholder,
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const menuItems = [
    {
      key: 'logout',
      label: 'Log out',
      icon: 'log-out-outline',
      iconColor: '#DC2626',
      iconBg: '#FEE2E2',
      destructive: true,
      onPress: () => router.replace('/features/auth/signIn'),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.hero}>
        <View>
          <Text style={styles.heroTitle}>Menu</Text>
          <Text style={styles.heroSubtitle}>Manage your profile & preferences</Text>
        </View>
        <TouchableOpacity style={styles.heroProfile} onPress={() => router.push('/features/Customer/profileUser')}>
          <Ionicons name="person-circle-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <FocusFade style={{ flex: 1 }}>
        <View style={styles.content}>
          <View style={styles.profileCard}>
            <Image source={profile.avatar} style={styles.profileImage} />
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>
            <TouchableOpacity style={styles.profileAction} onPress={() => router.push('/features/Customer/profileUser')}>
              <Ionicons name="create-outline" size={16} color="#FA4A0C" />
              <Text style={styles.profileActionText}>Edit profile</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.menuRow, index !== 0 && styles.menuRowDivider]}
                onPress={item.onPress}
              >
                <View style={[styles.menuIconWrapper, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.icon} size={18} color={item.iconColor} />
                </View>
                <Text style={[styles.menuLabel, item.destructive && styles.menuLabelDestructive]}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </FocusFade>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  hero: {
    backgroundColor: '#FA4A0C',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  heroSubtitle: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.75)',
  },
  heroProfile: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 20,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    padding: 24,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  profileAction: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFECE6',
  },
  profileActionText: {
    color: '#FA4A0C',
    fontWeight: '600',
    fontSize: 13,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  menuRowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  menuIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  menuLabelDestructive: {
    color: '#DC2626',
  },
});
