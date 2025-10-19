import React, { useEffect } from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';

const placeholder = require("../assets/profile/default.jpg");

const AnimatedStoreCard = ({ item, index, onPress }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
    };
  });

  useEffect(() => {
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(index * 100, withTiming(0, { duration: 500 }));
  }, []);

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => {
          scale.value = withTiming(0.96, { duration: 120 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 120 });
        }}
        activeOpacity={1}
        style={styles.touchable}
      >
        <View style={styles.imageContainer}>
          <Image
            source={
              item && item.logo ? { uri: item.logo } : placeholder
            }
            style={styles.image}
          />
          {item?.rate ? (
            <View style={styles.rateBadge}>
              <Ionicons name="star" size={12} color="#FBBF24" />
              <Text style={styles.rateText}>{Number(item.rate).toFixed(1)}</Text>
            </View>
          ) : null}
          {item && item.name ? (
            <View style={styles.nameContainer}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.nameText}
              >
                {item.name}
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 110,
    height: 100,
    margin: 8,
  },
  touchable: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  rateBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rateText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  nameContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  nameText: {
    color: "#fff",
    fontSize: 12,
    width: "100%",
    textAlign: "center",
  },
});

export default AnimatedStoreCard;
