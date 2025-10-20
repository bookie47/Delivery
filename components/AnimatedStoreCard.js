import React, { useEffect } from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';

const placeholder = require('../assets/profile/default.jpg');

const AnimatedStoreCard = ({ item = {}, index = 0, onPress, variant = 'grid' }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(1);
  const isBanner = variant === 'banner';

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  useEffect(() => {
    opacity.value = withDelay(index * 120, withTiming(1, { duration: 450 }));
    translateY.value = withDelay(index * 120, withTiming(0, { duration: 450 }));
  }, [index, opacity, translateY]);

  const imageSource = item?.logo ? { uri: item.logo } : placeholder;

  return (
    <Animated.View
      style={[
        styles.baseContainer,
        isBanner ? styles.bannerContainer : styles.gridContainer,
        animatedStyle,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => {
          scale.value = withTiming(0.97, { duration: 120 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 140 });
        }}
        activeOpacity={0.92}
        style={[
          styles.touchableBase,
          isBanner ? styles.bannerTouchable : styles.gridTouchable,
        ]}
      >
        <Image
          source={imageSource}
          style={[styles.imageBase, isBanner ? styles.bannerImage : styles.gridImage]}
        />
        <View style={[styles.overlay, isBanner ? styles.bannerOverlay : styles.gridOverlay]} />

        {item?.rate ? (
          <View style={[styles.rateBadge, isBanner ? styles.bannerRateBadge : styles.gridRateBadge]}>
            <Ionicons name="star" size={12} color="#FBBF24" />
            <Text style={styles.rateText}>{Number(item.rate).toFixed(1)}</Text>
          </View>
        ) : null}

        <View style={isBanner ? styles.bannerContent : styles.gridContent}>
          <Text
            numberOfLines={isBanner ? 1 : 1}
            ellipsizeMode="tail"
            style={isBanner ? styles.bannerName : styles.gridName}
          >
            {item?.name || 'Unknown Store'}
          </Text>
          {isBanner ? (
            <>
              {item?.tag ? <Text style={styles.bannerTag}>{item.tag}</Text> : null}
              <View style={styles.bannerMeta}>
                <View style={styles.metaChip}>
                  <Ionicons name="time-outline" size={14} color="#fff" />
                  <Text style={styles.metaText}>~20 min</Text>
                </View>
                <View style={styles.metaChip}>
                  <Ionicons name="navigate-outline" size={14} color="#fff" />
                  <Text style={styles.metaText}>Nearby</Text>
                </View>
              </View>
            </>
          ) : null}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    marginHorizontal: 4,
    marginVertical: 6,
  },
  gridContainer: {
    width: 110,
    height: 100,
  },
  bannerContainer: {
    width: '100%',
    height: 190,
    marginHorizontal: 0,
  },
  touchableBase: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  gridTouchable: {
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerTouchable: {
    borderRadius: 24,
    backgroundColor: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  imageBase: {
    width: '100%',
    height: '100%',
  },
  gridImage: {
    resizeMode: 'cover',
  },
  bannerImage: {
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gridOverlay: {
    backgroundColor: 'transparent',
  },
  bannerOverlay: {
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  rateBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gridRateBadge: {
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  bannerRateBadge: {
    backgroundColor: 'rgba(17,24,39,0.75)',
  },
  rateText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  gridContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridName: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  bannerContent: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
  },
  bannerName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  bannerTag: {
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  bannerMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(17, 17, 17, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  metaText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default AnimatedStoreCard;
