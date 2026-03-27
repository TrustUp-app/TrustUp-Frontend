import { View, Image, StyleSheet, Animated, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import { useEffect, useRef } from 'react';
import logo from '../../assets/trustUpLogo.png';

export default function Loader() {
  const spin = useRef(new Animated.Value(0)).current;
  const reverseSpin = useRef(new Animated.Value(0)).current;

  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const startSpin = () => {
    spin.setValue(0);

    Animated.timing(spin, {
      toValue: 1,
      duration: 1300,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(startSpin);
  };

  const startReverseSpin = () => {
    reverseSpin.setValue(0);

    Animated.timing(reverseSpin, {
      toValue: 1,
      duration: 1200,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(startReverseSpin);
  };

  const startPulse = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start(startPulse);
  };

  useEffect(() => {
    startSpin();
    startReverseSpin();
    startPulse();
  }, []);

  const spinRotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const reverseRotate = reverseSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  return (
    <View style={styles.overlay}>
      <BlurView intensity={45} style={StyleSheet.absoluteFill} />

      <Animated.View style={[styles.outerRing, { transform: [{ rotate: spinRotate }] }]} />

      <Animated.View style={[styles.innerRing, { transform: [{ rotate: reverseRotate }] }]} />

      <Animated.View
        style={[
          styles.logoWrapper,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}>
        <Image source={logo} style={styles.logo} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  outerRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: '#E5E7EB',
    borderTopColor: '#ff9c6e',
  },

  innerRing: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: '#E5E7EB',
    borderTopColor: '#1a9e6a',
  },

  logoWrapper: {
    position: 'absolute',
    transform: [{ translateY: 40 }],
  },

  logo: {
    width: 35,
    height: 35,
    borderRadius: 100,
  },
});
