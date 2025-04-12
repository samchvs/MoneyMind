import { Animated } from 'react-native';

export const moveLogoUp = (animatedValue, toValue) => {
  Animated.timing(animatedValue, {
    toValue,         
    duration: 200,    
    useNativeDriver: true,
  }).start();
};

export const fadeInMoneyMind = (moneyMindOpacity) => {
  Animated.timing(moneyMindOpacity, {
    toValue: 1,      
    duration: 1500, 
    useNativeDriver: true,
  }).start();
};
