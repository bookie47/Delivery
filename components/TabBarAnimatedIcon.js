import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const TabBarAnimatedIcon = ({ name, color, size, focused }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1.15 : 1,
        useNativeDriver: true,
        friction: 6,
        tension: 120,
      }),
      Animated.timing(opacity, {
        toValue: focused ? 1 : 0.8,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
};

export default TabBarAnimatedIcon;

