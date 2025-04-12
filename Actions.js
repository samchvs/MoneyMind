import { Animated } from 'react-native';


export const moveLogoUp = (animatedValue, toValue) => {
  Animated.timing(animatedValue, {
    toValue,         
    duration: 2000,    // Increased duration for smooth movement
    useNativeDriver: true,
  }).start();
};

// Fade in the MoneyMind logo
export const fadeInMoneyMind = (moneyMindOpacity) => {
  Animated.timing(moneyMindOpacity, {
    toValue: 1,      // Fade in to full opacity
    duration: 1500,  // Adjusted duration for smoother fade
    useNativeDriver: true,
  }).start();
};
