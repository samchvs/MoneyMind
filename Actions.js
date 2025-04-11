import { Animated } from 'react-native';

export const moveLogoUp = (animatedValue, distance) => {
  Animated.timing(animatedValue, {
    toValue: distance,  // Move by the given distance
    duration: 1000,
    useNativeDriver: true,
  }).start();
};

export const fadeInMoneyMind = (moneyMindOpacity) => {
  Animated.timing(moneyMindOpacity, {
    toValue: 1, 
    duration: 2000, 
    useNativeDriver: true,
  }).start();
};
