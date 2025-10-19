import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

const FocusFade = ({ children, style, slide = true, duration = 220 }) => {
  const isFocused = useIsFocused();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(slide ? 8 : 0)).current;

  useEffect(() => {
    if (isFocused) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration, useNativeDriver: true }),
        slide ? Animated.timing(translateY, { toValue: 0, duration, useNativeDriver: true }) : undefined,
      ].filter(Boolean)).start();
    } else {
      opacity.setValue(0);
      if (slide) translateY.setValue(8);
    }
  }, [isFocused]);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
};

export default FocusFade;

