import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

const CircularCountdown = ({ duration = 10 }) => {
  const [remainingTime, setRemainingTime] = useState(duration);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // ทำให้หมุนต่อเนื่องเหมือนโหลด
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000, // ความเร็วหมุน (ms)
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // ตัวจับเวลานับถอยหลัง
    const interval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // แปลงค่าหมุน 0→360 องศา
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* เส้นวงกลมเทาพื้นหลัง */}
      <View style={styles.grayCircle} />

      {/* วงกลมแดงหมุน */}
      <Animated.View
        style={[
          styles.redCircle,
          {
            transform: [{ rotate: spin }],
          },
        ]}
      >
        <View style={styles.loaderArc} />
      </Animated.View>

      {/* ตัวเลขตรงกลาง */}
      <View style={styles.innerCircle}>
        <Text style={styles.timerText}>{Math.floor(remainingTime)}</Text>
      </View>
    </View>
  );
};

const SIZE = 40;

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grayCircle: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 4,
    borderColor: '#ccc',
  },
  redCircle: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderArc: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 4,
    borderColor: '#FA4A0C',
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  innerCircle: {
    width: SIZE - 10,
    height: SIZE - 10,
    borderRadius: (SIZE - 10) / 2,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CircularCountdown;
