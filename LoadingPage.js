import React from 'react';
import { StyleSheet, View, Image } from 'react-native';

export default function LoadingPage() {
  return (
    <View style={styles.container}>
      <Image 
        source={require('./assets/logo.png')} 
        style={styles.logo} 
      />

      <Image 
        source={require('./assets/MoneyMind.png')} 
        style={styles.moneyMind} 
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
