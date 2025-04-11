import { Animated } from 'react-native';


export const moveLogoUp = (logoPosition) => {
  Animated.timing(logoPosition, {
    toValue: -20, 
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
