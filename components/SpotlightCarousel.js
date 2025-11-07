import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import AnimatedStoreCard from './AnimatedStoreCard';

const SpotlightCarousel = ({ stores, onSpotlightChange }) => {
  const [spotlightIndex, setSpotlightIndex] = useState(0);

  useEffect(() => {
    if (stores.length <= 1) {
        // If there's only one store, make sure parent knows about it.
        if (stores.length === 1) {
            onSpotlightChange(stores[0]);
        }
        return;
    }

    const interval = setInterval(() => {
      setSpotlightIndex(prev => {
        let next = Math.floor(Math.random() * stores.length);
        if (next === prev) {
          next = (next + 1) % stores.length;
        }
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [stores, onSpotlightChange]);

  const spotlightStore = useMemo(() => {
    if (!stores || stores.length === 0) return null;
    const safeIndex = Math.min(spotlightIndex, stores.length - 1);
    return stores[safeIndex];
  }, [stores, spotlightIndex]);

  useEffect(() => {
    onSpotlightChange(spotlightStore);
  }, [spotlightStore, onSpotlightChange]);

  const handleSelect = (item) => {
    if (item?.id) {
      router.push(`/features/Customer/InfoMarket?id=${item.id}`);
    }
  };

  if (!spotlightStore) {
    return null;
  }

  return (
    <View style={styles.spotlightSection}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleWrap}>
          <Ionicons name="flame-outline" size={18} color="#FA4A0C" />
          <Text style={styles.sectionTitle}>Recommended today</Text>
        </View>
        <TouchableOpacity onPress={() => handleSelect(spotlightStore)}>
          <Text style={styles.sectionAction}>See details</Text>
        </TouchableOpacity>
      </View>
      <AnimatedStoreCard
        item={spotlightStore}
        index={0}
        onPress={() => handleSelect(spotlightStore)}
        variant="banner"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  spotlightSection: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  sectionAction: {
    fontSize: 13,
    color: '#FA4A0C',
    fontWeight: '600',
  },
});

export default SpotlightCarousel;