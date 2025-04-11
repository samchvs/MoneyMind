import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { moveLogoUp, fadeInMoneyMind } from './Actions'; 

export default function LoadingPage() {
  const logoPosition = useRef(new Animated.Value(0)).current;
  const moneyMindOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    moveLogoUp(logoPosition);
    fadeInMoneyMind(moneyMindOpacity);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image 
        source={require('./assets/logo.png')} 
        style={[styles.logo, { transform: [{ translateY: logoPosition }] }]} 
      />

      <Animated.Image 
        source={require('./assets/MoneyMind.png')} 
        style={[styles.moneyMind, { opacity: moneyMindOpacity }]} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 350,
    height: 350,
    resizeMode: 'contain',
    marginTop: -100,
  },
  moneyMind: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
    marginTop: -100,
  },
});
